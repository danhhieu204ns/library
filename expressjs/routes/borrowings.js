const express = require('express');
const router = express.Router();
const { Borrowing, BorrowingStatus } = require('../models/Transaction');
const { Book, Copy } = require('../models/Book');
const { User } = require('../models/User');
const { auth, isStaff, canAccessUserData } = require('../middleware/auth');

// Get borrowings (with filtering and pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { user_id, status, search } = req.query;
    const filter = {};

    // If not admin/staff, only show current user's borrowings
    if (!['Admin', 'CTV'].includes(req.user.role)) {
      filter.user = req.user._id;
    } else if (user_id) {
      filter.user = user_id;
    }

    if (status) filter.status = status;

    const borrowings = await Borrowing.find(filter)
      .populate({
        path: 'copy',
        populate: {
          path: 'book',
          select: 'title author isbn cover_image'
        }
      })
      .populate('user', 'username full_name email')
      .populate('handled_by', 'username full_name')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Borrowing.countDocuments(filter);

    res.json({
      success: true,
      data: borrowings,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Get borrowings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new borrowing (borrow a book)
router.post('/', auth, isStaff, async (req, res) => {
  try {
    const { user_id, copy_id, notes } = req.body;

    // Validate input
    if (!user_id || !copy_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Copy ID are required'
      });
    }

    // Check if user exists and is active
    const user = await User.findById(user_id);
    if (!user || user.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if copy exists and is available
    const copy = await Copy.findById(copy_id).populate('book');
    if (!copy) {
      return res.status(404).json({
        success: false,
        message: 'Copy not found'
      });
    }

    if (copy.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Copy is not available for borrowing'
      });
    }

    // Check user borrowing limits (max 5 books)
    const currentBorrowings = await Borrowing.countDocuments({
      user: user_id,
      status: 'Borrowed'
    });

    if (currentBorrowings >= 5) {
      return res.status(400).json({
        success: false,
        message: 'User has reached maximum borrowing limit (5 books)'
      });
    }

    // Check for overdue books
    const overdueBorrowings = await Borrowing.countDocuments({
      user: user_id,
      status: 'Borrowed',
      due_date: { $lt: new Date() }
    });

    if (overdueBorrowings > 0) {
      return res.status(400).json({
        success: false,
        message: 'User has overdue books. Please return them first.'
      });
    }

    // Calculate due date (14 days from now)
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 14);

    // Create borrowing record
    const borrowing = new Borrowing({
      copy: copy_id,
      user: user_id,
      due_date,
      status: 'Borrowed',
      handled_by: req.user._id,
      notes
    });

    await borrowing.save();

    // Update copy status
    copy.status = 'Borrowed';
    await copy.save();

    // Update book available copies count
    await Book.findByIdAndUpdate(copy.book._id, {
      $inc: { available_copies: -1 }
    });

    // Populate the response
    await borrowing.populate([
      {
        path: 'copy',
        populate: {
          path: 'book',
          select: 'title author isbn'
        }
      },
      { path: 'user', select: 'username full_name email' },
      { path: 'handled_by', select: 'username full_name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: borrowing
    });

  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Return a book
router.put('/:id/return', auth, isStaff, async (req, res) => {
  try {
    const { notes } = req.body;
    const borrowingId = req.params.id;

    // Find the borrowing record
    const borrowing = await Borrowing.findById(borrowingId)
      .populate('copy')
      .populate('user', 'username full_name email');

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found'
      });
    }

    if (borrowing.status !== 'Borrowed') {
      return res.status(400).json({
        success: false,
        message: 'Book is not currently borrowed'
      });
    }

    // Calculate fine if overdue
    let fine_amount = 0;
    const return_date = new Date();
    if (return_date > borrowing.due_date) {
      const daysOverdue = Math.ceil((return_date - borrowing.due_date) / (1000 * 60 * 60 * 24));
      fine_amount = daysOverdue * 1000; // 1000 VND per day
    }

    // Update borrowing record
    borrowing.return_date = return_date;
    borrowing.status = 'Returned';
    borrowing.fine_amount = fine_amount;
    borrowing.handled_by = req.user._id;
    if (notes) borrowing.notes = notes;

    await borrowing.save();

    // Update copy status
    const copy = await Copy.findById(borrowing.copy._id).populate('book');
    copy.status = 'Available';
    await copy.save();

    // Update book available copies count
    await Book.findByIdAndUpdate(copy.book._id, {
      $inc: { available_copies: 1 }
    });

    // Populate the response
    await borrowing.populate('handled_by', 'username full_name');

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: borrowing
    });

  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get specific borrowing details
router.get('/:id', auth, async (req, res) => {
  try {
    const borrowing = await Borrowing.findById(req.params.id)
      .populate({
        path: 'copy',
        populate: {
          path: 'book',
          select: 'title author isbn cover_image'
        }
      })
      .populate('user', 'username full_name email')
      .populate('handled_by', 'username full_name');

    if (!borrowing) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing record not found'
      });
    }

    // Check access permissions
    if (!['Admin', 'CTV'].includes(req.user.role) && 
        borrowing.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: borrowing
    });

  } catch (error) {
    console.error('Get borrowing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
