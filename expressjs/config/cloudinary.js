const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yen_library/book_covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 700, crop: 'limit' }]
  }
});

// Tạo middleware multer upload
const upload = multer({ storage: storage });

module.exports = {
  cloudinary,
  upload
};
