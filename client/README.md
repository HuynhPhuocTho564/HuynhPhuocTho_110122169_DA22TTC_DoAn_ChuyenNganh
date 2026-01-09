# 🎨 Frontend React - Scholarship Management System

## 🚀 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool (cực nhanh)
- **React Router v6** - Routing
- **Zustand** - State management (nhẹ hơn Redux)
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **React Hook Form** - Form validation

---

## 📁 Cấu trúc thư mục

```
client/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Loading.jsx
│   │   └── layout/
│   │       └── Layout.jsx   # Main layout
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/
│   │   ├── api.js           # Axios instance
│   │   ├── authService.js
│   │   ├── scholarshipService.js
│   │   └── applicationService.js
│   ├── store/
│   │   └── useAuthStore.js  # Zustand store
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🎯 Clean Code Principles Applied

### 1. Component Reusability ✅
```jsx
// Reusable Button với variants
<Button variant="primary" size="md" loading={isLoading}>
  Submit
</Button>
```

### 2. Service Layer Pattern ✅
```javascript
// Tách biệt API calls ra services
const scholarships = await scholarshipService.getAll();
```

### 3. State Management ✅
```javascript
// Zustand store - đơn giản hơn Redux
const { user, login, logout } = useAuthStore();
```

### 4. Error Handling ✅
```javascript
// Axios interceptor xử lý lỗi tập trung
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Auto logout khi token hết hạn
    }
  }
);
```

---

## 🛠️ Setup & Installation

### 1. Cài dependencies
```bash
cd client
npm install
```

### 2. Chạy development server
```
bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

### 3. Build production
```bash
npm run build
```

---

## 🔐 Authentication Flow

1. User nhập username/password
2. Call API `/api/auth/login`
3. Nhận token + user info
4. Lưu vào localStorage
5. Axios tự động thêm token vào header
6. Nếu token hết hạn (401) → Auto logout

---

## 🎨 UI Components

### Button Component
```jsx
<Button 
  variant="primary"    // primary, secondary, success, danger, outline
  size="md"           // sm, md, lg
  loading={false}
  disabled={false}
  fullWidth={false}
  onClick={handleClick}
>
  Click me
</Button>
```

### Input Component
```jsx
<Input
  label="Email"
  name="email"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

### Card Component
```jsx
<Card title="Thống kê">
  <p>Content here</p>
</Card>
```

---

## 📱 Pages Implemented

### 1. Login Page ✅
- Form đăng nhập
- Validation
- Loading state
- Error handling
- Tài khoản demo

### 2. Dashboard Page ✅
- Overview cards
- Role-based content
- Statistics charts (cần implement)
- Real-time data

---

## 🔄 API Integration

### Axios Instance
```javascript
// Auto add token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Service Pattern
```javascript
// authService.js
export const authService = {
  login: async (identifier, password) => {
    return await api.post('/auth/login', { identifier, password });
  },
  logout: () => {
    localStorage.clear();
    window.location.href = '/login';
  }
};
```

---

## 🎯 Next Steps (Cần implement)

### Pages cần tạo:
- [ ] Scholarship List Page
- [ ] Scholarship Detail Page
- [ ] Create Scholarship Page (UNI_ADMIN)
- [ ] Application List Page (UNI_ADMIN)
- [ ] My Applications Page (STUDENT)
- [ ] Submit Application Page (STUDENT)
- [ ] University Management Page (SUPER_ADMIN)
- [ ] Profile Page
- [ ] Change Password Page

### Components cần tạo:
- [ ] Table component
- [ ] Modal component
- [ ] Select/Dropdown component
- [ ] FileUpload component
- [ ] Badge component
- [ ] Pagination component

### Features cần thêm:
- [ ] Form validation với React Hook Form
- [ ] Charts với Recharts/Chart.js
- [ ] File upload preview
- [ ] Search & Filter
- [ ] Sorting
- [ ] Export Excel

---

## 💡 Best Practices

### 1. Component Structure
```jsx
// ✅ Good
const MyComponent = () => {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {}, []);
  
  // 3. Handlers
  const handleClick = () => {};
  
  // 4. Render
  return <div>...</div>;
};
```

### 2. Error Handling
```jsx
// ✅ Always use try-catch
try {
  await api.call();
  toast.success('Success!');
} catch (error) {
  toast.error(error.message);
}
```

### 3. Loading States
```jsx
// ✅ Show loading feedback
{loading ? <Loading /> : <Content />}
```

---

## 🧪 Testing

```bash
# Run tests (khi đã setup)
npm test
```

---

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com)

---

**Frontend React đã sẵn sàng để phát triển tiếp!** 🎉
