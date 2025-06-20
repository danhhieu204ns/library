const express = require('express');
const mongoose = require('mongoose');
const { Book, Genre, Language, Publisher, Tag, Copy } = require('../models/Book');
const { auth, isStaff } = require('../middleware/auth');
const { requirePermission, addUserPermissions } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');
const { PERMISSIONS } = require('../config/permissions');
const { body, validationResult, query } = require('express-validator');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// Get all books with search and filtering
router.get('/', 
  // auth, 
  // requirePermission(PERMISSIONS.BOOKS_VIEW),
  // addUserPermissions,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ max: 255 }).withMessage('Search term too long')
  ], 
  // auditLog('VIEW_BOOKS'),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const { search, genre, book_language, author, available, sort, featured } = req.query;
    const filter = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (genre) filter.genre = genre;
    if (book_language) filter.book_language = book_language;
    if (author) filter.author = { $regex: author, $options: 'i' };
    if (available === 'true') filter.available_copies = { $gt: 0 };
    
    // Featured books filter (books with high ratings or recent additions)
    if (featured === 'true') {
      filter.$or = [
        { average_rating: { $gte: 4 } },
        { total_reviews: { $gte: 3 } },
        { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // Last 30 days
      ];
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default sort
    if (search) {
      sortOption = { score: { $meta: 'textScore' } };
    } else if (sort) {
      switch (sort) {
        case '-rating':
          sortOption = { average_rating: -1, total_reviews: -1 };
          break;
        case 'rating':
          sortOption = { average_rating: 1, total_reviews: 1 };
          break;
        case '-title':
          sortOption = { title: -1 };
          break;
        case 'title':
          sortOption = { title: 1 };
          break;
        case '-author':
          sortOption = { author: -1 };
          break;
        case 'author':
          sortOption = { author: 1 };
          break;
        case '-date':
          sortOption = { createdAt: -1 };
          break;
        case 'date':
          sortOption = { createdAt: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const books = await Book.find(filter)
      .populate('genre', 'genre_name')
      .populate('book_language', 'language_name')
      .populate('publisher', 'publisher_name')
      .populate('tags', 'tag_name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);    const total = await Book.countDocuments(filter);

    // Add permission context to response
    // const userPermissions = req.userPermissions || [];
    // const canCreate = userPermissions.includes(PERMISSIONS.BOOKS_CREATE);
    // const canEdit = userPermissions.includes(PERMISSIONS.BOOKS_EDIT);
    // const canDelete = userPermissions.includes(PERMISSIONS.BOOKS_DELETE);
    // const canBulk = userPermissions.includes(PERMISSIONS.BOOKS_BULK_ACTIONS);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      // meta: {
      //   permissions: userPermissions.filter(p => p.startsWith('books:')),
      //   canCreate,
      //   canEdit,
      //   canDelete,
      //   canBulk,
      //   userRole: req.frontendRole
      // }
    });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get book by ID
router.get('/:id', 
  // auth, 
  // requirePermission(PERMISSIONS.BOOKS_VIEW),
  // auditLog('VIEW_BOOK_DETAIL'),
  async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('genre', 'genre_name')
      .populate('book_language', 'language_name')
      .populate('publisher', 'publisher_name')
      .populate('tags', 'tag_name');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Get available copies
    const copies = await Copy.find({ book: book._id, status: 'Available' })
      .populate('location');

    res.json({
      success: true,
      data: {
        book,
        available_copies: copies
      }
    });

  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new book
router.post('/', 
  auth, 
  requirePermission(PERMISSIONS.BOOKS_CREATE),
  upload.single('cover_image'), // Add multer middleware to handle file upload
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('genre').isMongoId().withMessage('Valid genre ID is required'),
    body('book_language').isMongoId().withMessage('Valid language ID is required'),
    body('publisher').optional(), // Make publisher optional and handle conversion in route
    body('total_copies').isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer')
  ], 
  auditLog('CREATE_BOOK'),
  async (req, res) => {try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }    const bookData = req.body;
    
    // Handle publisher - if it's a string name rather than an ID
    if (bookData.publisher && typeof bookData.publisher === 'string' && !mongoose.Types.ObjectId.isValid(bookData.publisher)) {
      // Check if the publisher exists or create it
      let publisher = await Publisher.findOne({ publisher_name: bookData.publisher });
      if (!publisher) {
        publisher = new Publisher({ publisher_name: bookData.publisher });
        await publisher.save();
      }
      bookData.publisher = publisher._id;
    }
      // Handle cover image if it was uploaded
    if (req.file) {
      console.log('File uploaded:', req.file);
      // Store the Cloudinary URL in the book data
      bookData.cover_image_url = req.file.path;
    } else {
      console.log('No file uploaded');
    }
      // Handle tags - ensure it's properly formatted as an array of ObjectIds
    if (bookData.tags) {
      if (typeof bookData.tags === 'string') {
        try {
          // Try to parse it if it's a JSON string
          let parsedTags;
          
          // Sometimes the tags might be double-stringified
          if (bookData.tags.startsWith('[') && bookData.tags.endsWith(']')) {
            parsedTags = JSON.parse(bookData.tags);
          } else if (bookData.tags.includes('["') || bookData.tags.includes("['")) {
            // This handles the case where the string is like: `[ '["h"]' ]`
            parsedTags = JSON.parse(JSON.parse(bookData.tags));
          } else {
            // Single tags may be passed directly
            parsedTags = [bookData.tags];
          }
          
          if (Array.isArray(parsedTags)) {
            // Create tags that don't exist yet
            const tagIds = [];
            for (const tagName of parsedTags) {
              if (tagName) {
                let tag = await Tag.findOne({ tag_name: tagName });
                if (!tag) {
                  tag = new Tag({ tag_name: tagName });
                  await tag.save();
                }
                tagIds.push(tag._id);
              }
            }
            bookData.tags = tagIds;
          } else {
            // If it's not an array after parsing, set to empty array
            bookData.tags = [];
          }
        } catch (e) {
          console.error('Error parsing tags:', e);
          // If parsing fails, set to empty array
          bookData.tags = [];
        }
      } else if (!Array.isArray(bookData.tags)) {
        bookData.tags = [];
      }
    }
    
    bookData.available_copies = bookData.total_copies || 0;

    const book = new Book(bookData);
    await book.save();

    // Create copies if total_copies > 0
    if (bookData.total_copies > 0) {
      const copies = [];
      for (let i = 0; i < bookData.total_copies; i++) {
        copies.push({
          book: book._id,
          status: 'Available'
        });
      }
      await Copy.insertMany(copies);
    }

    const populatedBook = await Book.findById(book._id)
      .populate('genre', 'genre_name')
      .populate('book_language', 'language_name')
      .populate('publisher', 'publisher_name')
      .populate('tags', 'tag_name');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book: populatedBook }
    });
  } catch (error) {
    console.error('Create book error:', error);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Server error';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.response) {
      errorMessage = error.response.data.message || 'Server error';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      errors: error.errors || {},
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update book
router.put('/:id', 
  auth, 
  requirePermission(PERMISSIONS.BOOKS_EDIT),
  upload.single('cover_image'), // Add multer middleware to handle file upload
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().notEmpty().withMessage('Author cannot be empty'),
    body('genre').optional().isMongoId().withMessage('Valid genre ID is required'),
    body('book_language').optional().isMongoId().withMessage('Valid language ID is required'),
    body('total_copies').optional().isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer')
  ], 
  auditLog('UPDATE_BOOK'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }      const bookId = req.params.id;
      const updateData = req.body;

      // Handle cover image if it was uploaded
      if (req.file) {
        // Get current book to check if we need to delete old image
        const currentBook = await Book.findById(bookId);
        if (currentBook && currentBook.cover_image_url && currentBook.cover_image_url.includes('cloudinary')) {
          try {
            // Extract public_id from the URL to delete old image
            const publicId = currentBook.cover_image_url.split('/').pop().split('.')[0];
            await require('cloudinary').v2.uploader.destroy(`yen_library/book_covers/${publicId}`);
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue with the update even if image deletion fails
          }
        }
        
        // Set new image URL
        updateData.cover_image_url = req.file.path;
      }      // Handle publisher like in the POST route
      if (updateData.publisher && typeof updateData.publisher === 'string' && !mongoose.Types.ObjectId.isValid(updateData.publisher)) {
        let publisher = await Publisher.findOne({ publisher_name: updateData.publisher });
        if (!publisher) {
          publisher = new Publisher({ publisher_name: updateData.publisher });
          await publisher.save();
        }
        updateData.publisher = publisher._id;
      }
      
      // Handle tags - ensure it's properly formatted as an array of ObjectIds
      if (updateData.tags) {
        if (typeof updateData.tags === 'string') {
          try {
            // Try to parse it if it's a JSON string
            let parsedTags;
            
            // Sometimes the tags might be double-stringified
            if (updateData.tags.startsWith('[') && updateData.tags.endsWith(']')) {
              parsedTags = JSON.parse(updateData.tags);
            } else if (updateData.tags.includes('["') || updateData.tags.includes("['")) {
              // This handles the case where the string is like: `[ '["h"]' ]`
              parsedTags = JSON.parse(JSON.parse(updateData.tags));
            } else {
              // Single tags may be passed directly
              parsedTags = [updateData.tags];
            }
            
            if (Array.isArray(parsedTags)) {
              // Create tags that don't exist yet
              const tagIds = [];
              for (const tagName of parsedTags) {
                if (tagName) {
                  let tag = await Tag.findOne({ tag_name: tagName });
                  if (!tag) {
                    tag = new Tag({ tag_name: tagName });
                    await tag.save();
                  }
                  tagIds.push(tag._id);
                }
              }
              updateData.tags = tagIds;
            } else {
              // If it's not an array after parsing, set to empty array
              updateData.tags = [];
            }
          } catch (e) {
            console.error('Error parsing tags:', e);
            // If parsing fails, set to empty array
            updateData.tags = [];
          }
        } else if (!Array.isArray(updateData.tags)) {
          updateData.tags = [];
        }
      }

      const book = await Book.findByIdAndUpdate(
        bookId, 
        updateData, 
        { new: true, runValidators: true }
      )
        .populate('genre', 'genre_name')
        .populate('book_language', 'language_name')
        .populate('publisher', 'publisher_name')
        .populate('tags', 'tag_name');

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }

      res.json({
        success: true,
        message: 'Book updated successfully',
        data: { book }
      });    } catch (error) {
      console.error('Update book error:', error);
      
      // Provide more detailed error information for debugging
      let errorMessage = 'Server error';
      if (error.name === 'ValidationError') {
        errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
      } else if (error.response) {
        errorMessage = error.response.data.message || 'Server error';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        errors: error.errors || {},
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// Delete book
router.delete('/:id', 
  auth, 
  requirePermission(PERMISSIONS.BOOKS_DELETE),
  auditLog('DELETE_BOOK'),
  async (req, res) => {
    try {      const bookId = req.params.id;      
      
      // Check if book has active borrowings or reservations
      const { Borrowing, Reservation } = require('../models/Transaction');
        // Check for active borrowings
      const activeBorrowings = await Borrowing.findOne({
        'copy': { $in: await Copy.find({ book: bookId }).select('_id') },
        status: { $in: ['Borrowed', 'Overdue'] }
      });
      
      // Check for active reservations
      const activeReservations = await Reservation.findOne({
        book: bookId,
        status: { $in: ['Pending', 'Ready'] }
      });

      if (activeBorrowings || activeReservations) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete book with active borrowings or reservations'
        });
      }      // Delete associated copies first
      await Copy.deleteMany({ book: bookId });
      
      // Delete associated reviews
      const { Review } = require('../models/Review');
      await Review.deleteMany({ book: bookId });

      // Delete the book
      const book = await Book.findByIdAndDelete(bookId);

      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found'
        });
      }

      res.json({
        success: true,
        message: 'Book deleted successfully'
      });

    } catch (error) {
      console.error('Delete book error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Bulk actions for books
router.post('/bulk-actions', 
  auth, 
  requirePermission(PERMISSIONS.BOOKS_BULK_ACTIONS),
  [
    body('action').isIn(['delete', 'update', 'export']).withMessage('Invalid action'),
    body('bookIds').isArray({ min: 1 }).withMessage('Book IDs array is required'),
    body('bookIds.*').isMongoId().withMessage('Invalid book ID format')
  ],
  auditLog('BULK_BOOK_ACTIONS'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { action, bookIds, updateData } = req.body;

      switch (action) {
        case 'delete':
          // Check for active borrowings
          const activeBorrowings = await require('../models/Transaction').find({
            book: { $in: bookIds },
            status: { $in: ['Borrowed', 'Reserved'] }
          });

          if (activeBorrowings.length > 0) {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete books with active borrowings or reservations'
            });
          }

          await Copy.deleteMany({ book: { $in: bookIds } });
          await Book.deleteMany({ _id: { $in: bookIds } });
          
          res.json({
            success: true,
            message: `${bookIds.length} books deleted successfully`
          });
          break;

        case 'update':
          if (!updateData) {
            return res.status(400).json({
              success: false,
              message: 'Update data is required for bulk update'
            });
          }

          const result = await Book.updateMany(
            { _id: { $in: bookIds } },
            updateData,
            { runValidators: true }
          );

          res.json({
            success: true,
            message: `${result.modifiedCount} books updated successfully`,
            data: { modifiedCount: result.modifiedCount }
          });
          break;

        case 'export':
          const books = await Book.find({ _id: { $in: bookIds } })
            .populate('genre', 'genre_name')
            .populate('language', 'language_name')
            .populate('publisher', 'publisher_name')
            .select('title author isbn genre language publisher total_copies available_copies');

          res.json({
            success: true,
            message: 'Books exported successfully',
            data: { books }
          });
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid action'
          });
      }

    } catch (error) {
      console.error('Bulk action error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Get genres
router.get('/meta/genres', async (req, res) => {
  try {
    const genres = await Genre.find().sort({ genre_name: 1 });
    res.json({
      success: true,
      data: { genres }
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get languages
router.get('/meta/languages', async (req, res) => {
  try {
    const languages = await Language.find().sort({ language_name: 1 });
    res.json({
      success: true,
      data: { languages }
    });
  } catch (error) {
    console.error('Get languags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get publishers
router.get('/meta/publishers', async (req, res) => {
  try {
    const publishers = await Publisher.find().sort({ publisher_name: 1 });
    res.json({
      success: true,
      data: { publishers }
    });
  } catch (error) {
    console.error('Get publishers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ tag_name: 1 });
    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
