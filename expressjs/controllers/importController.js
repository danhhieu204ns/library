const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { Book, Genre, Language, Publisher } = require('../models/Book');
const { auditLog, saveAuditLog } = require('../middleware/auditLog');

/**
 * Import books from Excel file
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.importBooks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng tải lên file Excel' 
      });
    }

    // Đọc file Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      // Xóa file tạm sau khi xử lý
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({ 
        success: false, 
        message: 'File Excel không chứa dữ liệu' 
      });
    }

    // Mảng lưu kết quả import
    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      failures: [],
      updated: 0,
      created: 0,
      skipped: 0  // Thêm counter cho sách bị bỏ qua
    };

    // Map trường từ Excel sang đúng schema Book
    const fieldMap = {
      ISBN: 'isbn',
      Title: 'title',
      Author: 'author',
      Authors: 'author', // map cả Authors và Author về author
      Publisher: 'publisher',
      PublicationYear: 'publication_year',
      Description: 'description',
      TotalCopies: 'total_copies',
      AvailableCopies: 'available_copies',
      BookLanguage: 'book_language',
      Language: 'book_language', // map cả Language về book_language
      Genre: 'genre',
      Categories: 'genre', // map cả Categories về genre
      Tags: 'tags',
      CoverImageUrl: 'cover_image_url',
      // Thêm các trường khác nếu cần
    };

    // Xử lý từng dòng dữ liệu
    for (const row of data) {
      try {
        // Chuyển key về đúng tên trường schema
        const mappedRow = {};
        for (const key in row) {
          const mappedKey = fieldMap[key] || key.toLowerCase();
          mappedRow[mappedKey] = row[key];
        }

        // Log giá trị genre gốc
        console.log('Row:', row);
        console.log('Genre trước mapping:', mappedRow.genre);

        // Map author (ưu tiên lấy author, nếu không có thì lấy authors)
        if (!mappedRow.author && mappedRow.authors) {
          mappedRow.author = mappedRow.authors.split(',')[0].trim();
        }
        // Map genre (ưu tiên lấy genre, nếu không có thì lấy categories)
        if (!mappedRow.genre && mappedRow.categories) {
          const firstGenre = mappedRow.categories.split(',')[0].trim();
          if (firstGenre) mappedRow.genre = firstGenre;
        }
        
        // Nếu sau mapping mà genre là rỗng, tạo genre mặc định
        if (!mappedRow.genre || mappedRow.genre.trim() === '') {
          // Tạo một genre mặc định "Uncategorized" nếu không có genre
          try {
            let defaultGenre = await Genre.findOne({ genre_name: 'Uncategorized' });
            if (!defaultGenre) {
              defaultGenre = await Genre.create({ genre_name: 'Uncategorized', description: 'Thể loại mặc định cho sách thiếu thông tin' });
            }
            mappedRow.genre = defaultGenre._id;
            console.log('Đã gán genre mặc định:', defaultGenre._id);
          } catch (err) {
            results.failed++;
            results.failures.push({ row: row, error: `Không thể tạo thể loại mặc định: ${err.message}` });
            continue;
          }
        }
        // Log giá trị genre sau mapping
        console.log('Genre sau mapping (ObjectId):', mappedRow.genre);
        // Nếu sau mapping mà không có genre (ObjectId), báo lỗi rõ ràng
        if (!mappedRow.genre) {
          results.failed++;
          results.failures.push({ row: row, error: `Không xác định được thể loại (genre) cho dòng này. Giá trị genre: ${row.genre || row.Genre || ''}` });
          continue;
        }

        // Map book_language (nếu có book_language là tên)
        if (mappedRow.book_language && typeof mappedRow.book_language === 'string') {
          try {
            let langDoc = await Language.findOne({ language_name: mappedRow.book_language.trim() });
            if (!langDoc) {
              langDoc = await Language.create({ language_name: mappedRow.book_language.trim() });
            }
            mappedRow.book_language = langDoc._id;
          } catch (err) {
            console.log('Lỗi khi xử lý ngôn ngữ:', err.message);
            // Nếu có lỗi, xử lý với ngôn ngữ mặc định
            mappedRow.book_language = null; // Sẽ được xử lý ở phần dưới
          }
        }
        
        // Nếu không có language hoặc xử lý language bị lỗi, tạo ngôn ngữ mặc định
        if (!mappedRow.book_language) {
          try {
            let defaultLanguage = await Language.findOne({ language_name: 'Không xác định' });
            if (!defaultLanguage) {
              defaultLanguage = await Language.create({ language_name: 'Không xác định' });
            }
            console.log('Đã tìm/tạo ngôn ngữ mặc định:', defaultLanguage);
            mappedRow.book_language = defaultLanguage._id;
          } catch (err) {
            console.error('Lỗi khi tạo ngôn ngữ mặc định:', err);
            results.failed++;
            results.failures.push({ row: row, error: `Không thể tạo ngôn ngữ mặc định: ${err.message}` });
            continue;
          }
        }

        // Map publisher (nếu có publisher là tên)
        if (mappedRow.publisher && typeof mappedRow.publisher === 'string') {
          let pubDoc = await Publisher.findOne({ publisher_name: mappedRow.publisher.trim() });
          if (!pubDoc) {
            pubDoc = await Publisher.create({ publisher_name: mappedRow.publisher.trim() });
          }
          mappedRow.publisher = pubDoc._id;
        }

        // Kiểm tra dữ liệu bắt buộc - chỉ kiểm tra title
        if (!mappedRow.title) {
          results.failed++;
          results.failures.push({
            row: row,
            error: 'Thiếu thông tin bắt buộc (title)'
          });
          continue;
        }

        // Chỉ lấy các trường hợp lệ theo schema Book và set giá trị mặc định cho các trường thiếu
        const allowedFields = [
          'title', 'author', 'publisher', 'publication_year', 'isbn', 'genre', 'book_language',
          'description', 'total_copies', 'available_copies', 'cover_image_url', 'tags'
        ];
        const bookData = {};
        
        // Đảm bảo các trường bắt buộc luôn có giá trị
        bookData.title = mappedRow.title;
        
        // Xử lý đặc biệt cho genre
        if (typeof mappedRow.genre === 'string') {
          // Nếu vẫn là string, cần tạo hoặc tìm ObjectId tương ứng
          try {
            console.log('Xử lý genre tại bước cuối:', mappedRow.genre);
            let genreDoc = await Genre.findOne({ genre_name: mappedRow.genre.trim() });
            if (!genreDoc) {
              genreDoc = await Genre.create({ genre_name: mappedRow.genre.trim() });
            }
            bookData.genre = genreDoc._id;
            console.log('Đã set genre thành công:', bookData.genre);
          } catch (err) {
            console.error('Lỗi khi xử lý genre tại bước cuối:', err);
            // Sử dụng genre mặc định
            let defaultGenre = await Genre.findOne({ genre_name: 'Uncategorized' });
            if (!defaultGenre) {
              defaultGenre = await Genre.create({ 
                genre_name: 'Uncategorized', 
                description: 'Thể loại mặc định cho sách thiếu thông tin' 
              });
            }
            bookData.genre = defaultGenre._id;
          }
        } else {
          bookData.genre = mappedRow.genre; // Đã được xử lý ở trên
        }
        
        bookData.book_language = mappedRow.book_language; // Đã được xử lý ở trên
        bookData.author = mappedRow.author || 'Unknown';
        bookData.total_copies = mappedRow.total_copies !== undefined ? mappedRow.total_copies : 0;
        bookData.available_copies = mappedRow.available_copies !== undefined ? mappedRow.available_copies : 0;
        
        // Thêm các trường không bắt buộc
        if (mappedRow.publisher !== undefined) bookData.publisher = mappedRow.publisher;
        if (mappedRow.publication_year !== undefined) bookData.publication_year = mappedRow.publication_year;
        if (mappedRow.isbn !== undefined) bookData.isbn = mappedRow.isbn;
        if (mappedRow.description !== undefined) bookData.description = mappedRow.description;
        if (mappedRow.cover_image_url !== undefined) bookData.cover_image_url = mappedRow.cover_image_url;
        if (mappedRow.tags !== undefined) bookData.tags = mappedRow.tags;

        // Kiểm tra sách đã tồn tại chưa (dựa vào isbn hoặc title nếu không có isbn)
        const query = bookData.isbn ? { isbn: bookData.isbn } : { title: bookData.title };
        const existingBook = await Book.findOne(query);
        
        if (existingBook) {
          // Bỏ qua sách đã tồn tại
          results.skipped++;
          if (!results.skippedDetails) results.skippedDetails = [];
          results.skippedDetails.push({ 
            isbn: bookData.isbn || 'N/A', 
            title: bookData.title 
          });
        } else {
          // Tạo sách mới
          try {
            console.log('Dữ liệu sách sắp tạo:', JSON.stringify(bookData, null, 2));
            const book = new Book(bookData);
            await book.save();
            results.success++;
            results.created++;
            if (!results.createdDetails) results.createdDetails = [];
            results.createdDetails.push({ 
              isbn: bookData.isbn || 'N/A', 
              title: bookData.title,
              id: book._id
            });
          } catch (err) {
            console.error('Lỗi chi tiết khi tạo sách:', err);
            // In ra thông tin chi tiết về các trường gây lỗi
            console.error('Thông tin genre:', typeof bookData.genre, bookData.genre);
            console.error('Thông tin book_language:', typeof bookData.book_language, bookData.book_language);
            
            results.failed++;
            results.failures.push({ 
              row: row, 
              bookData: bookData,
              error: 'Lỗi khi tạo mới: ' + err.message,
              errorStack: err.stack
            });
          }
        }
      } catch (err) {
        results.failed++;
        results.failures.push({ row: row, error: err.message });
      }
    }

    // Xóa file tạm sau khi xử lý
    fs.unlinkSync(req.file.path);

    // Ghi log hoạt động
    await saveAuditLog({
      userId: req.user.id,
      action: 'IMPORT_BOOKS',
      resourceType: 'BOOK',
      target: 'books',
      description: `Đã import ${results.success}/${results.total} sách từ file Excel (${results.created} mới, ${results.skipped} bỏ qua)`,
      metadata: { results }
    });

    return res.status(200).json({ 
      success: true, 
      message: `Đã import ${results.success}/${results.total} sách (${results.created} mới, ${results.skipped} bỏ qua)`, 
      results,
      debug: {
        createdDetails: results.createdDetails || [],
        skippedDetails: results.skippedDetails || [],
        failures: results.failures || []
      }
    });
  } catch (err) {
    console.error('Import books error:', err);
    
    // Xóa file tạm nếu có lỗi
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi import sách', 
      error: err.message 
    });
  }
};

/**
 * Download template Excel file for book import
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.downloadTemplate = (req, res) => {
  const templatePath = path.join(__dirname, '../templates/books-import-template.xlsx');
  
  // Kiểm tra xem file template có tồn tại không
  if (!fs.existsSync(templatePath)) {
    // Tạo file template mới nếu chưa có
    const workbook = xlsx.utils.book_new();
    const data = [
      {
        title: 'Example Book',
        ISBN: '9781234567897',
        authors: 'Author 1, Author 2',
        publisher: 'Example Publisher',
        publicationYear: 2023,
        description: 'Book description here',
        totalCopies: 10,
        availableCopies: 10,
        genre: 'Fiction', // Sử dụng đúng tên cột genre
        language: 'Tiếng Việt', // Sửa 'vi' thành tên ngôn ngữ đầy đủ
        coverImageUrl: 'https://example.com/cover.jpg'
      }
    ];
    
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Books');
    
    // Thêm chú thích về cấu trúc file
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const commentCell = xlsx.utils.encode_cell({ r: range.e.r + 2, c: 0 });
    worksheet[commentCell] = { v: 'Các trường bắt buộc: title, ISBN', t: 's' };
    
    // Lưu file template
    xlsx.writeFile(workbook, templatePath);
  }
  
  res.download(templatePath, 'books-import-template.xlsx');
};
