# 🎓 Scholarship Management System - Backend

Hệ thống quản lý học bổng cho sinh viên khó khăn - Backend API

## 🚀 Công nghệ sử dụng

- **Node.js** v18+
- **Express.js** - Web framework
- **MySQL** - Database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## 📦 Cài đặt

### 1. Clone project và cài dependencies

```bash
cd server
npm install
```

### 2. Cấu hình Database

Tạo database MySQL:
```sql
CREATE DATABASE scholarship_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Cập nhật file `.env`:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=scholarship_system
DB_DIALECT=mysql

JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
```

### 3. Chạy SQL schema

Import file SQL schema vào database (file schema bạn đã cung cấp)

### 4. Seed dữ liệu mẫu

```bash
npm run seed
```

Lệnh này sẽ tạo:
- 1 trường đại học (Đại học Cần Thơ)
- 3 tài khoản test (SUPER_ADMIN, UNI_ADMIN, STUDENT)
- Cấu trúc Khoa > Ngành > Lớp

### 5. Chạy server

**Development mode (auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 🧪 Test API

### Cách 1: Dùng Thunder Client (VS Code Extension)

1. Cài extension "Thunder Client"
2. Tạo request mới
3. Gọi API theo tài liệu trong `API_DOCUMENTATION.md`

### Cách 2: Dùng cURL

**Đăng nhập:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"superadmin\",\"password\":\"123456\"}"
```

**Lấy danh sách học bổng:**
```bash
curl http://localhost:5000/api/scholarships \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Cấu trúc thư mục

```
server/
├── src/
│   ├── config/          # Cấu hình database
│   ├── constants/       # Hằng số (roles, status)
│   ├── controllers/     # Controllers (xử lý request/response)
│   ├── middlewares/     # Middlewares (auth, validation)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic layer
│   ├── utils/           # Helper functions
│   ├── seeders/         # Seed data scripts
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── package.json
└── README.md
```

## 🔐 Tài khoản test

Sau khi chạy `npm run seed`:

| Role | Username | Password | Mô tả |
|------|----------|----------|-------|
| SUPER_ADMIN | superadmin | 123456 | Quản trị hệ thống |
| UNI_ADMIN | admin_ctu | 123456 | Cán bộ ĐH Cần Thơ |
| STUDENT | B2014595 | 123456 | Sinh viên |

## 📚 API Documentation

Xem chi tiết tại: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Các API đã implement:

✅ **Authentication**
- POST `/api/auth/login` - Đăng nhập
- GET `/api/auth/me` - Lấy profile
- PUT `/api/auth/change-password` - Đổi mật khẩu

✅ **User Management**
- POST `/api/users/create-uni-admin` - Tạo cán bộ trường
- GET `/api/users` - Danh sách users
- PUT `/api/users/:id/status` - Khóa/Mở tài khoản

✅ **Scholarships**
- POST `/api/scholarships` - Tạo học bổng
- GET `/api/scholarships` - Danh sách học bổng
- GET `/api/scholarships/:id` - Chi tiết học bổng
- PUT `/api/scholarships/:id` - Cập nhật học bổng
- DELETE `/api/scholarships/:id` - Xóa học bổng

## 🎯 Các API cần implement tiếp

- [ ] Application APIs (Nộp hồ sơ, xét duyệt)
- [ ] Upload file (Minh chứng)
- [ ] Notification APIs
- [ ] Statistics APIs
- [ ] Sponsor APIs

## 🛠️ Scripts

```bash
npm start       # Chạy production
npm run dev     # Chạy development với nodemon
npm run seed    # Seed dữ liệu mẫu
```

## ⚠️ Lưu ý

1. **Bảo mật**: Đổi `JWT_SECRET` trong production
2. **CORS**: Cấu hình `CLIENT_URL` trong `.env` nếu frontend chạy khác port
3. **Database**: Backup database thường xuyên
4. **Logs**: Kiểm tra console logs để debug

## 🐛 Troubleshooting

**Lỗi kết nối database:**
- Kiểm tra MySQL đã chạy chưa
- Verify thông tin trong `.env`
- Đảm bảo database đã được tạo

**Lỗi "Token invalid":**
- Token có thể đã hết hạn (30 ngày)
- Đăng nhập lại để lấy token mới

**Port 5000 đã được sử dụng:**
- Đổi `PORT` trong `.env`
- Hoặc kill process đang dùng port 5000

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console logs của server
2. API Documentation
3. Database schema

---

**Phát triển bởi:** Senior Full-Stack Developer
**Ngày:** December 2024
