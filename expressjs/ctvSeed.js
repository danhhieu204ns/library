/**
 * Script to create CTV users with formatted usernames
 * Username format: last name + first letters of first/middle names
 * Example: Mai Danh Hiếu -> hieumd
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const { User } = require('./models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community_library');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Function to generate username from full name
const generateUsername = (fullName) => {
  const nameParts = fullName.trim().split(' ');
  
  if (nameParts.length === 1) {
    return nameParts[0].toLowerCase();
  }
  
  // Get the last name (last part)
  const lastName = nameParts[nameParts.length - 1].toLowerCase();
  
  // Get the first letter of each part except the last name
  const initials = nameParts.slice(0, -1).map(part => part.charAt(0).toLowerCase()).join('');
  
  // Format: lastName + initials
  return lastName + initials;
};

// Function to normalize Vietnamese characters
const normalizeVietnamese = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Sample CTV data - you can replace with your own data
const ctvData = [
  {
    "fullName": "Mai Thúy Linh",
    "email": "linh.m@yenlibrary.com"
  },
  {
    "fullName": "Đoàn Thu Hoài",
    "email": "hoai.d@yenlibrary.com"
  },
  {
    "fullName": "Mai Lan Anh",
    "email": "anh.m@yenlibrary.com"
  },
  {
    "fullName": "Đỗ Mai Anh",
    "email": "anh.do@yenlibrary.com"
  },
  {
    "fullName": "Mai Ngọc Phượng ",
    "email": "phuong.m@yenlibrary.com"
  },
  {
    "fullName": "Trần Huyền Vy",
    "email": "vy.t@yenlibrary.com"
  },
  {
    "fullName": "Đỗ Hoài Phương",
    "email": "phuong.d@yenlibrary.com"
  },
  {
    "fullName": "Vũ Hồng Loan",
    "email": "loan.v@yenlibrary.com"
  },
  {
    "fullName": "Nguyễn Quỳnh Anh",
    "email": "anh.n@yenlibrary.com"
  },
  {
    "fullName": "Lưu Tuyết Minh",
    "email": "minh.l@yenlibrary.com"
  },
  {
    "fullName": "Lê Thị Minh Thanh",
    "email": "thanh.l@yenlibrary.com"
  },
  {
    "fullName": "Trương Ngọc Diệp",
    "email": "diep.t@yenlibrary.com"
  },
  {
    "fullName": "Đào Châu Anh",
    "email": "anh.d@yenlibrary.com"
  },
  {
    "fullName": "Nguyễn Ngọc Mai",
    "email": "mai.n@yenlibrary.com"
  },
  {
    "fullName": "Mai Thị Đào",
    "email": "dao.m@yenlibrary.com"
  },
  {
    "fullName": "Trần Trang",
    "email": "trang.t@yenlibrary.com"
  },
  {
    "fullName": "Phương Hoa",
    "email": "hoa.p@yenlibrary.com"
  },
  {
    "fullName": "Phạm Quỳnh Anh",
    "email": "anh.p@yenlibrary.com"
  },
  {
    "fullName": "Phạm Nguyễn Ánh Vân",
    "email": "van.p@yenlibrary.com"
  },
  {
    "fullName": "Nguyễn Thị Đan Lê",
    "email": "le.n@yenlibrary.com"
  },
  {
    "fullName": "Mai Vũ Thủy Tiên",
    "email": "tien.m@yenlibrary.com"
  },
  {
    "fullName": "Phạm Ánh Nhi",
    "email": "nhi.p@yenlibrary.com"
  },
  {
    "fullName": "Đặng Tuyết Mai",
    "email": "mai.d@yenlibrary.com"
  },
  {
    "fullName": "Nguyễn Thị An",
    "email": "an.n@yenlibrary.com"
  },
  {
    "fullName": "Đới Thùy Dương",
    "email": "duong.d@yenlibrary.com"
  },
  {
    "fullName": "Mai Gia Huy ",
    "email": "huy.m@yenlibrary.com"
  },
  {
    "fullName": "Trần Trâm Đan",
    "email": "dan.t@yenlibrary.com"
  },
  {
    "fullName": "Hàn Thảo Khanh",
    "email": "khanh.h@yenlibrary.com"
  },
  {
    "fullName": "Hoàng Yến Nhi",
    "email": "nhi.h@yenlibrary.com"
  }
]

// Create CTV users
const createCTVUsers = async () => {
  try {
    await connectDB();
    
    console.log('Starting CTV user creation...');
    
    // Check if users already exist
    const existingUsers = await User.find({ role: 'CTV' });
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} existing CTV users. Removing them...`);
      await User.deleteMany({ role: 'CTV', username: { $ne: 'ctv' } }); // Keep the default 'ctv' user
    }
    
    // Generate password hash (same password for all CTVs: 'ctv123')
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('ctv123', salt);
    
    // Create users from CTV data
    const ctvUsers = ctvData.map(ctv => {
      const rawUsername = generateUsername(ctv.fullName);
      const username = normalizeVietnamese(rawUsername);
      
      return {
        username,
        email: ctv.email,
        password_hash: passwordHash,
        role: 'CTV',
        full_name: ctv.fullName,
        status: 'Active',
        registration_date: new Date()
      };
    });
    
    // Insert CTV users into database
    const result = await User.insertMany(ctvUsers);
    
    console.log(`Successfully created ${result.length} CTV users:`);
    result.forEach(user => {
        console.log(user.username);
    // console.log(`- ${user.full_name} (${user.username}) - Password: ctv123`);
    });
    
  } catch (error) {
    console.error('Error creating CTV users:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Execute the function
createCTVUsers();
