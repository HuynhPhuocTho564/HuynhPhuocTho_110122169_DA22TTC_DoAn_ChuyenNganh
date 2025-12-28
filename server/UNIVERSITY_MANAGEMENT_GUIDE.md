# 🏫 University Management Guide

## Tổng quan

University Management APIs cho phép SUPER_ADMIN quản lý các trường đại học trong hệ thống multi-tenant.

---

## 🎯 Use Cases

### 1. Thêm trường mới vào hệ thống
**Khi nào:** Khi có trường đại học mới muốn sử dụng hệ thống

**Quy trình:**
1. SUPER_ADMIN tạo trường mới
2. Tạo tài khoản UNI_ADMIN cho trường đó
3. UNI_ADMIN import sinh viên
4. UNI_ADMIN tạo học bổng

### 2. Cập nhật thông tin trường
**Khi nào:** Đổi logo, hotline, địa chỉ

### 3. Khóa trường tạm thời
**Khi nào:** Trường vi phạm quy định, nợ phí, hoặc tạm ngưng hoạt động

**Tác động:**
- Sinh viên không thể nộp hồ sơ mới
- Cán bộ không thể tạo học bổng mới
- Dữ liệu cũ vẫn giữ nguyên

### 4. Xóa trường
**Khi nào:** Trường rút khỏi hệ thống và đã chuyển toàn bộ dữ liệu

**Điều kiện:**
- Không còn users nào
- Không còn học bổng nào

---

## 📋 API Endpoints

### 1. Tạo trường mới

**POST** `/api/universities`

**Headers:**
```
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "code": "HCMUT",
  "name": "Đại học Bách Khoa TP.HCM",
  "logo_url": "https://example.com/hcmut-logo.png",
  "phone": "028-38647256",
  "address": "268 Lý Thường Kiệt, P.14, Q.10, TP.HCM"
}
```

**Validation Rules:**
- `code`: 
  - Bắt buộc
  - Chỉ chữ HOA và số
  - Không trùng với trường khác
  - VD hợp lệ: CTU, HCMUT, UIT, VNUHCM
  - VD không hợp lệ: ctu, Ctu, CTU-123

- `name`: Bắt buộc

**Response Success:**
```json
{
  "success": true,
  "message": "Tạo trường đại học thành công",
  "data": {
    "id": 2,
    "code": "HCMUT",
    "name": "Đại học Bách Khoa TP.HCM",
    "status": "ACTIVE",
    "created_at": "2024-12-06T..."
  }
}
```

**Response Error (Trùng mã):**
```json
{
  "success": false,
  "message": "Mã trường \"HCMUT\" đã tồn tại trong hệ thống"
}
```

---

### 2. Danh sách trường

**GET** `/api/universities?page=1&limit=10&search=bách&status=ACTIVE`

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Query Parameters:**
- `page`: Số trang (default: 1)
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
        "id": 2,
        "code": "HCMUT",
        "name": "Đại học Bách Khoa TP.HCM",
        "logo_url": "...",
        "phone": "028-38647256",
        "address": "...",
        "status": "ACTIVE",
        "student_count": 150,
        "scholarship_count": 5,
        "created_at": "2024-12-06T..."
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Đặc biệt:**
- `student_count`: Tự động đếm số sinh viên ACTIVE
- `scholarship_count`: Tự động đếm số học bổng

---

### 3. Chi tiết trường

**GET** `/api/universities/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "code": "HCMUT",
    "name": "Đại học Bách Khoa TP.HCM",
    "logo_url": "...",
    "phone": "028-38647256",
    "address": "...",
    "status": "ACTIVE",
    "created_at": "2024-12-06T...",
    "faculties": [
      {"id": 1, "name": "Khoa Khoa học & Kỹ thuật Máy tính"},
      {"id": 2, "name": "Khoa Điện - Điện tử"}
    ],
    "stats": {
      "student_count": 150,
      "admin_count": 3,
      "scholarship_count": 5,
      "active_scholarship_count": 2
    }
  }
}
```

**Use case:** Xem tổng quan trường trước khi quyết định khóa/xóa

---

### 4. Cập nhật trường

**PUT** `/api/universities/:id`

**Headers:**
```
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: application/json
```

**Body:** (Chỉ gửi các field muốn cập nhật)
```json
{
  "name": "Đại học Bách Khoa TP.HCM (Cập nhật)",
  "phone": "028-12345678",
  "logo_url": "https://new-logo.png"
}
```

**Lưu ý:**
- Nếu đổi `code`, hệ thống sẽ kiểm tra trùng
- Không thể đổi `id`, `created_at`

---

### 5. Khóa/Mở khóa trường

**PUT** `/api/universities/:id/status`

**Headers:**
```
Authorization: Bearer <SUPER_ADMIN_TOKEN>
Content-Type: application/json
```

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
    "school": {
      "id": 2,
      "code": "HCMUT",
      "status": "LOCKED"
    },
    "warning": "Trường có 150 sinh viên và 2 học bổng đang hoạt động"
  }
}
```

**Tác động khi LOCKED:**
- ❌ Sinh viên không thể nộp hồ sơ mới
- ❌ UNI_ADMIN không thể tạo học bổng mới
- ✅ Dữ liệu cũ vẫn xem được
- ✅ Có thể mở khóa lại bất cứ lúc nào

**Mở khóa lại:**
```json
{
  "status": "ACTIVE"
}
```

---

### 6. Xóa trường

**DELETE** `/api/universities/:id`

**Headers:**
```
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response Success:**
```json
{
  "success": true,
  "message": "Xóa trường thành công"
}
```

**Response Error (Có users):**
```json
{
  "success": false,
  "message": "Không thể xóa trường có 150 người dùng. Vui lòng chuyển họ sang trường khác trước."
}
```

**Response Error (Có scholarships):**
```json
{
  "success": false,
  "message": "Không thể xóa trường có 5 học bổng. Vui lòng xóa học bổng trước."
}
```

**Quy trình xóa an toàn:**
1. Chuyển tất cả users sang trường khác
2. Xóa tất cả học bổng (hoặc chuyển sang trường khác)
3. Xóa trường

---

## 🔒 Security & Permissions

### Phân quyền

| Action | SUPER_ADMIN | UNI_ADMIN | STUDENT | SPONSOR |
|--------|-------------|-----------|---------|---------|
| Tạo trường | ✅ | ❌ | ❌ | ❌ |
| Xem danh sách | ✅ | ✅ | ✅ | ✅ |
| Xem chi tiết | ✅ | ✅ | ✅ | ✅ |
| Cập nhật | ✅ | ❌ | ❌ | ❌ |
| Khóa/Mở | ✅ | ❌ | ❌ | ❌ |
| Xóa | ✅ | ❌ | ❌ | ❌ |

### Validation

1. **Mã trường (code):**
   - Regex: `/^[A-Z0-9]+$/`
   - Chỉ chữ HOA và số
   - Không dấu, không khoảng trắng

2. **Unique Check:**
   - Mã trường không được trùng
   - Kiểm tra cả khi tạo mới và cập nhật

3. **Cascade Check:**
   - Không xóa được nếu có users
   - Không xóa được nếu có scholarships

---

## 🧪 Testing Scenarios

### Scenario 1: Tạo trường mới
```bash
# 1. Login as SUPER_ADMIN
POST http://localhost:5000/api/auth/login
Body: {"identifier": "superadmin", "password": "123456"}

# 2. Tạo trường
POST http://localhost:5000/api/universities
Header: Authorization: Bearer <token>
Body: {
  "code": "HCMUT",
  "name": "Đại học Bách Khoa TP.HCM",
  "phone": "028-38647256"
}

# 3. Verify
GET http://localhost:5000/api/universities
```

### Scenario 2: Khóa trường có dữ liệu
```bash
# 1. Xem chi tiết trường
GET http://localhost:5000/api/universities/1

# 2. Khóa trường
PUT http://localhost:5000/api/universities/1/status
Body: {"status": "LOCKED"}

# 3. Kiểm tra warning trong response
```

### Scenario 3: Thử xóa trường có users
```bash
# 1. Thử xóa
DELETE http://localhost:5000/api/universities/1

# 2. Nhận error message
# "Không thể xóa trường có 250 người dùng..."
```

---

## 💡 Best Practices

### 1. Đặt tên mã trường
- ✅ Ngắn gọn, dễ nhớ: CTU, HCMUT, UIT
- ✅ Chữ HOA: VNUHCM
- ❌ Tránh: ctu, Ctu, CTU-2024

### 2. Trước khi khóa trường
- Thông báo trước cho UNI_ADMIN
- Kiểm tra có học bổng đang mở không
- Xem số sinh viên đang hoạt động

### 3. Trước khi xóa trường
- Backup dữ liệu
- Chuyển users sang trường khác
- Xóa hoặc chuyển scholarships
- Kiểm tra lại lần cuối

### 4. Khi cập nhật thông tin
- Không nên đổi `code` sau khi đã có dữ liệu
- Cập nhật logo khi rebrand
- Cập nhật phone/address khi thay đổi

---

## 🎨 Frontend Suggestions

### University List Page
```jsx
<UniversityTable 
  data={universities}
  onEdit={handleEdit}
  onLock={handleLock}
  onDelete={handleDelete}
/>
```

### University Detail Page
```jsx
<UniversityDetail 
  university={university}
  stats={stats}
  faculties={faculties}
/>
```

### Create/Edit Form
```jsx
<UniversityForm 
  mode="create" // or "edit"
  initialData={university}
  onSubmit={handleSubmit}
/>
```

---

**University Management APIs đã sẵn sàng!** 🏫
