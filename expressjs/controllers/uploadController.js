const { Book } = require('../models/Book');
const { cloudinary } = require('../config/cloudinary');

// Upload ảnh bìa sách lên Cloudinary và cập nhật URL trong Book model
exports.uploadBookCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
    }

    const bookId = req.params.bookId;
    
    // Kiểm tra xem sách có tồn tại không
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });
    }

    // Nếu sách đã có ảnh, xóa ảnh cũ khỏi Cloudinary
    if (book.cover_image_url && book.cover_image_url.includes('cloudinary')) {
      const publicId = book.cover_image_url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`yen_library/book_covers/${publicId}`);
    }

    // Cập nhật sách với URL ảnh mới
    book.cover_image_url = req.file.path;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Tải lên ảnh bìa sách thành công',
      data: {
        book_id: book._id,
        cover_image_url: book.cover_image_url
      }
    });
  } catch (error) {
    console.error('Lỗi khi tải lên ảnh bìa sách:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lên ảnh bìa sách',
      error: error.message
    });
  }
};

// Upload ảnh đơn giản không kết nối với sách
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
    }

    res.status(200).json({
      success: true,
      message: 'Tải lên ảnh thành công',
      data: {
        image_url: req.file.path
      }
    });
  } catch (error) {
    console.error('Lỗi khi tải lên ảnh:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lên ảnh',
      error: error.message
    });
  }
};
