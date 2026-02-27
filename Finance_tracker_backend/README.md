# Personal Finance Tracker Backend

A comprehensive RESTful API for personal finance management with advanced features, security, and analytics.

---
**Author:** Rodas Asmare  
**GitHub:** [Root-os](https://github.com/Root-os)  
**Project Repository:** [personal_finance_tracker](https://github.com/Root-os/personal_finance_tracker_ethiotelecom)
---

## Features

### 🔐 Security & Authentication
- JWT access and refresh tokens with rotation
- Rate limiting and brute force protection
- Password reset via email
- Secure password hashing with bcrypt
- Input validation with Joi
- CORS and Helmet security headers

### 📊 Analytics & Reporting
- Monthly income/expense trends
- Category-wise spending breakdown
- Budget comparison and tracking
- Top expenses analysis
- Financial summary with savings rate

### 🏗️ Architecture
- Service layer architecture for separation of concerns
- Centralized error handling
- Structured logging with Winston
- Database indexing for performance
- API versioning (/api/v1/)

### 🧪 Testing
- Unit tests with Jest
- Comprehensive test coverage
- Test database setup

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/logout-all` - Logout from all devices
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Password Reset
- `POST /api/v1/password-reset/request` - Request password reset
- `POST /api/v1/password-reset/reset` - Reset password
- `GET /api/v1/password-reset/verify/:token` - Verify reset token

### Categories
- `GET /api/v1/categories` - Get user categories
- `POST /api/v1/categories` - Create category
- `GET /api/v1/categories/:id` - Get category by ID
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Transactions
- `GET /api/v1/transactions` - Get transactions with pagination and filters
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/:id` - Get transaction by ID
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction

### Analytics
- `GET /api/v1/analytics/trends` - Monthly trends
- `GET /api/v1/analytics/categories` - Category breakdown
- `POST /api/v1/analytics/budget` - Budget comparison
- `GET /api/v1/analytics/top-expenses` - Top expenses
- `GET /api/v1/analytics/summary` - Financial summary

## Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Set up MySQL database and update .env with your credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Database
DB_NAME=finance_tracker
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_DIALECT=mysql

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Testing

Run tests with:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Database Schema

### Users
- id, name, userName, email, password, emailVerified
- passwordResetToken, passwordResetExpires

### Categories
- id, name, color, icon, userId
- Indexed by userId and (userId, name)

### Transactions
- id, categoryId, userId, amount, type, date, description
- Indexed by userId, categoryId, date, type, and combinations

### RefreshTokens
- id, token, userId, expiresAt, isRevoked
- Indexed by token, userId, expiresAt

## Security Features

- Rate limiting: 100 requests per 15 minutes (general), 5 auth requests per 15 minutes
- Password requirements: 8+ chars, uppercase, lowercase, number, special character
- JWT tokens with expiration and refresh mechanism
- Input validation on all endpoints
- SQL injection prevention with Sequelize ORM
- XSS protection with Helmet
- CORS configuration

## Performance Optimizations

- Database connection pooling
- Strategic indexing on frequently queried columns
- Pagination for large datasets
- Efficient query optimization
- Response caching where appropriate

## Logging

- Structured logging with Winston
- Separate error and combined logs
- Request/response logging
- Environment-based log levels
- Log files in `/logs` directory

## API Documentation

Visit `http://localhost:5173/api` for API endpoint information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
