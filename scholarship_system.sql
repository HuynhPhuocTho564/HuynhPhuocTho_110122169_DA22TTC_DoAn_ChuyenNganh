-- CREATE DATABASE scholarship_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
use  scholarship_system ;

/* ==================================================
   1. NHÓM QUẢN TRỊ HỆ THỐNG & NGƯỜI DÙNG
   ================================================== */

-- Bảng Trường Đại học (Tenant Gốc)
CREATE TABLE schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,      -- Mã trường (VD: BKHN, CTU)
    name VARCHAR(255) NOT NULL,            -- Tên trường
    logo_url VARCHAR(500),                 -- Link logo
    phone VARCHAR(20),                     -- Hotline công tác sinh viên
    address VARCHAR(255),
    status ENUM('ACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Người dùng (Tài khoản đăng nhập)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT,                         -- NULL nếu là Super Admin, có giá trị nếu là SV/Cán bộ
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,   -- Mật khẩu đã mã hóa
    role ENUM('SUPER_ADMIN', 'UNI_ADMIN', 'STUDENT', 'SPONSOR') NOT NULL,
    status ENUM('ACTIVE', 'LOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT
);

/* ==================================================
   2. NHÓM CẤU TRÚC NHÀ TRƯỜNG (KHOA - NGÀNH - LỚP)
   ================================================== */

CREATE TABLE faculties ( -- Khoa
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE majors ( -- Ngành
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);

CREATE TABLE classes ( -- Lớp
    id INT AUTO_INCREMENT PRIMARY KEY,
    major_id INT NOT NULL,
    code VARCHAR(50) NOT NULL, -- Mã lớp (VD: DA22TTC)
    name VARCHAR(100),
    FOREIGN KEY (major_id) REFERENCES majors(id) ON DELETE CASCADE
);

/* ==================================================
   3. NHÓM CHI TIẾT NGƯỜI DÙNG (PROFILES)
   ================================================== */

-- Thông tin chi tiết Sinh viên
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,           -- Liên kết 1-1 với Users
    class_id INT,
    full_name VARCHAR(100) NOT NULL,
    student_code VARCHAR(20) NOT NULL,     -- MSSV
    dob DATE,                              -- Ngày sinh
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    gpa DECIMAL(3, 2) DEFAULT 0.00,        -- Điểm trung bình tích lũy (Quan trọng để xét duyệt)
    drr INT DEFAULT 0,                     -- Điểm rèn luyện
    poor_cert_type ENUM('NONE', 'POOR', 'NEAR_POOR', 'DISABILITY') DEFAULT 'NONE', -- Loại hộ nghèo
    bank_number VARCHAR(50),               -- Số tài khoản nhận tiền
    bank_name VARCHAR(100),                -- Tên ngân hàng
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Thông tin chi tiết Nhà tài trợ
CREATE TABLE sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    contact_person VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

/* ==================================================
   4. NHÓM TÀI CHÍNH & HỌC BỔNG
   ================================================== */

-- Quỹ tài trợ (Tiền)
CREATE TABLE funds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sponsor_id INT NOT NULL,               -- Tiền của ai
    school_id INT NOT NULL,                -- Tài trợ cho trường nào
    amount DECIMAL(15, 0) NOT NULL,        -- Tổng số tiền (VD: 1,000,000,000)
    fiscal_year VARCHAR(10),               -- Năm tài chính (2025)
    name VARCHAR(255),                     -- Tên gói tài trợ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE RESTRICT,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT
);

-- Đợt Học bổng
CREATE TABLE scholarships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    fund_id INT,                           -- Nguồn tiền (Có thể Null nếu trường tự chi)
    name VARCHAR(255) NOT NULL,            -- Tên học bổng
    semester VARCHAR(20),                  -- Học kỳ
    academic_year VARCHAR(20),             -- Năm học
    amount_per_slot DECIMAL(15, 0) NOT NULL, -- Giá trị 1 suất (VD: 5,000,000)
    slots INT NOT NULL,                    -- Tổng số lượng suất
    description TEXT,                      -- Mô tả
    
    -- Cột JSON để lưu tiêu chí động (VD: {"min_gpa": 3.0, "require_poor": true})
    criteria_json JSON,                    
    
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('DRAFT', 'OPEN', 'CLOSED', 'FINISHED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    FOREIGN KEY (fund_id) REFERENCES funds(id)
);

/* ==================================================
   5. NHÓM HỒ SƠ & XÉT DUYỆT (CORE LOGIC)
   ================================================== */

-- Hồ sơ đăng ký (Đơn xin học bổng)
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scholarship_id INT NOT NULL,
    student_id INT NOT NULL,
    
    -- Trạng thái xử lý hồ sơ
    status ENUM('PENDING', 'NEED_UPDATE', 'APPROVED', 'REJECTED', 'DISBURSED') DEFAULT 'PENDING',
    
    -- LOGIC 1: ĐIỂM TỰ ĐỘNG (Ranking)
    system_score DECIMAL(5, 2) DEFAULT 0,  -- Điểm hệ thống tự tính dựa trên GPA + Hoàn cảnh
    
    -- LOGIC 2: SNAPSHOT DỮ LIỆU (Tránh gian lận khi sửa profile sau nộp)
    snapshot_data JSON,                    -- Lưu cứng: GPA, Hộ nghèo, Lớp tại thời điểm nộp
    
    admin_note TEXT,                       -- Ghi chú của cán bộ (Lý do từ chối/Sửa)
    reviewed_by INT,                       -- ID cán bộ đã duyệt
    reviewed_at DATETIME,                  -- Thời gian duyệt
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE RESTRICT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
    
    -- Đảm bảo 1 SV chỉ nộp 1 lần cho 1 học bổng
    UNIQUE KEY unique_application (scholarship_id, student_id)
);

-- Minh chứng (File đính kèm)
CREATE TABLE application_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    file_name VARCHAR(255),
    file_url VARCHAR(500) NOT NULL,        -- Đường dẫn ảnh/pdf
    type ENUM('HO_NGHEO', 'BANG_DIEM', 'KHAC') DEFAULT 'KHAC',
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                  -- Người nhận thông báo
    title VARCHAR(255) NOT NULL,           -- Tiêu đề (VD: Kết quả xét duyệt)
    message TEXT,                          -- Nội dung
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,         -- Đã xem hay chưa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT,                         -- Log này của trường nào
    user_id INT,                           -- Ai là người thực hiện hành động
    action VARCHAR(50),                    -- Hành động (VD: APPROVE_APPLICATION, DELETE_SCHOLARSHIP)
    target_id INT,                         -- ID đối tượng bị tác động (VD: ID của hồ sơ)
    details JSON,                          -- Lưu chi tiết cũ/mới (VD: Đổi trạng thái từ PENDING -> REJECTED)
    ip_address VARCHAR(45),                -- IP người dùng (Tùy chọn)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
show tables from activity_logs;