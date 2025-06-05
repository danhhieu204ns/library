const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  review_date: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Flag for moderation
  is_approved: {
    type: Boolean,
    default: true
  },
  // Flag for inappropriate content
  is_flagged: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reviewSchema.index({ book: 1, user: 1 }, { unique: true }); // One review per user per book
reviewSchema.index({ book: 1, is_approved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ review_date: -1 });

// Static method to calculate average rating for a book
reviewSchema.statics.calculateAverageRating = async function(bookId) {
  const result = await this.aggregate([
    { $match: { book: bookId, is_approved: true } },
    {
      $group: {
        _id: '$book',
        average_rating: { $avg: '$rating' },
        total_reviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    const { Book } = require('./Book');
    await Book.findByIdAndUpdate(bookId, {
      average_rating: Math.round(result[0].average_rating * 10) / 10, // Round to 1 decimal
      total_reviews: result[0].total_reviews
    });
    return result[0];
  } else {
    const { Book } = require('./Book');
    await Book.findByIdAndUpdate(bookId, {
      average_rating: 0,
      total_reviews: 0
    });
    return { average_rating: 0, total_reviews: 0 };
  }
};

// Middleware to update book ratings after save
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.book);
});

// Middleware to update book ratings after remove
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.book);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };
