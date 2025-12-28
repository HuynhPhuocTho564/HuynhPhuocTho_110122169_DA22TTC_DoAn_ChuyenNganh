import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAuthStore from './store/useAuthStore';
import PublicLayout from './components/layout/PublicLayout';
import Layout from './components/layout/Layout';

// Public Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ScholarshipListPage from './pages/ScholarshipListPage';
import ScholarshipDetailPage from './pages/ScholarshipDetailPage';
import UniversitiesPage from './pages/UniversitiesPage';

// Admin Pages (UNI_ADMIN)
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminScholarshipsPage from './pages/admin/AdminScholarshipsPage';
import AdminScholarshipFormPage from './pages/admin/AdminScholarshipFormPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminApplicationDetailPage from './pages/admin/AdminApplicationDetailPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

// Student Pages (dùng PublicLayout, không có dashboard riêng)
import StudentScholarshipDetailPage from './pages/student/StudentScholarshipDetailPage';
import StudentMyApplicationsPage from './pages/student/StudentMyApplicationsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentMyProfilePage from './pages/student/StudentMyProfilePage';
import StudentChangePasswordPage from './pages/student/StudentChangePasswordPage';

// Sponsor Pages
import SponsorDashboardPage from './pages/sponsor/SponsorDashboardPage';
import SponsorProjectsPage from './pages/sponsor/SponsorProjectsPage';
import SponsorRecipientsPage from './pages/sponsor/SponsorRecipientsPage';
import SponsorReviewPage from './pages/sponsor/SponsorReviewPage';
import SponsorFinancePage from './pages/sponsor/SponsorFinancePage';
import SponsorProfilePage from './pages/sponsor/SponsorProfilePage';
import SponsorReportsPage from './pages/sponsor/SponsorReportsPage';


// System Pages (SUPER_ADMIN)
import SystemUniversitiesPage from './pages/system/SystemUniversitiesPage';
import SystemUsersPage from './pages/system/SystemUsersPage';
import SystemDashboardPage from './pages/system/SystemDashboardPage';
import SystemReportsPage from './pages/system/SystemReportsPage';
import SystemSponsorsPage from './pages/system/SystemSponsorsPage';

// Common Pages
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Role-based Protected Route (for Admin, System, Sponsor - with sidebar)
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate page based on role
    const redirectMap = {
      SUPER_ADMIN: '/system/dashboard',
      UNI_ADMIN: '/admin/dashboard',
      STUDENT: '/', // Sinh viên về trang chủ
      SPONSOR: '/sponsor/dashboard',
    };
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
  }

  return <Layout>{children}</Layout>;
};

// Student Protected Route (dùng PublicLayout - không có sidebar)
const StudentRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  return <PublicLayout>{children}</PublicLayout>;
};

// Student Change Password Route (không có layout - giống trang login)
const StudentChangePasswordRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  return <StudentChangePasswordPage />;
};

// Public Route with Layout
const PublicRoute = ({ children }) => {
  return <PublicLayout>{children}</PublicLayout>;
};

// Auth Route (redirect if already logged in - except students stay on public pages)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated) {
    // Sinh viên đã đăng nhập -> về trang chủ public
    if (user?.role === 'STUDENT') {
      return <Navigate to="/" replace />;
    }
    // Các role khác -> về dashboard riêng
    const redirectMap = {
      SUPER_ADMIN: '/system/dashboard',
      UNI_ADMIN: '/admin/dashboard',
      SPONSOR: '/sponsor/dashboard',
    };
    return <Navigate to={redirectMap[user?.role] || '/'} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* ========== 1. PUBLIC ZONE ========== */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
        <Route path="/scholarships" element={<PublicRoute><ScholarshipListPage /></PublicRoute>} />
        <Route path="/scholarships/:id" element={<PublicRoute><ScholarshipDetailPage /></PublicRoute>} />
        <Route path="/universities" element={<PublicRoute><UniversitiesPage /></PublicRoute>} />
        <Route path="/guide" element={<PublicRoute><GuidePage /></PublicRoute>} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />

        {/* ========== 2. ADMIN PORTAL (UNI_ADMIN) ========== */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/scholarships" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminScholarshipsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/scholarships/create" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminScholarshipFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/scholarships/:id/edit" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminScholarshipFormPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/applications" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminApplicationsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/applications/:id" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminApplicationDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminStudentsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['UNI_ADMIN', 'SUPER_ADMIN']}>
            <AdminReportsPage />
          </ProtectedRoute>
        } />

        {/* ========== 3. STUDENT PAGES (dùng PublicLayout) ========== */}
        <Route path="/student/scholarships/:id" element={
          <StudentRoute><StudentScholarshipDetailPage /></StudentRoute>
        } />
        <Route path="/student/my-profile" element={
          <StudentRoute><StudentMyProfilePage /></StudentRoute>
        } />
        <Route path="/student/my-applications" element={
          <StudentRoute><StudentMyApplicationsPage /></StudentRoute>
        } />
        <Route path="/student/profile" element={
          <StudentRoute><StudentProfilePage /></StudentRoute>
        } />
        <Route path="/student/change-password" element={
          <StudentChangePasswordRoute />
        } />

        {/* ========== 4. SPONSOR PORTAL ========== */}
        <Route path="/sponsor/dashboard" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/sponsor/projects" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="/sponsor/review" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorReviewPage />
          </ProtectedRoute>
        } />
        <Route path="/sponsor/recipients" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorRecipientsPage />
          </ProtectedRoute>
        } />
        <Route path="/sponsor/finance" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorFinancePage />
          </ProtectedRoute>
        } />
        <Route path="/sponsor/profile" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/sponsor/reports" element={
          <ProtectedRoute allowedRoles={['SPONSOR']}>
            <SponsorReportsPage />
          </ProtectedRoute>
        } />


        {/* ========== 5. SYSTEM PORTAL (SUPER_ADMIN) ========== */}
        <Route path="/system/dashboard" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SystemDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/system/universities" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SystemUniversitiesPage />
          </ProtectedRoute>
        } />
        <Route path="/system/users" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SystemUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/system/reports" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SystemReportsPage />
          </ProtectedRoute>
        } />
        <Route path="/system/sponsors" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SystemSponsorsPage />
          </ProtectedRoute>
        } />

        {/* ========== COMMON ROUTES (Không cho sinh viên - sinh viên dùng /student/*) ========== */}
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'UNI_ADMIN', 'SPONSOR']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile/change-password" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'UNI_ADMIN', 'SPONSOR']}>
            <ChangePasswordPage />
          </ProtectedRoute>
        } />

        {/* ========== FALLBACK ========== */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
