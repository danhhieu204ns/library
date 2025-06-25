# Audit Logging System

Hệ thống ghi log hoạt động (audit logging) cho Yen Library API giúp theo dõi và ghi lại tất cả các hoạt động của người dùng trên hệ thống.

## Tính năng

- Tự động ghi log cho tất cả các API requests (trừ các public API)
- Ghi lại thông tin chi tiết: người dùng, hành động, thời gian, IP, endpoint, kết quả, v.v.
- Lọc các thông tin nhạy cảm (mật khẩu, token)
- API endpoints để quản lý và xem audit logs
- Chức năng dọn dẹp logs cũ tự động

## Cấu hình

### Public Endpoints

Các endpoints công khai sau sẽ không được ghi log:

- `GET /api/health` - Kiểm tra trạng thái hệ thống
- `GET /api/docs` - Tài liệu API
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/books/*` - Xem thông tin sách (public)
- `GET /api/reviews/*` - Xem đánh giá (public)

Để thêm/xóa public endpoints, chỉnh sửa mảng `PUBLIC_ENDPOINTS` trong file `middleware/auditLog.js`.

### Resource Types

Các loại tài nguyên được ghi log:

- `USER` - Người dùng
- `BOOK` - Sách
- `BORROWING` - Mượn sách
- `RESERVATION` - Đặt trước
- `SCHEDULE` - Lịch làm việc
- `REVIEW` - Đánh giá
- `ROLE` - Vai trò
- `SHIFT_REQUEST` - Yêu cầu ca làm việc
- `FILE` - File
- `SYSTEM` - Hệ thống
- `OTHER` - Khác

### Actions

Các hành động được ghi log:

- `CREATE` - Tạo mới
- `READ` - Đọc/Xem
- `UPDATE` - Cập nhật
- `DELETE` - Xóa
- `LOGIN` - Đăng nhập
- `LOGOUT` - Đăng xuất
- `ADMIN_ACTION` - Hành động quản trị
- `BORROW` - Mượn sách
- `RETURN` - Trả sách
- `RESERVE` - Đặt trước
- `CANCEL_RESERVATION` - Hủy đặt trước
- `IMPORT_BOOKS` - Nhập sách
- Và các hành động khác...

## API Endpoints

### Xem Audit Logs

```
GET /api/audit-logs
```

Query parameters:
- `page` - Số trang
- `limit` - Số lượng logs trên một trang
- `userId` - Lọc theo ID người dùng
- `action` - Lọc theo hành động
- `resource` - Lọc theo loại tài nguyên
- `resourceType` - Lọc theo loại tài nguyên (mới)
- `success` - Lọc theo kết quả (true/false)
- `startDate` - Lọc theo ngày bắt đầu
- `endDate` - Lọc theo ngày kết thúc
- `status` - Lọc theo trạng thái

### Xem Thống kê Audit Logs

```
GET /api/audit-logs/stats
```

### Xem Audit Logs của người dùng cụ thể

```
GET /api/audit-logs/user/:userId
```

### Dọn dẹp Audit Logs cũ

```
DELETE /api/audit-logs/cleanup?days=90
```

## Dọn dẹp tự động

Để dọn dẹp logs cũ tự động, bạn có thể thiết lập cron job để chạy script `scripts/cleanupAuditLogs.js` định kỳ:

```bash
# Chạy script với mặc định 90 ngày
node scripts/cleanupAuditLogs.js

# Hoặc chỉ định số ngày muốn giữ lại
node scripts/cleanupAuditLogs.js 30
```

## Sử dụng trong code

### Ghi log tự động

Middleware `autoAuditLogger` sẽ tự động ghi log cho tất cả các API requests (trừ các public API).

### Ghi log thủ công

```javascript
// Ghi log action của người dùng
await auditLogger.log(req, {
  action: 'CUSTOM_ACTION',
  resourceType: 'BOOK',
  resourceId: bookId,
  description: 'Mô tả hành động',
  details: { /* chi tiết bổ sung */ }
});

// Ghi log hệ thống
await auditLogger.logSystem({
  action: 'SYSTEM_ACTION',
  resourceType: 'SYSTEM',
  description: 'Mô tả hành động hệ thống',
  details: { /* chi tiết bổ sung */ }
});
```

## Security Considerations

- Audit logs được lưu trữ trong MongoDB
- Mật khẩu và thông tin nhạy cảm được lọc bỏ trước khi lưu
- Chỉ admin mới có quyền xem audit logs
- Hệ thống sử dụng index để tối ưu hiệu suất truy vấn
