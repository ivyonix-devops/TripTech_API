# TripTech - Complete Backend Implementation Guide

## 📋 Project Overview

TripTech is a comprehensive trip management platform with roles for Logistics Coordinators, Trip Owners, and Vendors. This documentation covers the complete backend implementation to replace the current localStorage-based system with a robust API architecture.

---

## 📁 Documentation Files Included

### 1. **BACKEND_API_DOCUMENTATION.md**
   - Complete API reference for all endpoints
   - Request/response formats
   - Error handling
   - Authentication requirements
   - Frontend integration notes

### 2. **BACKEND_SETUP.md**
   - Installation and configuration guide
   - Database setup procedures
   - Environment configuration
   - Deployment instructions
   - Troubleshooting guide

### 3. **database.sql**
   - Complete database schema
   - 16 tables with relationships
   - Indexes for performance
   - Views for common queries
   - Stored procedures
   - Default data

### 4. **MIGRATION_GUIDE.md**
   - Step-by-step migration from localStorage
   - Code examples (before/after)
   - Testing procedures
   - Rollback procedures
   - Timeline and checklist

### 5. **README.md** (This File)
   - Project overview
   - Quick start guide
   - Feature summary
   - Architecture diagram

---

## 🎯 Key Features

### 1. Registration System
- **Email-Based Registration**: Users register with email
- **Auto-Generated Credentials**: Username and password generated automatically
- **Role Assignment**: During registration (logistics, owner, vendor)
- **Credential Notification**: Credentials sent via email
- **Forced Password Change**: Users change password on first login

### 2. Trip Invite Management
- **Logistics Coordinator Privileges**
  - Can invite Trip Owner, Vendor, or Both
  - Can invite unregistered users (must provide LC details)
  - Auto-creates accounts for unregistered recipients

- **Trip Owner/Vendor Restrictions**
  - Can only invite Logistics Coordinators
  - Cannot invite each other

### 3. Trip Types Management
- Create, Read, Update, Delete (CRUD) operations
- Status management (Active/Inactive)
- Service field definitions
- Audit trail

### 4. Logistics Coordinator Management
- Registration with unique username/password
- Role-based access control
- Location tracking
- Status management

### 5. Data Management
- Trips, drivers, vehicles, vendors, owners
- Trip costs and incharges
- Attachments and documents
- Comprehensive audit logging

---

## 🚀 Quick Start Guide

### Prerequisites
```bash
# System Requirements
- Node.js v14+
- MySQL 5.7+
- npm v6+
```

### Step 1: Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE triptech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -u root -p triptech_db < database.sql
```

### Step 2: Backend Setup

```bash
# Create backend directory
mkdir triptech-backend
cd triptech-backend

# Initialize and install
npm init -y
npm install express mysql2/promise dotenv bcryptjs jsonwebtoken nodemailer cors

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_NAME=triptech_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CORS_ORIGIN=http://localhost:3000
EOF
```

### Step 3: Frontend Configuration

```javascript
// .env in React app
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

---

## 📊 Database Architecture

### Core Tables (16 Total)

```
Users Layer:
├── users (core authentication)
├── registration_audit (track signups)
└── sessions (session management)

Trip Management:
├── trips
├── trip_types
├── trip_costs
├── trip_incharges
└── trip_attachments

People Management:
├── trip_coordinators
├── operations_users
├── drivers
├── vehicles
├── vendors
└── owners

Communication:
├── invites
└── user_audit_log
```

### Key Relationships

```
users (1) ──→ (M) trips
users (1) ──→ (M) drivers
users (1) ──→ (M) vehicles
users (1) ──→ (M) trip_coordinators
users (1) ──→ (M) operations_users
trips (1) ──→ (M) trip_costs
trips (1) ──→ (M) trip_incharges
trips (1) ──→ (M) trip_attachments
```

---

## 🔐 Security Features

### Authentication
- JWT-based token authentication
- Bcrypt password hashing (10+ rounds)
- Password change required on first login
- Session management

### Authorization
- Role-based access control (RBAC)
- Invite restrictions by role
- Data isolation per user

### Audit Trail
- User action logging
- Registration tracking
- Failed login attempts
- Data change history

### Data Protection
- Encrypted sensitive fields
- Database backups
- Input validation
- SQL injection prevention

---

## 📡 API Response Structure

All API endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    ...
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## 🔄 Frontend Integration

### Minimal Changes Required

The API maintains the same response structure as current localStorage implementation:

**Before (localStorage):**
```javascript
const data = JSON.parse(localStorage.getItem('trips') || '[]');
setTrips(data);
```

**After (API):**
```javascript
const response = await apiService({
  method: 'get',
  url: '/trips'
});
if (response.success) {
  setTrips(response.data);
}
```

### Drop-in API Service
- Use existing `apiService` with minimal modifications
- Same request/response format
- Automatic JWT token handling
- Error handling built-in

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
- Postman collection included
- API endpoint validation
- Database trigger tests

### End-to-End Tests
```bash
npm run test:e2e
```

### Performance Tests
- Load testing with concurrent requests
- Database query optimization
- Response time validation

---

## 📦 Deployment

### Local Development
```bash
npm run dev
```

### Staging
```bash
NODE_ENV=staging npm start
```

### Production
```bash
NODE_ENV=production pm2 start server.js
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

## 🔧 Configuration

### Environment Variables
```env
# Server
NODE_ENV=development
PORT=5000
API_BASE_URL=http://localhost:5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=triptech_db
DB_USER=triptech_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=very_long_secure_random_string
JWT_EXPIRY=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@triptech.com
EMAIL_PASSWORD=app_password

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Database created and schema imported
- [ ] Backend directory initialized
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] JWT secret generated
- [ ] Email service configured

### Phase 2: Core Features
- [ ] Authentication (register/login)
- [ ] User profile endpoints
- [ ] Trip Types CRUD
- [ ] Coordinator management
- [ ] Invite system (all scenarios)

### Phase 3: Advanced Features
- [ ] Trips management
- [ ] Driver/Vehicle management
- [ ] Vendor/Owner management
- [ ] Attachment handling
- [ ] Audit logging

### Phase 4: Testing & Deployment
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Staging deployment successful
- [ ] Production deployment ready

---

## 🚨 Common Issues & Solutions

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:** Check MySQL service is running and credentials are correct

### JWT Token Issues
```
Error: TokenExpiredError: jwt expired
```
**Solution:** Implement token refresh endpoint and handle expiration gracefully

### CORS Errors
```
Error: Cross-Origin Request Blocked
```
**Solution:** Verify CORS_ORIGIN in .env matches frontend URL

### Email Delivery Issues
```
Error: SMTP connection failed
```
**Solution:** Verify email credentials and Gmail app password settings

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Kill process using port or change PORT in .env

---

## 📚 API Endpoint Summary

### Authentication (5 endpoints)
- POST `/auth/register` - Register new user
- POST `/auth/login` - User login
- POST `/auth/logout` - User logout
- POST `/auth/refresh` - Refresh JWT token
- GET `/auth/profile` - Get user profile

### Trip Types (5 endpoints)
- POST `/trip-types` - Create
- GET `/trip-types` - Get all
- GET `/trip-types/:id` - Get one
- PUT `/trip-types/:id` - Update
- DELETE `/trip-types/:id` - Delete

### Trip Coordinators (5 endpoints)
- POST `/coordinators` - Create
- GET `/coordinators` - Get all
- GET `/coordinators/:id` - Get one
- PUT `/coordinators/:id` - Update
- DELETE `/coordinators/:id` - Delete

### Trip Invites (7 endpoints)
- POST `/invites/send` - Send invite
- GET `/invites?filter=received` - Get received
- GET `/invites?filter=sent` - Get sent
- PUT `/invites/:id/accept` - Accept
- PUT `/invites/:id/reject` - Reject
- DELETE `/invites/:id` - Delete
- GET `/invites/:id` - Get details

### Trips (5 endpoints)
- POST `/trips` - Create
- GET `/trips` - Get all
- GET `/trips/:id` - Get one
- PUT `/trips/:id` - Update
- DELETE `/trips/:id` - Delete

### Operations Users (5 endpoints)
- POST `/operations/users` - Create
- GET `/operations/users` - Get all
- GET `/operations/users/:id` - Get one
- PUT `/operations/users/:id` - Update
- DELETE `/operations/users/:id` - Delete

---

## 📖 Additional Resources

### Frontend Components that Need Updates
1. `src/views/pages/services/Logistics/TripTypes.jsx`
2. `src/views/pages/tripcoordinators/TripCoordinators.jsx`
3. `src/views/pages/tripcoordinators/AddCoordinator.jsx`
4. `src/views/pages/invite/Logistics/AddInvite.jsx`
5. `src/views/pages/invite/TripOwner/AddInvite.jsx`
6. `src/views/pages/trips/Trip_Owner/Trips.jsx`
7. `src/views/pages/trips/Logistics/Trips.jsx`

### Key Service Files
1. `src/services/apiService.js` - Main API wrapper
2. `src/services/authService.js` - Authentication
3. `src/services/inviteService.js` - Invite management

---

## 🤝 Support & Contribution

### Getting Help
1. Check BACKEND_API_DOCUMENTATION.md for endpoint details
2. Refer to BACKEND_SETUP.md for installation issues
3. See MIGRATION_GUIDE.md for frontend integration help

### Reporting Issues
- Document the exact error message
- Provide API endpoint and request body
- Include database schema version
- Attach error logs and stack traces

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-20 | Initial backend schema and API documentation |
| 1.1 | 2025-01-20 | Added registration and invite management |

---

## ✅ Sign-Off Checklist

- [ ] All documentation reviewed
- [ ] Database schema approved
- [ ] API endpoints validated
- [ ] Security requirements confirmed
- [ ] Testing plan confirmed
- [ ] Deployment schedule set
- [ ] Team trained on new system
- [ ] Rollback procedure documented
- [ ] Monitoring configured
- [ ] Go-live approved

---

## 📞 Contact & Support

**Project Lead:** TripTech Development Team
**Documentation:** January 20, 2025
**Support Email:** support@triptech.com

---

## 📄 License

TripTech Backend System © 2025. All rights reserved.

---

## 🎓 Learning Resources

### Recommended Reading
- [Express.js Official Guide](https://expressjs.com/)
- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Security Guidelines](https://owasp.org/)

### Tools
- [Postman API Client](https://www.postman.com/)
- [DBeaver Database Manager](https://dbeaver.io/)
- [Insomnia REST Client](https://insomnia.rest/)
- [Thunder Client VS Code Extension](https://www.thunderclient.com/)

---

## 🎉 Next Steps

1. **Review Documentation**
   - Read all markdown files
   - Understand API structure
   - Review database schema

2. **Setup Backend**
   - Follow BACKEND_SETUP.md
   - Configure environment
   - Test database connection

3. **Implement APIs**
   - Create controllers
   - Implement routes
   - Add middleware

4. **Migrate Frontend**
   - Follow MIGRATION_GUIDE.md
   - Update components
   - Test thoroughly

5. **Deploy**
   - Test in staging
   - Deploy to production
   - Monitor and support

---

**Ready to implement? Start with BACKEND_SETUP.md!** 🚀

