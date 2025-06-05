const express = require('express');
const router = express.Router();
const { Reservation, ReservationStatus } = require('../models/Transaction');
const { Book, Copy } = require('../models/Book');
const { User } = require('../models/User');
const { auth, isStaff } = require('../middleware/auth');

// Get reservations (with filtering and pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { user_id, status, book_id } = req.query;
    const filter = {};

    // If not admin/staff, only show current user's reservations
    if (!['Admin', 'CTV'].includes(req.user.role)) {
      filter.user = req.user._id;
    } else if (user_id) {
      filter.user = user_id;
    }

    if (status) filter.status = status;
    if (book_id) filter.book = book_id;

    const reservations = await Reservation.find(filter)
      .populate('book', 'title author isbn cover_image available_copies total_copies')
      .populate('user', 'username full_name email')
      .populate('handled_by', 'username full_name')
      .populate('assigned_copy', 'copy_number status')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      data: reservations,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new reservation
router.post('/', auth, async (req, res) => {
  try {
    const { book_id, notes } = req.body;

    // Validate input
    if (!book_id) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Check if book exists
    const book = await Book.findById(book_id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if user already has an active reservation for this book
    const existingReservation = await Reservation.findOne({
      user: req.user._id,
      book: book_id,
      status: { $in: ['Pending', 'Ready'] }
    });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active reservation for this book'
      });
    }

    // Check user reservation limits (max 3 active reservations)
    const currentReservations = await Reservation.countDocuments({
      user: req.user._id,
      status: { $in: ['Pending', 'Ready'] }
    });

    if (currentReservations >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You have reached maximum reservation limit (3 books)'
      });
    }

    // Check if book is available (if so, suggest borrowing instead)
    if (book.available_copies > 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is currently available. Please borrow it directly instead of reserving.'
      });
    }

    // Calculate queue position
    const queuePosition = await Reservation.countDocuments({
      book: book_id,
      status: 'Pending'
    }) + 1;

    // Set expiry date (7 days from now)
    const expiry_date = new Date();
    expiry_date.setDate(expiry_date.getDate() + 7);

    // Create reservation
    const reservation = new Reservation({
      book: book_id,
      user: req.user._id,
      status: 'Pending',
      queue_position: queuePosition,
      expiry_date,
      notes
    });

    await reservation.save();

    // Populate the response
    await reservation.populate([
      { path: 'book', select: 'title author isbn cover_image' },
      { path: 'user', select: 'username full_name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Book reserved successfully',
      data: reservation
    });

  } catch (error) {
    console.error('Reserve book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Cancel reservation
router.delete('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check access permissions
    if (!['Admin', 'CTV'].includes(req.user.role) && 
        reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!['Pending', 'Ready'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this reservation'
      });
    }

    // Update reservation status
    reservation.status = 'Cancelled';
    reservation.handled_by = req.user._id;
    await reservation.save();

    // Update queue positions for other pending reservations of the same book
    await Reservation.updateMany(
      {
        book: reservation.book,
        status: 'Pending',
        queue_position: { $gt: reservation.queue_position }
      },
      { $inc: { queue_position: -1 } }
    );

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });

  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Fulfill reservation (mark as ready for pickup) - Staff only
router.put('/:id/fulfill', auth, isStaff, async (req, res) => {
  try {
    const { copy_id } = req.body;

    const reservation = await Reservation.findById(req.params.id)
      .populate('book')
      .populate('user', 'username full_name email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (reservation.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Reservation is not in pending status'
      });
    }

    // Validate copy if provided
    if (copy_id) {
      const copy = await Copy.findById(copy_id);
      if (!copy || copy.book.toString() !== reservation.book._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid copy for this book'
        });
      }

      if (copy.status !== 'Available') {
        return res.status(400).json({
          success: false,
          message: 'Copy is not available'
        });
      }

      reservation.assigned_copy = copy_id;
    }

    // Update reservation
    reservation.status = 'Ready';
    reservation.handled_by = req.user._id;
    reservation.notification_sent = false; // Reset notification flag

    // Set new expiry date (3 days to pick up)
    const pickup_expiry = new Date();
    pickup_expiry.setDate(pickup_expiry.getDate() + 3);
    reservation.expiry_date = pickup_expiry;

    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation marked as ready for pickup',
      data: reservation
    });

  } catch (error) {
    console.error('Fulfill reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get specific reservation details
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('book', 'title author isbn cover_image')
      .populate('user', 'username full_name email')
      .populate('handled_by', 'username full_name')
      .populate('assigned_copy', 'copy_number status location');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check access permissions
    if (!['Admin', 'CTV'].includes(req.user.role) && 
        reservation.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: reservation
    });

  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
