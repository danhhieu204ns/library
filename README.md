# Yen Library Management System

A comprehensive community library management system built with modern web technologies, designed to streamline library operations including book management, borrowing/returning processes, reservations, and user management.

## 🚀 Features

### 📚 Book Management
- **Book Catalog Management**: Add, edit, and delete book information with detailed metadata
- **Copy Management**: Track individual book copies with location tracking and status monitoring
- **Advanced Search**: Multi-criteria search by title, author, genre, ISBN, and availability status
- **Inventory Management**: Real-time tracking of available vs. borrowed books

### 👥 User Management & Access Control
- **Role-based Access Control**: Admin, Staff (Cộng tác viên), and Reader roles
- **User Registration & Authentication**: Secure login system with JWT authentication
- **Profile Management**: Users can manage their personal information

### 📖 Borrowing & Return System
- **Book Borrowing**: Staff-assisted borrowing process with barcode scanning
- **Return Processing**: Automated fine calculation for overdue books
- **Bulk Operations**: Handle multiple borrowings/returns simultaneously
- **Due Date Management**: 14-day lending period with automatic overdue tracking

### 📅 Reservation System
- **Book Reservations**: Users can reserve books when not available
- **Queue Management**: Automatic assignment when books become available
- **Reservation Expiry**: Automatic cancellation for unclaimed reservations

### 📊 Analytics & Reporting
- **Borrowing Statistics**: Track popular books and user activity
- **Overdue Reports**: Monitor and manage overdue books
- **User Analytics**: Borrowing patterns and user engagement metrics

### 📧 Notification System
- **Due Date Reminders**: Automated notifications for upcoming due dates
- **Overdue Alerts**: Notifications for overdue books
- **Reservation Notifications**: Alerts when reserved books become available

### 🔄 Additional Features
- **Schedule Management**: Staff work schedule coordination
- **Book Reviews**: User ratings and reviews for books
- **Book Suggestions**: Users can suggest new books for acquisition
- **Activity Logging**: Comprehensive audit trail for all system activities

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Material-UI (MUI)** - React component library
- **React Router** - Client-side routing
- **React Query (@tanstack/react-query)** - Server state management
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT (jsonwebtoken)** - Authentication and authorization
- **bcryptjs** - Password hashing
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Multer** - File upload handling

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart development server
- **dotenv** - Environment variable management

## 📁 Project Structure

```
yen_library/
├── expressjs/                 # Backend API server
│   ├── middleware/            # Authentication & validation middleware
│   ├── models/               # MongoDB schemas (User, Book, Transaction, etc.)
│   ├── routes/               # API route handlers
│   ├── server.js             # Express server entry point
│   ├── seed.js              # Database seeding script
│   └── package.json
├── reactjs/                  # Frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Application pages/routes
│   │   ├── services/        # API service functions
│   │   ├── styles/          # Global styles
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
└── Docs/                    # Project documentation
    ├── API.txt              # API endpoints documentation
    ├── CSDL.txt            # Database design
    ├── Tech_stack.txt      # Technology decisions
    └── ...                 # Additional documentation
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yen_library
   ```

2. **Backend Setup**
   ```bash
   cd expressjs
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../reactjs
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the `expressjs` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/yen_library
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

5. **Database Setup**
   ```bash
   cd expressjs
   # Seed the database with sample data
   npm run seed
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd expressjs
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   cd reactjs
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 📖 Usage

### Default Accounts
After seeding the database, you can use these accounts:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`

- **Staff (CTV)**:
  - Username: `staff1`
  - Password: `staff123`

- **Reader**:
  - Username: `reader1`
  - Password: `reader123`

### Key Workflows

1. **Book Management** (Admin/Staff)
   - Navigate to Book Management
   - Add new books with detailed information
   - Manage book copies and locations

2. **Borrowing Process** (Staff)
   - Use Borrow Page to process book loans
   - Search for users and available books
   - Complete borrowing with due date assignment

3. **Return Process** (Staff)
   - Use Return Page to process book returns
   - Automatic fine calculation for overdue items
   - Update inventory status

4. **User Experience** (Readers)
   - Browse and search the book catalog
   - Reserve books when not available
   - View borrowing history and due dates

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Books
- `GET /books` - Get books with filtering and pagination
- `POST /books` - Add new book (Staff/Admin)
- `PUT /books/:id` - Update book information
- `DELETE /books/:id` - Delete book

### Borrowings
- `GET /borrowings` - Get borrowing records
- `POST /borrowings` - Create new borrowing
- `PUT /borrowings/:id/return` - Return a book
- `POST /borrowings/bulk-borrow` - Bulk borrowing
- `POST /borrowings/bulk-return` - Bulk return

### Users
- `GET /users` - Get users list (Admin)
- `PUT /users/:id` - Update user information
- `GET /users/:id/borrowings` - Get user's borrowing history

### Reservations
- `GET /reservations` - Get reservations
- `POST /reservations` - Create reservation
- `PUT /reservations/:id/cancel` - Cancel reservation

## 🧪 Testing

```bash
# Backend tests
cd expressjs
npm test

# Frontend tests
cd reactjs
npm test
```

## 🚀 Deployment

### Production Build

1. **Build Frontend**
   ```bash
   cd reactjs
   npm run build
   ```

2. **Production Environment**
   ```bash
   cd expressjs
   npm start
   ```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure `JWT_SECRET`
- Configure production MongoDB URI
- Set appropriate CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- **Development Team** - Initial work and ongoing development

## 🆘 Support

For support and questions:
- Check the documentation in the `Docs/` folder
- Create an issue on GitHub
- Contact the development team

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core book management functionality
- ✅ User authentication and authorization
- ✅ Basic borrowing/return system
- ✅ Reservation system

### Phase 2 (Planned)
- 📧 Email notification system
- 📱 Mobile responsive improvements
- 📊 Advanced analytics dashboard
- 🔍 Enhanced search capabilities

### Phase 3 (Future)
- 📚 Integration with external book databases
- 🏷️ Advanced tagging system
- 🎉 Community events management
- 📱 Mobile application

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet

## 📊 Performance Considerations

- Database indexing for optimal query performance
- Pagination for large datasets
- Efficient React component rendering
- Image optimization for book covers
- API response caching strategies
- Connection pooling for database
