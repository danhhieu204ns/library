# Cải Tiến Cấu Trúc Frontend - Yen Library

## 🎯 Mục Tiêu
Chuyển đổi từ cấu trúc tách riêng theo role (admin/staff/user) sang cấu trúc dùng chung component với permission-based access control.

## 🏗️ Cấu Trúc Mới

### 📁 Component Architecture

```
src/
├── components/
│   ├── common/              # Shared components
│   │   ├── DataTable.jsx    # Universal data table
│   │   └── PermissionGuard.jsx  # Permission wrapper
│   ├── management/          # Business logic components
│   │   ├── BookManagement.jsx
│   │   ├── UserManagement.jsx
│   │   └── BorrowingManagement.jsx
│   ├── layout/              # Layout components
│   │   └── ManagementLayout.jsx
│   └── index.js             # Component exports
├── hooks/
│   ├── usePermissions.js    # Permission hook
│   └── index.js
├── hoc/
│   └── withRoleAccess.jsx   # Role-based HOC
├── config/
│   ├── permissions.js       # Permission configuration
│   └── routes.jsx          # Route configuration
└── pages/
    ├── shared/             # Shared pages
    │   ├── BooksManagementPage.jsx
    │   ├── UsersManagementPage.jsx
    │   └── BorrowingsManagementPage.jsx
    └── index.js
```

## 🔧 Cách Sử Dụng

### 1. Permission System

```javascript
// Sử dụng hook trong component
const { canView, canEdit, canDelete, userRole } = usePermissions('books');

// Sử dụng PermissionGuard
<PermissionGuard resource="books" action="edit">
  <EditButton />
</PermissionGuard>

// Sử dụng HOC cho page
export default withRoleAccess(BooksPage, [
  { resource: 'books', action: 'view' }
]);
```

### 2. Shared Components

```javascript
// BookManagement component có thể dùng cho tất cả role
<BookManagement
  title="Book Management"
  onBookSelect={handleBookAction}
  additionalActions={roleBasedActions}
/>
```

### 3. Layout System

```javascript
<ManagementLayout title="Books" breadcrumb={breadcrumb}>
  <BookManagement showTitle={false} />
</ManagementLayout>
```

## ✅ Lợi Ích

### 🚀 Performance
- **Giảm Code Duplication**: Từ 3 component riêng biệt → 1 component chung
- **Smaller Bundle Size**: Ít code trùng lặp
- **Better Caching**: Shared components được cache hiệu quả hơn

### 🛡️ Security & Maintainability
- **Centralized Permission Logic**: Tất cả logic phân quyền ở một nơi
- **Consistent UI/UX**: Giao diện thống nhất across roles
- **Easier Testing**: Ít component cần test hơn

### 👥 Developer Experience
- **Single Source of Truth**: Một component cho một tính năng
- **Easier Updates**: Chỉ cần sửa một nơi
- **Better Code Reusability**: Components có thể tái sử dụng

## 🔄 Migration Plan

### Phase 1: Infrastructure ✅ 
- [x] Permission system (permissions.js)
- [x] usePermissions hook
- [x] PermissionGuard component
- [x] withRoleAccess HOC

### Phase 2: Core Components ✅
- [x] DataTable component
- [x] BookManagement component
- [x] UserManagement component
- [x] BorrowingManagement component
- [x] ManagementLayout

### Phase 3: Shared Pages ✅
- [x] BooksManagementPage
- [x] UsersManagementPage
- [x] BorrowingsManagementPage

### Phase 4: Integration (Next Steps)
- [ ] Update App.jsx to use new routing
- [ ] Replace old admin/staff pages with shared pages
- [ ] Test permission logic
- [ ] Update navigation links

## 📋 Next Steps

1. **Update Main App**
   ```javascript
   // App.jsx
   import AppRoutes from './config/routes';
   
   function App() {
     return <AppRoutes />;
   }
   ```

2. **Replace Old Routes**
   - Remove `/admin/books` → Use `/books`
   - Remove `/staff/users` → Use `/users`
   - Remove duplicate borrowing pages → Use `/borrowings`

3. **Test Permission Logic**
   - Test với Admin role
   - Test với Staff role
   - Test với User role

4. **Clean Up Old Code**
   - Remove unused admin/staff specific pages
   - Remove duplicate API calls
   - Update imports across the app

## 🎨 UI/UX Improvements

### Consistent Interface
- Tất cả management pages có giao diện giống nhau
- Consistent search, filter, pagination
- Unified action buttons và bulk operations

### Role-based Features
- Admin: Full CRUD + audit logs + system settings
- Staff: Limited CRUD + basic reports
- User: View only + personal actions

### Responsive Design
- Mobile-friendly navigation
- Collapsible sidebar
- Adaptive table layouts

## 🔍 Example Usage

```javascript
// Admin sẽ thấy tất cả buttons
<BookManagement /> // Shows: Add, Edit, Delete, Export, Audit

// Staff sẽ thấy limited buttons
<BookManagement /> // Shows: Add, Edit, Export (no Delete, no Audit)

// User sẽ chỉ thấy view buttons
<BookManagement /> // Shows: View only
```

## 🚦 Permission Matrix

| Feature | Admin | Staff | User |
|---------|-------|-------|------|
| Books View | ✅ | ✅ | ✅ |
| Books Create | ✅ | ✅ | ❌ |
| Books Edit | ✅ | ✅ | ❌ |
| Books Delete | ✅ | ❌ | ❌ |
| Users View | ✅ | ✅ | ❌ |
| Users Create | ✅ | ❌ | ❌ |
| Users Edit | ✅ | ✅ | ❌ |
| Users Delete | ✅ | ❌ | ❌ |
| Borrowings View | ✅ | ✅ | ✅* |
| Borrowings Create | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |

*User chỉ thấy borrowings của chính mình

---

Cấu trúc mới này sẽ giúp code dễ maintain hơn, ít bug hơn, và flexible hơn khi có thay đổi về business logic hay UI.
