# Student management system

## 1. Giới thiệu

- Hệ thống quản lí sinh viên bao gồm đăng ký môn học, cập nhật điểm số

## 2. Phạm vi

**Module Quản lý Sinh viên:**
- Tạo, sửa, xóa thông tin sinh viên
- Xem điểm số và thời khóa biểu
- Đăng ký môn học (tối đa 6 môn/sinh viên)
- Gửi ý kiến/phản hồi

**Module Xác thực & Phân quyền:**
- Đăng nhập/Đăng xuất với username/password
- Phân quyền: Admin và Sinh viên
- Reset password qua email

**Module Quản lý Môn học:**
- Tạo, sửa, xóa môn học
- Tạo lớp học cho môn học (tối đa 3 lớp/môn)
- Quản lý thông tin môn học (mã môn, tên, số tín chỉ)

**Module Đăng ký Môn học (Enrollment):**
- Sinh viên đăng ký môn học
- Tạo và quản lý thời khóa biểu tự động
- Kiểm tra trùng lịch học

**Module Thông báo:**
- Admin gửi thông báo cho sinh viên (môn học mới, thay đổi lịch, v.v.)
- Sinh viên nhận và xem thông báo
- Sinh viên gửi ý kiến/phản hồi

**Nền tảng:**

- Web application
- Database: SQL Server
- Backend API: REST API

## 3. Actors & Use cases

### Actors

- Admin: quản trị hệ thống, toàn quyền, tạo môn học, thời khoá biểu, account, sửa thông tin, gửi thông báo và phản hồi
- Sinh viên: đăng nhập, đăng ký môn học, xem thời khoá biểu và điểm, sửa thông tin cá nhân và gửi ý kiến

### Use case

**Chức năng của Admin**

- Cung cấp account cho sinh viên, và gửi qua email
- tạo môn học và lớp cho mỗi môn học (3 lớp mỗi môn)
- tạo và sắp xếp thời khoá biểu cho sinh viên
- gửi thông báo cho sinh viên (môn học được tạo, đổi thời khoá biểu,...)
- gửi reset password link cho sinh viên
- cập nhật điểm

**Chức năng của sinh viên**

- Đăng nhập
- Đổi thông tin cá nhân bao gồm mật khẩu
- đăng ký học (1 sinh viên max 6 môn)
- xem điểm 
- xem thời khoá 
- gửi ý kiến

## Non functional requirements

- Repsone time nhanh < 3000ms
- Mã hoá mật khẩu bằng bcrypt
- JWT authentication