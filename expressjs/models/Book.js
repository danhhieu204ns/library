const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  genre_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const languageSchema = new mongoose.Schema({
  language_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  }
});

const publisherSchema = new mongoose.Schema({
  publisher_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 255
  },
  address: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const tagSchema = new mongoose.Schema({
  tag_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  }
}, {
  timestamps: true
});

const bookLocationSchema = new mongoose.Schema({
  shelf_number: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  row_number: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  level_number: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher'
  },
  publication_year: {
    type: Number,
    min: 1000,
    max: new Date().getFullYear() + 1
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 20
  },
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: true
  },
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  total_copies: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  available_copies: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  cover_image_url: {
    type: String,
    trim: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  total_reviews: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

const copyStatusSchema = new mongoose.Schema({
  status_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Available', 'Borrowed', 'Reserved', 'Lost', 'Damaged', 'Maintenance']
  },
  description: {
    type: String,
    trim: true
  }
});

const copySchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookLocation'
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Borrowed', 'Reserved', 'Lost', 'Damaged', 'Maintenance'],
    default: 'Available'
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 100
  },
  condition_notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ genre: 1, language: 1 });
bookSchema.index({ available_copies: 1 });
copySchema.index({ book: 1, status: 1 });

const Genre = mongoose.model('Genre', genreSchema);
const Language = mongoose.model('Language', languageSchema);
const Publisher = mongoose.model('Publisher', publisherSchema);
const Tag = mongoose.model('Tag', tagSchema);
const BookLocation = mongoose.model('BookLocation', bookLocationSchema);
const Book = mongoose.model('Book', bookSchema);
const CopyStatus = mongoose.model('CopyStatus', copyStatusSchema);
const Copy = mongoose.model('Copy', copySchema);

module.exports = {
  Genre,
  Language,
  Publisher,
  Tag,
  BookLocation,
  Book,
  CopyStatus,
  Copy
};
