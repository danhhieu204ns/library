const express = require('express');
const { Book, Genre, Language, Publisher, Tag, Copy } = require('../models/Book');
const { auth, isStaff } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');
const router = express.Router();

// Get all books with search and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ max: 255 }).withMessage('Search term too long')
], async (req, res) => {
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
    
    const { search, genre, language, author, available, sort, featured } = req.query;
    const filter = {};
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (genre) filter.genre = genre;
    if (language) filter.language = language;
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
      .populate('language', 'language_name')
      .populate('publisher', 'publisher_name')
      .populate('tags', 'tag_name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(filter);

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
      }
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
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('genre', 'genre_name')
      .populate('language', 'language_name')
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

// Create new book (Staff only)
router.post('/', auth, isStaff, [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('genre').isMongoId().withMessage('Valid genre ID is required'),
  body('language').isMongoId().withMessage('Valid language ID is required'),
  body('total_copies').isInt({ min: 0 }).withMessage('Total copies must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const bookData = req.body;
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
      .populate('language', 'language_name')
      .populate('publisher', 'publisher_name')
      .populate('tags', 'tag_name');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book: populatedBook }
    });

  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

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
    console.error('Get languages error:', error);
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

module.exports = router;
