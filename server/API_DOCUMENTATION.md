# 📚 API Documentation - Scholarship Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
Tất cả các API (trừ `/auth/login`) đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your_token>
```

---

## 1️⃣ AUTHENTICATION APIs

### 1.1 Đăng nhập
**POST** `/auth/login`

**Body:**
```json
{
  "identifier": "superadmin",  // username hoặc email
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": 1,
      "username": "superadmin",
      "email": "admin@system.com",
      "role": "SUPER_ADMIN",
      "school_id": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Lấy thông tin user hiện tại
**GET** `/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "superadmin",
    "role": "SUPER_ADMIN",
    "school": null,
    "studentProfile": null
  }
}
```

### 1.3 Đổi mật khẩu
**PUT** `/auth/change-password`

**Body:**
```json
{
  "oldPassword": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

---

## 2️⃣ USER MANAGEMENT APIs

### 2.1 Tạo tài khoản UNI_ADMIN
**POST** `/users/create-uni-admin`

**Quyền:** SUPER_ADMIN

**Body:**
```json
{
  "username": "admin_hcmut",
  "email": "admin@hcmut.edu.vn",
  "password": "123456",
  "school_id": 1
}
```

### 2.2 Lấy danh sách users
**GET** `/users?page=1&limit=20&search=admin&roleFilter=STUDENT`

**Quyền:** SUPER_ADMIN, UNI_ADMIN

**Query Params:**
- `page`: Trang hiện tại (default: 1)
- `limit`: Số lượng/trang (default: 20)
- `search`: Tìm kiếm theo username/email
- `roleFilter`: Lọc theo role (SUPER_ADMIN, UNI_ADMIN, STUDENT, SPONSOR)

### 2.3 Khóa/Mở khóa tài khoản
**PUT** `/users/:id/status`

**Body:**
```json
{
  "status": "LOCKED"  // hoặc "ACTIVE"
}
```

---

## 3️⃣ SCHOLARSHIP APIs

### 3.1 Tạo học bổng mới
**POST** `/scholarships`

**Quyền:** UNI_ADMIN, SUPER_ADMIN

**Body:**
```json
{
  "name": "Học bổng Khuyến khích học tập HK1 2024-2025",
  "semester": "HK1",
  "academic_year": "2024-2025",
  "amount_per_slot": 5000000,
  "slots": 50,
  "description": "Dành cho sinh viên có GPA >= 3.0",
  "criteria_json": {
    "min_gpa": 3.0,
    "min_drr": 70,
    "require_poor": false
  },
  "start_date": "2024-12-01T00:00:00Z",
  "end_date": "2024-12-31T23:59:59Z",
  "fund_id": null
}
```

### 3.2 Lấy danh sách học bổng
**GET** `/scholarships?page=1&status=OPEN&search=khuyến`

**Quyền:** Tất cả roles

**Query Params:**
- `page`: Trang
- `limit`: Số lượng/trang
- `status`: DRAFT, OPEN, CLOSED, FINISHED
- `search`: Tìm theo tên

**Response:**
```json
{
  "success": true,
  "data": {
    "scholarships": [...],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

### 3.3 Xem chi tiết học bổng
**GET** `/scholarships/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Học bổng HKHT",
    "amount_per_slot": 5000000,
    "slots": 50,
    "school": {
      "id": 1,
      "name": "Đại học Cần Thơ"
    },
    "stats": {
      "total_applications": 120,
      "approved_applications": 45,
      "remaining_slots": 5
    }
  }
}
```

### 3.4 Cập nhật học bổng
**PUT** `/scholarships/:id`

**Quyền:** UNI_ADMIN, SUPER_ADMIN

**Body:** (Các trường muốn cập nhật)
```json
{
  "status": "OPEN",
  "description": "Mô tả mới"
}
```

### 3.5 Xóa học bổng
**DELETE** `/scholarships/:id`

**Quyền:** UNI_ADMIN, SUPER_ADMIN

**Lưu ý:** Chỉ xóa được nếu chưa có đơn nào

---

## 4️⃣ APPLICATION APIs (Nộp hồ sơ & Xét duyệt)

### 4.1 Nộp hồ sơ
**POST** `/applications`

**Quyền:** STUDENT

**Body:**
```json
{
  "scholarship_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nộp hồ sơ thành công! Vui lòng chờ kết quả xét duyệt",
  "data": {
    "id": 1,
    "scholarship_id": 1,
    "student_id": 1,
    "status": "PENDING",
    "system_score": 75.5,
    "snapshot_data": {
      "full_name": "Nguyễn Văn A",
      "gpa": 3.25,
      "drr": 85,
      "poor_cert_type": "POOR"
    }
  }
}
```

**Logic đặc biệt:**
- ✅ **Data Snapshot**: Đóng băng dữ liệu sinh viên tại thời điểm nộp
- ✅ **Auto Scoring**: Tự động tính điểm ưu tiên (GPA 40% + DRR 20% + Hoàn cảnh 40%)
- ✅ **Validation**: Kiểm tra trùng lặp, hạn nộp, multi-tenant

### 4.2 Upload minh chứng
**POST** `/applications/:id/documents`

**Quyền:** STUDENT

**Headers:** `Content-Type: multipart/form-data`

**Body (Form Data):**
- `files`: File[] (Tối đa 5 files, mỗi file max 5MB)
- `type`: String (HO_NGHEO | BANG_DIEM | KHAC)

**Allowed file types:** JPG, PNG, PDF

### 4.3 Lịch sử hồ sơ của sinh viên
**GET** `/applications/my-history`

**Quyền:** STUDENT

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "system_score": 75.5,
      "submitted_at": "2024-12-06T...",
      "scholarship": {
        "name": "Học bổng HKHT HK1",
        "amount_per_slot": 5000000
      },
      "documents": [...]
    }
  ]
}
```

### 4.4 Danh sách hồ sơ (Cán bộ xét duyệt)
**GET** `/applications?page=1&status=PENDING&sortBy=system_score`

**Quyền:** UNI_ADMIN, SUPER_ADMIN

**Query Params:**
- `page`: Trang
- `limit`: Số lượng/trang
- `status`: PENDING | APPROVED | REJECTED | NEED_UPDATE
- `scholarshipId`: Lọc theo học bổng
- `search`: Tìm theo tên sinh viên
- `sortBy`: system_score (mặc định) | submitted_at

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": 1,
        "status": "PENDING",
        "system_score": 85.5,
        "snapshot_data": {
          "full_name": "Nguyễn Văn A",
          "gpa": 3.5,
          "poor_cert_type": "POOR"
        },
        "scholarship": {...},
        "student": {...}
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "totalPages": 6
    }
  }
}
```

### 4.5 Chi tiết hồ sơ
**GET** `/applications/:id`

**Quyền:** STUDENT (chỉ xem của mình), UNI_ADMIN, SUPER_ADMIN

### 4.6 Xét duyệt hồ sơ
**PUT** `/applications/:id/review`

**Quyền:** UNI_ADMIN, SUPER_ADMIN

**Body:**
```json
{
  "status": "APPROVED",
  "admin_note": "Hồ sơ đạt yêu cầu"
}
```

**Status values:**
- `APPROVED`: Duyệt (trúng tuyển)
- `REJECTED`: Từ chối (bắt buộc có admin_note)
- `NEED_UPDATE`: Yêu cầu bổ sung (bắt buộc có admin_note)

---

## 5️⃣ STATISTICS APIs (Dashboard & Báo cáo)

### 5.1 Dashboard tự động theo role
**GET** `/stats/dashboard`

**Quyền:** SUPER_ADMIN, UNI_ADMIN, SPONSOR

**Mô tả:** API thông minh tự động trả về dashboard phù hợp với role của user

**Response (SUPER_ADMIN):**
```json
{
  "success": true,
  "data": {
    "role": "SUPER_ADMIN",
    "stats": {
      "overview": {
        "total_schools": 5,
        "total_users": 1250,
        "total_students": 1000,
        "total_scholarships": 50,
        "total_applications": 3500,
        "total_disbursed": 17500000000
      },
      "users_by_role": [...],
      "scholarships_by_status": [...],
      "applications_by_status": [...],
      "top_schools": [...]
    }
  }
}
```

**Response (UNI_ADMIN):**
```json
{
  "success": true,
  "data": {
    "role": "UNI_ADMIN",
    "stats": {
      "overview": {
        "total_students": 250,
        "total_scholarships": 10,
        "total_applications": 850,
        "total_disbursed": 4250000000,
        "total_beneficiaries": 850
      },
      "scholarships_by_status": [...],
      "applications_by_status": [...],
      "pending_by_scholarship": [
        {
          "scholarship_name": "HBKK HK1",
          "pending_count": 120,
          "total_applications": 250
        }
      ],
      "top_students": [...],
      "by_circumstance": [...]
    }
  }
}
```

**Response (SPONSOR):**
```json
{
  "success": true,
  "data": {
    "role": "SPONSOR",
    "stats": {
      "overview": {
        "total_funds": 3,
        "total_contributed": 5000000000,
        "total_scholarships": 15,
        "total_recipients": 500,
        "total_disbursed": 2500000000
      },
      "scholarships": [...],
      "recipients_by_school": [
        {
          "school_name": "ĐH Cần Thơ",
          "count": 200,
          "total_amount": 1000000000
        }
      ],
      "scholarships_by_year": [...],
      "recent_recipients": [...]
    }
  }
}
```

### 5.2 Thống kê hệ thống
**GET** `/stats/system`

**Quyền:** SUPER_ADMIN

**Mô tả:** Thống kê tổng quan toàn hệ thống

**Dữ liệu bao gồm:**
- Tổng số trường, users, sinh viên
- Phân bố users theo role
- Phân bố học bổng theo status
- Phân bố hồ sơ theo status
- Tổng tiền đã giải ngân
- Top 5 trường có nhiều sinh viên nhất

### 5.3 Thống kê trường
**GET** `/stats/university`

**Quyền:** UNI_ADMIN

**Mô tả:** Thống kê chi tiết của một trường

**Dữ liệu bao gồm:**
- Tổng sinh viên, học bổng, hồ sơ
- Tổng tiền đã cấp, số người thụ hưởng
- Học bổng đang mở (cần xét duyệt)
- Top 5 sinh viên điểm cao nhất
- Phân bố theo hoàn cảnh (hộ nghèo, cận nghèo...)

**Use case:** Dashboard cho Cán bộ quản lý trường

### 5.4 Thống kê nhà tài trợ
**GET** `/stats/sponsor`

**Quyền:** SPONSOR

**Mô tả:** Báo cáo minh bạch cho nhà tài trợ

**Dữ liệu bao gồm:**
- Tổng số quỹ đã tài trợ
- Tổng số học bổng đang tài trợ
- Danh sách sinh viên đã nhận học bổng
- Phân bố theo trường
- Phân bố theo năm học
- 10 sinh viên nhận học bổng gần nhất

**Use case:** Nhà tài trợ xem tiền mình đã giúp được bao nhiêu sinh viên

---

## 📊 Dashboard Features

### SUPER_ADMIN Dashboard
- 📈 Tổng quan toàn hệ thống
- 🏫 Top trường có nhiều sinh viên
- 💰 Tổng tiền đã giải ngân
- 👥 Phân bố users theo role

### UNI_ADMIN Dashboard
- 📋 Hồ sơ chờ xét duyệt (theo học bổng)
- 🎓 Top sinh viên điểm cao
- 📊 Thống kê theo hoàn cảnh
- 💵 Tổng tiền đã cấp cho sinh viên

### SPONSOR Dashboard
- 💸 Tổng tiền đã đóng góp
- 🎯 Số sinh viên được hỗ trợ
- 🏫 Phân bố theo trường
- 📅 Phân bố theo năm học
- 👨‍🎓 Danh sách sinh viên nhận học bổng

---

## 6️⃣ UNIVERSITY MANAGEMENT APIs (Quản lý trường)

### 6.1 Tạo trường đại học mới
**POST** `/universities`

**Quyền:** SUPER_ADMIN

**Body:**
```json
{
  "code": "CTU",
  "name": "Đại học Cần Thơ",
  "logo_url": "https://example.com/ctu-logo.png",
  "phone": "0292-3831301",
  "address": "Khu II, đường 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ"
}
```

**Validation:**
- `code`: Bắt buộc, chỉ chữ HOA và số (VD: CTU, HCMUT)
- `name`: Bắt buộc
- `logo_url`, `phone`, `address`: Tùy chọn

**Response:**
```json
{
  "success": true,
  "message": "Tạo trường đại học thành công",
  "data": {
    "id": 1,
    "code": "CTU",
    "name": "Đại học Cần Thơ",
    "status": "ACTIVE",
    "created_at": "2024-12-06T..."
  }
}
```

### 6.2 Danh sách trường
**GET** `/universities?page=1&search=cần&status=ACTIVE`

**Quyền:** All roles (ai cũng xem được)

**Query Params:**
- `page`: Trang (default: 1)
- `limit`: Số lượng/trang (default: 20)
- `search`: Tìm theo tên hoặc mã trường
- `status`: ACTIVE | LOCKED

**Response:**
```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "id": 1,
        "code": "CTU",
        "name": "Đại học Cần Thơ",
        "logo_url": "...",
        "status": "ACTIVE",
        "student_count": 250,
        "scholarship_count": 10
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

**Đặc biệt:** Response tự động tính `student_count` và `scholarship_count`

### 6.3 Chi tiết trường
**GET** `/universities/:id`

**Quyền:** All roles

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "CTU",
    "name": "Đại học Cần Thơ",
    "logo_url": "...",
    "phone": "0292-3831301",
    "address": "...",
    "status": "ACTIVE",
    "faculties": [
      {"id": 1, "name": "Khoa CNTT&TT"}
    ],
    "stats": {
      "student_count": 250,
      "admin_count": 5,
      "scholarship_count": 10,
      "active_scholarship_count": 3
    }
  }
}
```

### 6.4 Cập nhật trường
**PUT** `/universities/:id`

**Quyền:** SUPER_ADMIN

**Body:** (Các trường muốn cập nhật)
```json
{
  "name": "Đại học Cần Thơ (Cập nhật)",
  "phone": "0292-1234567",
  "logo_url": "https://new-logo.png"
}
```

### 6.5 Khóa/Mở khóa trường
**PUT** `/universities/:id/status`

**Quyền:** SUPER_ADMIN

**Body:**
```json
{
  "status": "LOCKED"
}
```

**Response (có warning):**
```json
{
  "success": true,
  "message": "Đã khóa trường thành công",
  "data": {
    "school": {...},
    "warning": "Trường có 250 sinh viên và 3 học bổng đang hoạt động"
  }
}
```

**Use case:** Tạm khóa trường khi có vấn đề, nhưng không xóa dữ liệu

### 6.6 Xóa trường
**DELETE** `/universities/:id`

**Quyền:** SUPER_ADMIN

**Điều kiện:** Chỉ xóa được khi:
- Không có users nào thuộc trường
- Không có học bổng nào

**Response (nếu có dữ liệu):**
```json
{
  "success": false,
  "message": "Không thể xóa trường có 250 người dùng. Vui lòng chuyển họ sang trường khác trước."
}
```

---

## 🔐 Phân quyền (Roles)

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| **SUPER_ADMIN** | Quản trị hệ thống | Toàn quyền trên tất cả trường |
| **UNI_ADMIN** | Cán bộ trường | Quản lý học bổng, xét duyệt hồ sơ trong trường |
| **STUDENT** | Sinh viên | Xem học bổng, nộp hồ sơ |
| **SPONSOR** | Nhà tài trợ | Xem báo cáo minh bạch |

---

## 🧪 Test với Postman/Thunder Client

### Bước 1: Đăng nhập
```
POST http://localhost:5000/api/auth/login
Body: {"identifier": "superadmin", "password": "123456"}
```

### Bước 2: Copy token từ response

### Bước 3: Thêm token vào Header
```
Authorization: Bearer <token_vừa_copy>
```

### Bước 4: Gọi các API khác

---

## ⚠️ Error Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation error) |
| 401 | Unauthorized (Chưa đăng nhập hoặc token hết hạn) |
| 403 | Forbidden (Không có quyền) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 📝 Tài khoản test (sau khi chạy seed)

```
SUPER_ADMIN:
  Username: superadmin
  Password: 123456

UNI_ADMIN:
  Username: admin_ctu
  Password: 123456

STUDENT:
  Username: B2014595
  Password: 123456
```
