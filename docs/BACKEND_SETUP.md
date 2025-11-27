# Backend Setup & Installation Guide

## Prerequisites

Before starting backend development, ensure you have:

- **Node.js** v14+ (LTS recommended v16+)
- **npm** or **yarn** package manager
- **MySQL** v5.7+ or **MariaDB** v10.3+
- **Git** for version control
- **Postman** or **Insomnia** for API testing (optional but recommended)
- Text editor or IDE (VS Code recommended)

---

## Database Setup

### 1. Install MySQL

**Windows:**
```powershell
# Using Chocolatey
choco install mysql

# Or download from https://dev.mysql.com/downloads/mysql/
```

**Mac:**
```bash
# Using Homebrew
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema file
mysql -u root -p < database.sql
```

Or manually:

```sql
-- In MySQL console
CREATE DATABASE triptech;
USE triptech;
-- Then paste contents of database.sql
```

### 3. Verify Database

```bash
mysql -u root -p -e "USE triptech; SHOW TABLES;"
```

You should see 22 tables created (including registration_audit).

---

## New Features in Database Schema

### Registration Management
- **Email-based Registration**: Users register with email as primary identifier
- **Auto-generated Credentials**: Username generated from email prefix, password auto-generated
- **Users Table Updates**: Added `company_name`, `password_changed`, `created_by`, and `Pending` status
- **Registration Audit**: New `registration_audit` table tracks all registration activities

### Trip Invite Management
- **Role-based Invites**: 
  - Logistics Coordinator: Can send to Trip Owner, Vendor, or Both
  - Trip Owner: Can send to Logistics Coordinator only
  - Vendor: Can send to Logistics Coordinator only
- **Manual Entry**: LC can manually enter unregistered user details
- **Invitations Table Updates**: Enhanced with role tracking, manual entry flag, and refined invitation types

---

## Backend Project Setup

### 1. Project Structure

```
triptech-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── environment.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── vendor.controller.js
│   │   ├── driver.controller.js
│   │   ├── vehicle.controller.js
│   │   ├── owner.controller.js
│   │   ├── trip.controller.js
│   │   ├── booking.controller.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── vendor.routes.js
│   │   ├── driver.routes.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/
│   │   └── (database models if using ORM)
│   ├── utils/
│   │   ├── logger.js
│   │   ├── response.js
│   │   └── validators.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── .gitignore
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

### 2. Initialize Node Project

```bash
# Create project directory
mkdir triptech-backend
cd triptech-backend

# Initialize npm
npm init -y

# Or with specific name
npm init
```

### 3. Install Dependencies

```bash
npm install express
npm install mysql2 dotenv
npm install jsonwebtoken bcryptjs
npm install cors helmet
npm install joi
npm install morgan
npm install --save-dev nodemon
npm install --save-dev jest supertest
```

**Complete package.json:**
```json
{
  "name": "triptech-backend",
  "version": "1.0.0",
  "description": "Backend API for TripTech application",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch"
  },
  "keywords": ["triptech", "api", "logistics"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "joi": "^17.9.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

### 4. Create .env File

Create `.env` in root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=triptech

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRY=24h

# Server Configuration
NODE_ENV=development
API_PORT=5000
API_URL=http://localhost:5000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Email (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Logging
LOG_LEVEL=info
```

Create `.env.example` for version control:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=triptech
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h
NODE_ENV=development
API_PORT=5000
API_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
```

---

## Express Server Setup

### 1. Create server.js

```javascript
// server.js
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.API_PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
```

### 2. Create src/app.js

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (will be added)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/vendors', require('./routes/vendor.routes'));
app.use('/api/drivers', require('./routes/driver.routes'));
app.use('/api/vehicles', require('./routes/vehicle.routes'));
app.use('/api/owners', require('./routes/owner.routes'));
app.use('/api/trips', require('./routes/trip.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/operations', require('./routes/operations.routes'));
app.use('/api/invites', require('./routes/invitations.routes'));
app.use('/api/documents', require('./routes/document.routes'));
app.use('/api/services', require('./routes/service.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  });
});

module.exports = app;
```

### 3. Create Database Connection

```javascript
// src/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
```

---

## Authentication Setup

### 1. Create Auth Middleware

```javascript
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        statusCode: 401
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401
    });
  }
};

module.exports = authMiddleware;
```

### 2. Create Auth Controller

```javascript
// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, and role are required',
        statusCode: 400
      });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      [username, role]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        statusCode: 401
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500
    });
  }
};

module.exports = { login };
```

---

## Running the Backend

### Development Mode

```bash
npm run dev
```

Output:
```
🚀 Server is running on http://localhost:5000
Environment: development
✅ Database connected successfully
```

### Production Mode

```bash
npm start
```

### Testing Connection

```bash
# Health check
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2024-01-16T16:00:00.000Z",
#   "environment": "development"
# }
```

---

## Testing APIs with Postman

### 1. Import Collection

Create a Postman collection with endpoints:

**Login:**
```
POST http://localhost:5000/api/auth/login
Body (JSON):
{
  "username": "logistics",
  "password": "logi123",
  "role": "logistics"
}
```

**Get Vendors:**
```
GET http://localhost:5000/api/vendors
Headers:
Authorization: Bearer <token_from_login>
```

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Solution:**
```bash
# Check if MySQL is running
mysql -u root -p

# Verify credentials in .env
# Ensure database is created
mysql -u root -p < database.sql
```

### Issue: Port 5000 Already in Use

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port in .env
API_PORT=5001
```

### Issue: JWT Token Invalid

**Solution:**
- Ensure JWT_SECRET in .env is same everywhere
- Check token hasn't expired (JWT_EXPIRY)
- Verify Bearer format: `Bearer <token>`

### Issue: CORS Error

**Solution:**
- Check CORS_ORIGIN in .env matches frontend URL
- Add credentials if needed in frontend fetch

---

## Database Maintenance

### Backup Database

```bash
# Backup
mysqldump -u root -p triptech > backup.sql

# Restore
mysql -u root -p triptech < backup.sql
```

### Monitor Queries

```sql
-- Show current processes
SHOW PROCESSLIST;

-- Check query performance
SHOW PROFILES;
SHOW PROFILE FOR QUERY 1;
```

---

## Next Steps

1. ✅ Database setup - DONE
2. ✅ Server initialization - DONE
3. ⏳ Implement route handlers
4. ⏳ Add validation logic
5. ⏳ Add error handling
6. ⏳ Create unit tests
7. ⏳ Setup CI/CD pipeline
8. ⏳ Deploy to staging
9. ⏳ Integrate with frontend

---

## Useful Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Watch tests
npm test:watch

# Format code
npm run format

# Lint code
npm run lint

# View database
mysql -u root -p -D triptech

# Monitor server
pm2 start server.js
pm2 monit
pm2 logs

# Kill process on port
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## References

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT.io](https://jwt.io/)
- [Postman Learning Center](https://learning.postman.com/)

---

## Support & Documentation

For issues or questions:
- Check API_REFERENCE.md
- Review BACKEND_API_STRUCTURE.md
- Check database.sql schema

Last updated: January 2024
