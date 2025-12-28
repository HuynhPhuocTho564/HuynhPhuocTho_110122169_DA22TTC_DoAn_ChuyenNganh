const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Hệ thống Học bổng" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Chào mừng đến với Hệ thống Quản lý Học bổng',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Chào mừng ${user.full_name}!</h2>
          <p>Tài khoản của bạn đã được tạo thành công.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Vai trò:</strong> ${user.role}</p>
          </div>
          <p>Vui lòng đăng nhập để bắt đầu sử dụng hệ thống.</p>
          <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Đăng nhập ngay
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email này.
          </p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
  }
};

/**
 * Send notification about new scholarship
 */
const sendNewScholarshipNotification = async (user, scholarship) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Hệ thống Học bổng" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎓 Học bổng mới: ${scholarship.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Học bổng mới đã được mở!</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${scholarship.name}</h3>
            <p><strong>Giá trị:</strong> ${scholarship.amount_per_slot.toLocaleString('vi-VN')} VNĐ/suất</p>
            <p><strong>Số suất:</strong> ${scholarship.slots}</p>
            <p><strong>Hạn nộp:</strong> ${new Date(scholarship.end_date).toLocaleDateString('vi-VN')}</p>
          </div>
          <p>${scholarship.description || 'Xem chi tiết để biết thêm thông tin.'}</p>
          <a href="${process.env.CLIENT_URL}/scholarships/${scholarship.id}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Xem chi tiết
          </a>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Scholarship notification sent to:', user.email);
  } catch (error) {
    console.error('❌ Error sending scholarship notification:', error);
  }
};

/**
 * Send application status update
 */
const sendApplicationStatusUpdate = async (application) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      APPROVED: {
        subject: '✅ Hồ sơ của bạn đã được duyệt',
        message: 'Chúc mừng! Hồ sơ của bạn đã được duyệt.',
        color: '#10b981'
      },
      REJECTED: {
        subject: '❌ Hồ sơ của bạn chưa được duyệt',
        message: 'Rất tiếc, hồ sơ của bạn chưa đáp ứng yêu cầu.',
        color: '#ef4444'
      },
      PENDING: {
        subject: '⏳ Hồ sơ đang được xét duyệt',
        message: 'Hồ sơ của bạn đang được xem xét.',
        color: '#f59e0b'
      }
    };
    
    const status = statusMessages[application.status];
    
    const mailOptions = {
      from: `"Hệ thống Học bổng" <${process.env.EMAIL_USER}>`,
      to: application.Student.email,
      subject: status.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status.color};">${status.message}</h2>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Học bổng:</strong> ${application.Scholarship.name}</p>
            <p><strong>Trạng thái:</strong> <span style="color: ${status.color};">${application.status}</span></p>
            <p><strong>Ngày nộp:</strong> ${new Date(application.submitted_at).toLocaleDateString('vi-VN')}</p>
            ${application.admin_note ? `<p><strong>Ghi chú:</strong> ${application.admin_note}</p>` : ''}
          </div>
          <a href="${process.env.CLIENT_URL}/portal/my-applications" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Xem chi tiết
          </a>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Application status email sent to:', application.Student.email);
  } catch (error) {
    console.error('❌ Error sending application status email:', error);
  }
};

/**
 * Send deadline reminder
 */
const sendDeadlineReminder = async (user, scholarship, daysLeft) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Hệ thống Học bổng" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `⏰ Nhắc nhở: Còn ${daysLeft} ngày để nộp hồ sơ`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⏰ Sắp hết hạn nộp hồ sơ!</h2>
          <p>Học bổng <strong>${scholarship.name}</strong> sẽ đóng trong <strong>${daysLeft} ngày</strong>.</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Hạn cuối:</strong> ${new Date(scholarship.end_date).toLocaleDateString('vi-VN')}</p>
            <p>Đừng bỏ lỡ cơ hội này!</p>
          </div>
          <a href="${process.env.CLIENT_URL}/scholarships/${scholarship.id}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Nộp hồ sơ ngay
          </a>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Deadline reminder sent to:', user.email);
  } catch (error) {
    console.error('❌ Error sending deadline reminder:', error);
  }
};

/**
 * Send bulk emails
 */
const sendBulkEmails = async (users, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    
    const promises = users.map(user => {
      return transporter.sendMail({
        from: `"Hệ thống Học bổng" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html: htmlContent.replace('{{name}}', user.full_name)
      });
    });
    
    await Promise.all(promises);
    console.log(`✅ Bulk emails sent to ${users.length} users`);
  } catch (error) {
    console.error('❌ Error sending bulk emails:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendNewScholarshipNotification,
  sendApplicationStatusUpdate,
  sendDeadlineReminder,
  sendBulkEmails
};
