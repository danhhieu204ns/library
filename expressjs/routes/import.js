const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const importController = require('../controllers/importController');

// Cấu hình multer để lưu file tạm thời
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Chỉ chấp nhận file excel
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file Excel (.xlsx, .xls)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter: fileFilter
});

// Route import sách từ file Excel
router.post('/books', auth, requirePermission('manage_books'), upload.single('excelFile'), importController.importBooks);

// Route để lấy template Excel
router.get('/books/template', auth, requirePermission('manage_books'), importController.downloadTemplate);

module.exports = router;
