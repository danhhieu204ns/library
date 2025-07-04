const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { 
  Genre, 
  Language, 
  Publisher, 
  Tag, 
  BookLocation,
  Book, 
  Copy 
} = require('./models/Book');

// Add User model import
const { User } = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community_library');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Starting database seeding...');
    // Clear existing data and indexes
    // await mongoose.connection.db.dropDatabase();
    // console.log('Dropped database');

    // Recreate collections
    await Genre.deleteMany({});
    await Language.deleteMany({});
    await Publisher.deleteMany({});
    await Tag.deleteMany({});
    await BookLocation.deleteMany({});
    await Book.deleteMany({});
    await Copy.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data');

    // Create Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const ctvPasswordHash = await bcrypt.hash('ctv123', salt);
    
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@yenlibrary.com',
        password_hash: adminPasswordHash,
        role: 'Admin',
        full_name: 'Admin User',
        permissions: [
          // Full permissions for admin
          { resource: 'books', actions: ['view', 'create', 'edit', 'delete'] },
          { resource: 'users', actions: ['view', 'create', 'edit', 'delete'] },
          { resource: 'borrowings', actions: ['view', 'create', 'edit', 'delete'] },
          { resource: 'reports', actions: ['view', 'create'] },
          { resource: 'settings', actions: ['view', 'edit'] },
          { resource: 'audit', actions: ['view'] }
        ]
      },
      {
        username: 'ctv',
        email: 'ctv@yenlibrary.com',
        password_hash: ctvPasswordHash,
        role: 'CTV',
        full_name: 'Staff User',
        permissions: [
          // Limited permissions for staff
          { resource: 'books', actions: ['view', 'create', 'edit'] },
          { resource: 'users', actions: ['view', 'edit'] },
          { resource: 'borrowings', actions: ['view', 'create', 'edit'] },
          { resource: 'reports', actions: ['view'] }
        ]
      }
    ]);

    console.log('Created users');

    // Create Genres
    const genres = await Genre.insertMany([
      { genre_name: 'Fiction', description: 'Works of imaginative narration' },
      { genre_name: 'Non-Fiction', description: 'Factual books and informational content' },
      { genre_name: 'Science Fiction', description: 'Futuristic and scientific themes' },
      { genre_name: 'Romance', description: 'Love stories and romantic themes' },
      { genre_name: 'Mystery', description: 'Suspenseful and crime-related stories' },
      { genre_name: 'Fantasy', description: 'Magical and mythical stories' },
      { genre_name: 'Biography', description: 'Life stories of real people' },
      { genre_name: 'History', description: 'Historical events and periods' },
      { genre_name: 'Self-Help', description: 'Personal development and improvement' },
      { genre_name: 'Technology', description: 'Technical and computer-related topics' }
    ]);

    console.log('Created genres');

    // Create Languages
    const languages = await Language.insertMany([
      { language_name: 'Vietnamese' },
      { language_name: 'English' },
      { language_name: 'French' },
      { language_name: 'Japanese' },
      { language_name: 'Chinese' },
      { language_name: 'Korean' }
    ]);

    console.log('Created languages');

    // Create Publishers
    const publishers = await Publisher.insertMany([
      { 
        publisher_name: 'Nhà xuất bản Trẻ',
        address: 'TP. Hồ Chí Minh, Việt Nam',
        website: 'https://nxbtre.com.vn'
      },
      { 
        publisher_name: 'Nhà xuất bản Kim Đồng',
        address: 'Hà Nội, Việt Nam',
        website: 'https://nxbkimdong.com.vn'
      },
      { 
        publisher_name: 'Penguin Random House',
        address: 'New York, USA',
        website: 'https://penguinrandomhouse.com'
      },
      { 
        publisher_name: 'HarperCollins',
        address: 'New York, USA',
        website: 'https://harpercollins.com'
      },
      { 
        publisher_name: 'Simon & Schuster',
        address: 'New York, USA',
        website: 'https://simonandschuster.com'
      }
    ]);

    console.log('Created publishers');

    // Create Tags
    const tags = await Tag.insertMany([
      { tag_name: 'Bestseller' },
      { tag_name: 'Award Winner' },
      { tag_name: 'New Release' },
      { tag_name: 'Classic' },
      { tag_name: 'Popular' },
      { tag_name: 'Educational' },
      { tag_name: 'Recommended' }
    ]);

    console.log('Created tags');

    // Create Book Locations
    const locations = await BookLocation.insertMany([
      { shelf_number: 'A1', row_number: '1', level_number: '1', description: 'Fiction Section - Top Shelf' },
      { shelf_number: 'A1', row_number: '1', level_number: '2', description: 'Fiction Section - Middle Shelf' },
      { shelf_number: 'A1', row_number: '1', level_number: '3', description: 'Fiction Section - Bottom Shelf' },
      { shelf_number: 'B1', row_number: '1', level_number: '1', description: 'Non-Fiction Section - Top Shelf' },
      { shelf_number: 'B1', row_number: '1', level_number: '2', description: 'Non-Fiction Section - Middle Shelf' },
      { shelf_number: 'C1', row_number: '1', level_number: '1', description: 'Science & Technology - Top Shelf' },
      { shelf_number: 'D1', row_number: '1', level_number: '1', description: 'Reference Section' }
    ]);

    console.log('Created book locations');

    // Create Books
    const sampleBooks = [
      {
        title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        author: 'Nguyễn Nhật Ánh',
        publisher: publishers.find(p => p.publisher_name === 'Nhà xuất bản Trẻ')._id,
        publication_year: 2010,
        isbn: '9786041037717',
        genre: genres.find(g => g.genre_name === 'Fiction')._id,
        book_language: languages.find(l => l.language_name === 'Vietnamese')._id, // Changed from language_id to language
        description: 'Cuốn tiểu thuyết nổi tiếng của nhà văn Nguyễn Nhật Ánh kể về tuổi thơ miền quê Việt Nam.',
        total_copies: 5,
        available_copies: 5,
        tags: [tags.find(t => t.tag_name === 'Popular')._id, tags.find(t => t.tag_name === 'Classic')._id]
      },
      {
        title: 'Mắt Biếc',
        author: 'Nguyễn Nhật Ánh',
        publisher: publishers.find(p => p.publisher_name === 'Nhà xuất bản Trẻ')._id,
        publication_year: 1990,
        isbn: '9786041037724',
        genre: genres.find(g => g.genre_name === 'Romance')._id,
        book_language: languages.find(l => l.language_name === 'Vietnamese')._id,
        description: 'Câu chuyện tình yêu đầu đời trong trẻo và đầy cảm xúc.',
        total_copies: 3,
        available_copies: 3,
        tags: [tags.find(t => t.tag_name === 'Classic')._id, tags.find(t => t.tag_name === 'Popular')._id]
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        publisher: publishers.find(p => p.publisher_name === 'HarperCollins')._id,
        publication_year: 1960,
        isbn: '9780060935467',
        genre: genres.find(g => g.genre_name === 'Fiction')._id,
        book_language: languages.find(l => l.language_name === 'English')._id,
        description: 'A gripping tale of racial injustice and childhood innocence in the American South.',
        total_copies: 4,
        available_copies: 4,
        tags: [tags.find(t => t.tag_name === 'Classic')._id, tags.find(t => t.tag_name === 'Award Winner')._id]
      },
      {
        title: '1984',
        author: 'George Orwell',
        publisher: publishers.find(p => p.publisher_name === 'Penguin Random House')._id,
        publication_year: 1949,
        isbn: '9780451524935',
        genre: genres.find(g => g.genre_name === 'Science Fiction')._id,
        book_language: languages.find(l => l.language_name === 'English')._id,
        description: 'A dystopian social science fiction novel about totalitarian control.',
        total_copies: 6,
        available_copies: 6,
        tags: [tags.find(t => t.tag_name === 'Classic')._id, tags.find(t => t.tag_name === 'Popular')._id]
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publisher: publishers.find(p => p.publisher_name === 'Simon & Schuster')._id,
        publication_year: 1925,
        isbn: '9780743273565',
        genre: genres.find(g => g.genre_name === 'Fiction')._id,
        book_language: languages.find(l => l.language_name === 'English')._id,
        description: 'A classic American novel set in the Jazz Age.',
        total_copies: 3,
        available_copies: 2,
        tags: [tags.find(t => t.tag_name === 'Classic')._id]
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        publisher: publishers.find(p => p.publisher_name === 'Penguin Random House')._id,
        publication_year: 1965,
        isbn: '9780441172719',
        genre: genres.find(g => g.genre_name === 'Science Fiction')._id,
        book_language: languages.find(l => l.language_name === 'English')._id,
        description: 'Epic science fiction novel set in the distant future.',
        total_copies: 4,
        available_copies: 4,
        tags: [tags.find(t => t.tag_name === 'Award Winner')._id, tags.find(t => t.tag_name === 'Popular')._id]
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        publisher: publishers.find(p => p.publisher_name === 'HarperCollins')._id,
        publication_year: 2011,
        isbn: '9780062316097',
        genre: genres.find(g => g.genre_name === 'History')._id,
        book_language: languages.find(l => l.language_name === 'English')._id,
        description: 'A fascinating exploration of human history and evolution.',
        total_copies: 5,
        available_copies: 5,
        tags: [tags.find(t => t.tag_name === 'Bestseller')._id, tags.find(t => t.tag_name === 'Educational')._id]
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        publisher: publishers.find(p => p.publisher_name === 'Penguin Random House')._id,
        publication_year: 2008,
        isbn: '9780132350884',
        genre: genres.find(g => g.genre_name === 'Technology')._id,
        book_language: languages.find(l => l.language_name === 'English')._id,
        description: 'A handbook of agile software craftsmanship.',
        total_copies: 3,
        available_copies: 3,
        tags: [tags.find(t => t.tag_name === 'Educational')._id, tags.find(t => t.tag_name === 'Recommended')._id]
      }
    ];

    const books = await Book.insertMany(sampleBooks);
    console.log('Created books');

    // Create Copies for each book
    for (const book of books) {
      const copies = [];
      for (let i = 0; i < book.total_copies; i++) {
        const locationIndex = Math.floor(Math.random() * locations.length);
        copies.push({
          book: book._id,
          location: locations[locationIndex]._id,
          status: i === 0 && book.title === 'The Great Gatsby' ? 'Borrowed' : 'Available',
          barcode: `${book._id.toString().slice(-6)}${String(i + 1).padStart(3, '0')}`
        });
      }
      await Copy.insertMany(copies);
    }

    console.log('Created book copies');

    // Update available_copies for The Great Gatsby (1 borrowed)
    await Book.findOneAndUpdate(
      { title: 'The Great Gatsby' },
      { available_copies: 2 }
    );

    console.log('Database seeding completed successfully!');
    
    // Display summary
    const bookCount = await Book.countDocuments();
    const copyCount = await Copy.countDocuments();
    const genreCount = await Genre.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('\n=== Seeding Summary ===');
    console.log(`👤 Users: ${userCount}`);
    console.log(`📚 Books: ${bookCount}`);
    console.log(`📄 Copies: ${copyCount}`);
    console.log(`🏷️  Genres: ${genreCount}`);
    console.log(`🌐 Languages: ${languages.length}`);
    console.log(`🏢 Publishers: ${publishers.length}`);
    console.log(`🏷️  Tags: ${tags.length}`);
    console.log(`📍 Locations: ${locations.length}`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();