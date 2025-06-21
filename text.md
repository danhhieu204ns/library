Collecting workspace information# Tài liệu đặc tả chức năng dự án Quản lý Thư viện Cộng đồng

## 1. Tổng quan dự án

### 1.1 Giới thiệu

Dự án "Quản lý Thư viện Cộng đồng" là một hệ thống toàn diện nhằm quản lý hoạt động của thư viện cộng đồng Yên, bao gồm việc quản lý sách, quản lý mượn trả, quản lý người dùng và các hoạt động khác của thư viện. Hệ thống được xây dựng với kiến trúc client-server, sử dụng công nghệ hiện đại để đáp ứng nhu cầu của thư viện cộng đồng.

### 1.2 Công nghệ sử dụng

- **Frontend**: ReactJS + Vite
- **Backend**: ExpressJS
- **Database**: MongoDB
- **Lưu trữ hình ảnh**: Cloudinary
- **Giao diện người dùng**: Tailwind CSS

### 1.3 Vai trò người dùng

Hệ thống có 3 vai trò chính:
- **Admin**: Có toàn quyền trên hệ thống
- **CTV (Cộng tác viên)**: Có quyền quản lý sách, xử lý mượn trả, xem báo cáo
- **Độc giả**: Có quyền xem sách, đặt mượn, quản lý tài khoản cá nhân

## 2. Kiến trúc hệ thống

### 2.1 Kiến trúc tổng thể

Hệ thống được xây dựng theo mô hình Client-Server:
- **Client**: ReactJS application
- **Server**: ExpressJS application
- **Database**: MongoDB

### 2.2 Cấu trúc dữ liệu

Hệ thống bao gồm các entity chính:
- Users (Người dùng)
- Books (Sách)
- Copies (Bản sao)
- Borrowings (Lượt mượn)
- Reservations (Đặt trước)
- Schedules (Lịch trực)
- Events (Sự kiện)
- Notifications (Thông báo)
- ActivityLogs (Nhật ký hoạt động)

## 3. Chức năng hệ thống

### 3.1 Quản lý người dùng & phân quyền

#### 3.1.1 Đăng ký/Đăng nhập/Đăng xuất
- Cho phép người dùng đăng ký tài khoản mới
- Xác thực người dùng thông qua đăng nhập
- Quản lý phiên đăng nhập/đăng xuất

#### 3.1.2 Quản lý thông tin cá nhân
- Xem và cập nhật thông tin cá nhân
- Đổi mật khẩu
- Tải lên ảnh đại diện

#### 3.1.3 Phân quyền
- Hệ thống phân quyền chi tiết cho Admin, CTV, Độc giả
- Admin có thể quản lý vai trò và quyền hạn của người dùng

### 3.2 Quản lý sách

#### 3.2.1 Thêm/sửa/xóa thông tin sách
- Thêm sách mới với thông tin chi tiết
- Cập nhật thông tin sách hiện có
- Xóa sách khỏi hệ thống

#### 3.2.2 Quản lý bản sao sách
- Thêm nhiều bản sao cho mỗi đầu sách
- Theo dõi trạng thái mỗi bản sao (có sẵn, đang mượn, mất, hỏng)
- Gán vị trí vật lý cho từng bản sao

#### 3.2.3 Tìm kiếm sách
- Tìm kiếm sách theo nhiều tiêu chí (tên, tác giả, ISBN, thể loại)
- Lọc kết quả tìm kiếm
- Xem chi tiết sách

#### 3.2.4 Đánh giá sách
- Người dùng có thể đánh giá sách
- Xem đánh giá của người khác

#### 3.2.5 Đề xuất sách mới
- Độc giả có thể đề xuất sách mới cho thư viện
- Admin/CTV xem xét và xử lý đề xuất

### 3.3 Quản lý mượn - trả & đặt trước

#### 3.3.1 Xử lý mượn sách
- CTV xác nhận cho độc giả mượn sách
- Theo dõi hạn trả
- Xử lý mượn hàng loạt

#### 3.3.2 Xử lý trả sách
- CTV xác nhận độc giả trả sách
- Kiểm tra quá hạn và tính phí phạt
- Xử lý trả hàng loạt

#### 3.3.3 Đặt trước sách
- Độc giả đặt trước sách đang có người mượn
- Quản lý hàng đợi đặt trước
- Thông báo khi sách đặt trước có sẵn

#### 3.3.4 Quản lý sách bị mất/hỏng
- Đánh dấu sách bị mất hoặc hỏng
- Xử lý bồi thường

#### 3.3.5 Lịch sử mượn trả
- Xem lịch sử mượn trả theo người dùng
- Xem lịch sử mượn trả theo sách

### 3.4 Quản lý lịch trực

#### 3.4.1 Đăng ký lịch trực
- CTV đăng ký ca trực
- Admin duyệt/từ chối lịch trực

#### 3.4.2 Chỉ định lịch trực
- Admin chỉ định lịch trực cho CTV
- Điều chỉnh lịch trực hiện tại

#### 3.4.3 Hiển thị lịch trực
- Xem lịch trực của thư viện
- Hiển thị giờ mở cửa dựa trên lịch trực

### 3.5 Thông báo & Nhắc nhở

#### 3.5.1 Thông báo hệ thống
- Tạo thông báo cho người dùng
- Quản lý trạng thái thông báo

#### 3.5.2 Nhắc nhở hạn trả
- Gửi nhắc nhở trước khi đến hạn trả
- Thông báo khi sách quá hạn

#### 3.5.3 Thông báo đặt trước
- Thông báo khi sách đặt trước có sẵn
- Thông báo khi lượt đặt trước hết hạn

### 3.6 Báo cáo & Thống kê

#### 3.6.1 Thống kê sách
- Thống kê số lượng sách theo thể loại
- Thống kê sách phổ biến

#### 3.6.2 Thống kê mượn trả
- Thống kê lượt mượn/trả theo thời gian
- Thống kê sách đang mượn/quá hạn

#### 3.6.3 Thống kê người dùng
- Thống kê hoạt động mượn trả của từng người dùng
- Thống kê người dùng tích cực

#### 3.6.4 Thống kê lịch trực
- Thống kê lịch trực của CTV
- Xem lịch sử trực

### 3.7 Cấu hình hệ thống

#### 3.7.1 Quản lý danh mục
- Quản lý các danh mục như thể loại, ngôn ngữ, nhà xuất bản
- Quản lý các trạng thái và quy tắc hệ thống

#### 3.7.2 Cài đặt hệ thống
- Cấu hình thông số hệ thống
- Quản lý sao lưu dữ liệu

### 3.8 Sự kiện & Hoạt động cộng đồng

#### 3.8.1 Quản lý sự kiện
- Tạo và quản lý sự kiện của thư viện
- Theo dõi đăng ký tham gia

#### 3.8.2 Đăng ký tham gia sự kiện
- Độc giả đăng ký tham gia sự kiện
- Hủy đăng ký tham gia

## 4. Giao diện người dùng

### 4.1 Giao diện chung

#### 4.1.1 Trang chủ
- Hiển thị thông tin chung về thư viện
- Hiển thị sách mới, sách phổ biến
- Hiển thị sự kiện sắp diễn ra

#### 4.1.2 Trang tìm kiếm sách
- Hiển thị form tìm kiếm với nhiều tiêu chí
- Hiển thị kết quả tìm kiếm dạng danh sách/lưới
- Hỗ trợ lọc và sắp xếp kết quả

#### 4.1.3 Trang chi tiết sách
- Hiển thị thông tin chi tiết về sách
- Hiển thị trạng thái các bản sao
- Hiển thị đánh giá và cho phép thêm đánh giá mới

### 4.2 Giao diện độc giả

#### 4.2.1 Dashboard độc giả
- Hiển thị tổng quan hoạt động
- Hiển thị sách đang mượn, sắp đến hạn

#### 4.2.2 Trang sách đang mượn
- Hiển thị danh sách sách đang mượn
- Hiển thị hạn trả và trạng thái

#### 4.2.3 Trang lịch sử mượn
- Hiển thị lịch sử mượn trả
- Lọc theo thời gian, trạng thái

#### 4.2.4 Trang đặt trước
- Hiển thị sách đã đặt trước
- Quản lý lượt đặt trước

#### 4.2.5 Trang đề xuất sách
- Form đề xuất sách mới
- Xem trạng thái đề xuất đã gửi

### 4.3 Giao diện cộng tác viên

#### 4.3.1 Dashboard CTV
- Hiển thị tổng quan công việc
- Hiển thị sách quá hạn, đặt trước chờ xử lý

#### 4.3.2 Trang quản lý sách
- Danh sách sách với chức năng thêm/sửa/xóa
- Quản lý bản sao sách

#### 4.3.3 Trang xử lý mượn/trả
- Giao diện xử lý mượn sách
- Giao diện xử lý trả sách

#### 4.3.4 Trang quản lý đặt trước
- Xem và xử lý các lượt đặt trước
- Gán bản sao cho lượt đặt trước

#### 4.3.5 Trang lịch trực
- Đăng ký lịch trực
- Xem lịch trực

### 4.4 Giao diện admin

#### 4.4.1 Dashboard admin
- Hiển thị tổng quan hệ thống
- Hiển thị các chỉ số quan trọng

#### 4.4.2 Trang quản lý người dùng
- Danh sách người dùng
- Thêm/sửa/xóa người dùng
- Phân quyền người dùng

#### 4.4.3 Trang quản lý lịch trực
- Xem, duyệt, từ chối, chỉ định lịch trực
- Quản lý ca trực

#### 4.4.4 Trang cấu hình hệ thống
- Cài đặt thông số hệ thống
- Quản lý danh mục

#### 4.4.5 Trang báo cáo
- Xem các báo cáo thống kê
- Xuất báo cáo

## 5. Yêu cầu phi chức năng

### 5.1 Hiệu năng
- Thời gian phản hồi nhanh cho các thao tác phổ biến
- Khả năng xử lý đồng thời nhiều người dùng
- Tối ưu hóa truy vấn cơ sở dữ liệu

### 5.2 Bảo mật
- Xác thực và phân quyền chặt chẽ
- Bảo vệ thông tin người dùng
- Ghi nhật ký hoạt động hệ thống

### 5.3 Khả năng sử dụng
- Giao diện thân thiện, dễ sử dụng
- Thiết kế responsive cho mọi thiết bị
- Hỗ trợ tiếp cận (accessibility)

### 5.4 Độ tin cậy
- Hệ thống hoạt động ổn định
- Sao lưu dữ liệu định kỳ
- Xử lý lỗi mạnh mẽ

### 5.5 Khả năng bảo trì
- Code sạch, dễ đọc, có comment đầy đủ
- Kiểm thử đầy đủ
- Tài liệu hóa đầy đủ

### 5.6 Khả năng mở rộng
- Kiến trúc module hóa
- Dễ dàng thêm tính năng mới
- Khả năng tích hợp với hệ thống khác

## 6. Kế hoạch triển khai

### 6.1 Phân chia giai đoạn
1. **Giai đoạn 1**: Xây dựng chức năng cơ bản - quản lý sách, quản lý người dùng
2. **Giai đoạn 2**: Phát triển chức năng mượn trả, đặt trước
3. **Giai đoạn 3**: Bổ sung chức năng lịch trực, thống kê báo cáo
4. **Giai đoạn 4**: Hoàn thiện chức năng sự kiện, thông báo và tối ưu hóa

### 6.2 Môi trường triển khai
- **Development**: Môi trường phát triển cục bộ
- **Staging**: Môi trường kiểm thử
- **Production**: Môi trường vận hành chính thức

### 6.3 Bảo trì và hỗ trợ
- Theo dõi lỗi và sửa lỗi
- Cập nhật tính năng định kỳ
- Hỗ trợ người dùng

## 7. Kết luận

Hệ thống Quản lý Thư viện Cộng đồng được thiết kế để đáp ứng đầy đủ nhu cầu quản lý của thư viện, từ quản lý sách, quản lý mượn trả đến quản lý người dùng và hoạt động cộng đồng. Với kiến trúc hiện đại và giao diện thân thiện, hệ thống sẽ giúp nâng cao hiệu quả hoạt động của thư viện và tạo trải nghiệm tốt hơn cho độc giả.