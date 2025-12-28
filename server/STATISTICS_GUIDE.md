# 📊 Statistics & Dashboard Guide

## Tổng quan

Statistics APIs cung cấp dashboard và báo cáo chi tiết cho 3 roles:
- **SUPER_ADMIN**: Thống kê toàn hệ thống
- **UNI_ADMIN**: Thống kê trường
- **SPONSOR**: Báo cáo minh bạch tài chính

---

## 🎯 Smart Dashboard API

### Endpoint
```
GET /api/stats/dashboard
```

### Đặc điểm
- **1 API phục vụ 3 roles** - Tự động detect role từ JWT token
- Trả về data phù hợp với từng role
- Giảm thiểu code duplication

### Cách sử dụng

**1. SUPER_ADMIN đăng nhập:**
```bash
# Login
POST /api/auth/login
Body: {"identifier": "superadmin", "password": "123456"}

# Lấy dashboard
GET /api/stats/dashboard
Header: Authorization: Bearer <token>
```

**Response:**
```json
{
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
    "users_by_role": [
      {"role": "STUDENT", "count": 1000},
      {"role": "UNI_ADMIN", "count": 50},
      {"role": "SPONSOR", "count": 10}
    ],
    "top_schools": [...]
  }
}
```

---

## 📈 SUPER_ADMIN Dashboard

### Dữ liệu hiển thị

#### 1. Overview Cards
- Tổng số trường đang hoạt động
- Tổng số users (tất cả roles)
- Tổng số sinh viên
- Tổng số học bổng
- Tổng số hồ sơ
- Tổng tiền đã giải ngân

#### 2. Users by Role (Pie Chart)
```json
[
  {"role": "STUDENT", "count": 1000},
  {"role": "UNI_ADMIN", "count": 50},
  {"role": "SPONSOR", "count": 10},
  {"role": "SUPER_ADMIN", "count": 2}
]
```

#### 3. Scholarships by Status (Bar Chart)
```json
[
  {"status": "OPEN", "count": 20, "total_amount": 100000000},
  {"status": "CLOSED", "count": 15, "total_amount": 75000000},
  {"status": "FINISHED", "count": 10, "total_amount": 50000000}
]
```

#### 4. Applications by Status (Donut Chart)
```json
[
  {"status": "PENDING", "count": 500},
  {"status": "APPROVED", "count": 850},
  {"status": "REJECTED", "count": 150},
  {"status": "NEED_UPDATE", "count": 50}
]
```

#### 5. Top 5 Schools (Table)
```json
[
  {
    "name": "ĐH Cần Thơ",
    "code": "CTU",
    "student_count": 250
  },
  {
    "name": "ĐH Bách Khoa HCM",
    "code": "HCMUT",
    "student_count": 200
  }
]
```

---

## 🏫 UNI_ADMIN Dashboard

### Dữ liệu hiển thị

#### 1. Overview Cards
- Tổng sinh viên của trường
- Tổng học bổng đã tạo
- Tổng hồ sơ nhận được
- Tổng tiền đã cấp
- Số sinh viên được hỗ trợ

#### 2. Pending Applications by Scholarship (Alert List)
```json
[
  {
    "scholarship_name": "HBKK HK1 2024-2025",
    "pending_count": 120,
    "total_applications": 250,
    "end_date": "2024-12-31"
  }
]
```

**Use case:** Cán bộ biết học bổng nào cần xét duyệt gấp

#### 3. Top 5 Students (Leaderboard)
```json
[
  {
    "system_score": 92.5,
    "snapshot_data": {
      "full_name": "Nguyễn Văn A",
      "gpa": 3.8,
      "poor_cert_type": "POOR"
    },
    "status": "PENDING"
  }
]
```

**Use case:** Xem nhanh sinh viên xuất sắc nhất

#### 4. By Circumstance (Pie Chart)
```json
[
  {"poor_type": "POOR", "count": 150},
  {"poor_type": "NEAR_POOR", "count": 80},
  {"poor_type": "DISABILITY", "count": 20},
  {"poor_type": "NONE", "count": 50}
]
```

**Use case:** Hiểu rõ hoàn cảnh sinh viên nộp hồ sơ

---

## 💰 SPONSOR Dashboard

### Dữ liệu hiển thị

#### 1. Overview Cards
- Tổng số quỹ đã tài trợ
- Tổng số tiền đã đóng góp
- Tổng số học bổng đang tài trợ
- Tổng số sinh viên nhận học bổng
- Tổng tiền đã giải ngân

#### 2. Scholarships List (Table)
```json
[
  {
    "name": "Học bổng Viettel 2024",
    "amount_per_slot": 5000000,
    "slots": 100,
    "status": "OPEN",
    "fund_name": "Quỹ Viettel HK1"
  }
]
```

#### 3. Recipients by School (Bar Chart)
```json
[
  {
    "school_name": "ĐH Cần Thơ",
    "school_code": "CTU",
    "count": 200,
    "total_amount": 1000000000
  },
  {
    "school_name": "ĐH Bách Khoa HCM",
    "count": 150,
    "total_amount": 750000000
  }
]
```

**Use case:** Nhà tài trợ thấy tiền mình giúp được sinh viên ở trường nào

#### 4. Scholarships by Year (Line Chart)
```json
[
  {
    "academic_year": "2023-2024",
    "scholarship_count": 5,
    "total_slots": 250
  },
  {
    "academic_year": "2024-2025",
    "scholarship_count": 10,
    "total_slots": 500
  }
]
```

#### 5. Recent Recipients (Timeline)
```json
[
  {
    "student_name": "Nguyễn Văn A",
    "scholarship_name": "HBKK HK1",
    "amount": 5000000,
    "school": "ĐH Cần Thơ",
    "reviewed_at": "2024-12-01"
  }
]
```

**Use case:** Xem 10 sinh viên mới nhất nhận học bổng

---

## 🎨 Frontend Implementation Suggestions

### SUPER_ADMIN Dashboard
```jsx
// Components cần tạo
<OverviewCards data={stats.overview} />
<UsersByRoleChart data={stats.users_by_role} />
<ScholarshipsByStatusChart data={stats.scholarships_by_status} />
<ApplicationsByStatusChart data={stats.applications_by_status} />
<TopSchoolsTable data={stats.top_schools} />
```

### UNI_ADMIN Dashboard
```jsx
<OverviewCards data={stats.overview} />
<PendingAlerts data={stats.pending_by_scholarship} />
<TopStudentsLeaderboard data={stats.top_students} />
<CircumstanceChart data={stats.by_circumstance} />
```

### SPONSOR Dashboard
```jsx
<OverviewCards data={stats.overview} />
<ScholarshipsTable data={stats.scholarships} />
<RecipientsBySchoolChart data={stats.recipients_by_school} />
<ScholarshipsByYearChart data={stats.scholarships_by_year} />
<RecentRecipientsTimeline data={stats.recent_recipients} />
```

---

## 🔍 SQL Queries Explained

### 1. GROUP BY với Aggregate Functions
```javascript
// Đếm số users theo role
User.findAll({
  attributes: [
    'role',
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: ['role']
});
```

### 2. JSON_EXTRACT từ snapshot_data
```javascript
// Phân bố theo hoàn cảnh
Application.findAll({
  attributes: [
    [sequelize.literal("JSON_EXTRACT(snapshot_data, '$.poor_cert_type')"), 'poor_type'],
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: [sequelize.literal("JSON_EXTRACT(snapshot_data, '$.poor_cert_type')")]
});
```

### 3. Complex JOIN
```javascript
// Top schools với số sinh viên
School.findAll({
  include: [{
    model: User,
    as: 'users',
    where: { role: 'STUDENT' },
    attributes: []
  }],
  group: ['schools.id'],
  order: [[sequelize.fn('COUNT', sequelize.col('users.id')), 'DESC']]
});
```

---

## 🧪 Testing

### Test SUPER_ADMIN Dashboard
```bash
# 1. Login as SUPER_ADMIN
POST http://localhost:5000/api/auth/login
Body: {"identifier": "superadmin", "password": "123456"}

# 2. Get dashboard
GET http://localhost:5000/api/stats/dashboard
Header: Authorization: Bearer <token>
```

### Test UNI_ADMIN Dashboard
```bash
# 1. Login as UNI_ADMIN
POST http://localhost:5000/api/auth/login
Body: {"identifier": "admin_ctu", "password": "123456"}

# 2. Get dashboard
GET http://localhost:5000/api/stats/dashboard
Header: Authorization: Bearer <token>
```

---

## 💡 Tips

1. **Cache Dashboard Data**: Dashboard queries có thể nặng, nên cache 5-10 phút
2. **Pagination**: Nếu data quá lớn, thêm pagination
3. **Real-time Updates**: Dùng WebSocket để update real-time
4. **Export Reports**: Thêm button export Excel/PDF

---

**Statistics APIs đã sẵn sàng cho Frontend!** 🎉
