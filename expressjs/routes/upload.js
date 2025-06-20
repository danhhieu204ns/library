const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const uploadController = require('../controllers/uploadController');
const { auth, isStaff } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { PERMISSIONS } = require('../config/permissions');
const { auditLog } = require('../middleware/auditLog');

// Route để upload ảnh bìa sách
router.post('/book-cover/:bookId', 
  auth, 
  requirePermission(PERMISSIONS.BOOKS_EDIT),
  upload.single('image'), 
  auditLog('UPLOAD_BOOK_COVER'),
  uploadController.uploadBookCover
);

// Route để upload ảnh thông thường
router.post('/image', 
  auth, 
  upload.single('image'), 
  auditLog('UPLOAD_IMAGE'),
  uploadController.uploadImage
);

module.exports = router;
