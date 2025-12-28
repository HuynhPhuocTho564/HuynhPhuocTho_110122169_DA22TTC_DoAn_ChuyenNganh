# 🚀 Quick Start - Chạy ngay với Dữ liệu Thực tế

## Bước 1: Chuẩn bị Database

```bash
# Mở MySQL
mysql -u root -p

# Tạo database
CREATE DATABASE scholarship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

## Bước 2: Cấu hình .env

```bash
cd server
# Đảm bảo file .env có:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=scholarship_db
DB_PORT=3306
```

## Bước 3: Seed Dữ liệu Thực tế

```bash
cd server
npm run seed:all
```

Kết quả:
- ✅ 15 trường đại học thực tế
- ✅ 50+ học bổng thực tế
- ✅ 6 tài khoản admin
- ✅ 200-500 sinh viên với email .edu.vn

## Bước 4: Start Server

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

## Bước 5: Truy cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Bước 6: Đăng nhập

### Super Admin
```
Username: superadmin
Password: 123456
```

### University Admin
```
Username: admin_ctu (hoặc admin_vnu, admin_hust, v.v.)
Password: 123456
```

### Student
```
Username: B2020001 (hoặc bất kỳ mã sinh viên nào)
Password: 123456
Email: b2020001@ctu.edu.vn (tùy trường)
```

## 🎉 Xong!

Bây giờ bạn có:
- ✅ 15 trường đại học thực tế ở Việt Nam
- ✅ 50+ học bổng với tên và giá trị thực tế
- ✅ 200-500 sinh viên với tên, email .edu.vn thực tế
- ✅ Cấu trúc Khoa - Ngành - Lớp đầy đủ
- ✅ Tài khoản admin và sinh viên để test
- ✅ Hệ thống hoạt động đầy đủ

## 📋 Danh sách Học bổng

1. Học bổng Vingroup - 50 triệu
2. Học bổng Vallet - 15 triệu
3. Học bổng Odon Vallet - 10 triệu
4. Học bổng Tiếp sức Đến trường - 5 triệu
5. Học bổng Honda Y-E-S - 12 triệu
6. Và 45+ học bổng khác từ các trường

## 🏫 Danh sách Trường

1. Đại học Quốc gia Hà Nội
2. Đại học Bách Khoa Hà Nội
3. Đại học Quốc gia TP.HCM
4. Đại học Cần Thơ
5. Đại học Huế
6. Đại học Đà Nẵng
7. Đại học Kinh tế Quốc dân
8. Đại học Ngoại thương
9. Đại học Y Hà Nội
10. Đại học Sư phạm Hà Nội
11-15. Và 5 trường khác

---

**Chỉ 6 bước - 5 phút - Xong!** 🚀
