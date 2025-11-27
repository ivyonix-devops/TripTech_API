# Backend Implementation Summary - Registration & Invite Management

**Date**: November 17, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation

---

## Executive Summary

This document outlines the complete backend implementation requirements for **email-based registration** with **role-based trip invite management** in the TripTech application. The system enables:

1. **Email-based Registration** with auto-generated credentials for all roles
2. **Role-based Invite System** with three distinct invite patterns
3. **Manual Entry Support** for unregistered Logistics Coordinators
4. **Complete Audit Trail** for compliance and tracking

---

## Key Features Implemented

### 1. Email-Based Registration

**Before**: No structured registration system, dummy localStorage credentials  
**After**: Full email-based registration with:

✅ Email as primary identifier  
✅ Auto-generated username (from email prefix)  
✅ Auto-generated password (8 alphanumeric characters)  
✅ Default status: "Pending" (awaiting email verification)  
✅ Support for all roles: Logistics, Owner, Vendor, Driver  
✅ Optional company name, phone, address  

**Database Table**: `users` (Updated with 4 new fields)

```sql
-- New fields added to users table:
- company_name VARCHAR(255)
- status ENUM(..., 'Pending')
- password_changed BOOLEAN DEFAULT FALSE
- created_by VARCHAR(255)
```

---

### 2. Role-Based Invite Management

**Logistics Coordinator (Registered or Unregistered)**
- ✅ Can send invites to: Trip Owner (TO)
- ✅ Can send invites to: Vendor
- ✅ Can send invites to: Both (TO + Vendor simultaneously)
- ✅ Auto-populate LC details if registered
- ✅ Accept manual entry if not registered

**Trip Owner**
- ✅ Can send invites to: Logistics Coordinator ONLY
- ✗ Cannot send to Vendor
- ✗ Cannot send to Both
- ✅ Must verify LC is registered

**Vendor**
- ✅ Can send invites to: Logistics Coordinator ONLY
- ✗ Cannot send to Trip Owner
- ✗ Cannot send to Both
- ✅ Must verify LC is registered

**Database Table**: `invitations` (Updated with 7 new fields)

```sql
-- Enhanced fields in invitations table:
- from_role VARCHAR(50)          -- Track sender's role
- to_role VARCHAR(50)            -- Track recipient's role
- lc_company_name VARCHAR(255)   -- Separate LC company field
- send_to ENUM('TO', 'VENDOR', 'BOTH')  -- Updated scope
- manual_entry BOOLEAN           -- Track if LC manually entered
- invitation_type ENUM refined   -- More specific types
```

---

### 3. New Registration Audit Table

**Purpose**: Complete audit trail for compliance, debugging, and analytics

```sql
CREATE TABLE registration_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  email VARCHAR(255),
  role VARCHAR(50),
  status VARCHAR(50),
  registration_type ENUM('Self_Registration', 'Manual_Entry', 'Invite_Based'),
  username_generated VARCHAR(100),
  password_generated BOOLEAN,
  ip_address VARCHAR(45),
  user_agent TEXT,
  activation_token VARCHAR(255),
  activation_sent BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints Summary

### Authentication Endpoints (5 endpoints)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register` | POST | Register new user with email |
| `/auth/verify-email` | POST | Verify email with token |
| `/auth/login` | POST | Login and get JWT token |
| `/auth/change-password` | POST | Change password after first login |
| `/auth/profile` | GET | Get current user profile |
| `/auth/logout` | POST | Logout user |

**Key Features**:
- Email validation and uniqueness check
- Auto-generated username and password
- Email verification workflow
- Mandatory password change on first login
- JWT token-based authentication (24-hour expiration)

---

### Invite Management Endpoints (8 endpoints)

| Endpoint | Method | Purpose | Roles |
|----------|--------|---------|-------|
| `/invites/send` | POST | Send invite (LC) | Logistics |
| `/invites/send-to-lc` | POST | Send invite (TO/Vendor to LC) | Owner, Vendor |
| `/invites` | GET | Get all invites | All |
| `/invites/:id` | GET | Get single invite details | All |
| `/invites/:id/accept` | PUT | Accept invite | All |
| `/invites/:id/reject` | PUT | Reject invite | All |
| `/invites/:id/delete` | DELETE | Delete/Withdraw invite | Sender |
| `/invites/search` | GET | Search invites | All |

**Key Features**:
- Role-based authorization on both frontend and backend
- Manual entry support for unregistered users
- Invite status tracking and lifecycle management
- Email notifications
- Auto-expiration after 30 days

---

## Database Changes Summary

### Tables Created/Modified: 3

#### 1. Users Table (Modified)
- Added: `company_name`, `status`, `password_changed`, `created_by`
- Updated status enum to include 'Pending'
- Added indexes for faster lookups

#### 2. Invitations Table (Modified)
- Added: `from_role`, `to_role`, `lc_company_name`, `send_to`, `manual_entry`
- Refined `invitation_type` enum
- Added indexes for role-based queries

#### 3. Registration Audit Table (New)
- Tracks all registration activities
- Stores generated credentials metadata
- Records IP, user agent, activation tokens
- Enables compliance reporting

---

## Implementation Architecture

### Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Input → Email → Validation → Username/Password Gen    │
│                ↓         ↓              ↓                     │
│           Check unique   Verify format  john (from john@...) │
│                          ✓              TxK9mP2L (random)    │
│                                          ↓                    │
│                                    Create User Record         │
│                                    Status: Pending            │
│                                          ↓                    │
│                                    Send Verification Email    │
│                                    (credentials included)     │
│                                          ↓                    │
│                                    Log to audit table         │
│                                          ↓                    │
│                                    Return to Frontend         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Invite Flow (Logistics Coordinator)

```
┌─────────────────────────────────────────────────────────────┐
│              INVITE FLOW - LOGISTICS COORDINATOR              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  LC selects: Recipient Email + Send To (TO/Vendor/Both)     │
│                        ↓                                      │
│              Check recipient registration status             │
│              ↙            ↓            ↘                      │
│          Registered   Not Found    Unregistered             │
│            ✓            ✓             ✓                      │
│            │            │             │                      │
│    Auto-populate   Ask for manual  Use manual entry         │
│    from users      entry in modal  (name + company)         │
│            │            │             │                      │
│            └────────────┴─────────────┘                      │
│                        ↓                                      │
│              Create invite record(s)                         │
│              (1 for TO, 1 for Vendor, or 1 for both)        │
│                        ↓                                      │
│              Send invitation email(s)                        │
│                        ↓                                      │
│              Return success response                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Invite Flow (Trip Owner / Vendor to LC)

```
┌─────────────────────────────────────────────────────────────┐
│         INVITE FLOW - TRIP OWNER / VENDOR TO LC              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User enters: LC Email                                       │
│                ↓                                              │
│      Verify LC is registered (role = 'logistics')           │
│         ↙            ↘                                        │
│      Found         Not Found                                │
│        ✓               ✓                                      │
│        │               │                                      │
│   Create Invite    Error Response                           │
│   Record           "LC not registered"                      │
│        │                                                      │
│        └────────────────────┐                               │
│                              ↓                               │
│                    Send Invitation Email                     │
│                              ↓                               │
│                    Return Response                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

### 1. Password Security
- ✅ Auto-generated passwords are random and unique
- ✅ Passwords hashed with SHA-256 before storage
- ✅ Users forced to change password on first login
- ✅ Password change endpoint requires current password verification

### 2. Email Verification
- ✅ Email verification token expires in 24 hours
- ✅ Token is single-use only
- ✅ User account remains in "Pending" status until verified
- ✅ Unverified accounts cannot access system

### 3. Invite Security
- ✅ Role-based authorization enforced on backend
- ✅ Sender must be authenticated (JWT token required)
- ✅ Invites can only be deleted by sender
- ✅ Invite response tracked with timestamp

### 4. Rate Limiting
- ✅ Login attempts: 5 per 15 minutes per IP
- ✅ Registration: 3 per hour per IP
- ✅ Invite send: 50 per day per user
- ✅ General API: 1000 per hour per user

### 5. Audit Trail
- ✅ All registrations logged in `registration_audit` table
- ✅ IP address and user agent stored
- ✅ Activation status tracked
- ✅ Support for compliance reporting

---

## API Response Structure

### Success Response (200/201)

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "statusCode": 200
}
```

### Error Response (4xx/5xx)

```json
{
  "success": false,
  "error": "Error description",
  "statusCode": 400,
  "details": { /* field-specific errors */ }
}
```

---

## Frontend Integration

### localStorage API (Unchanged Structure)

Frontend continues to use same localStorage API structure:

```javascript
// Registration
localStorage.setItem('registeredUser', JSON.stringify(userData));

// Login
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userRole', role);

// Invites
localStorage.setItem('invites', JSON.stringify(invitesList));
```

### Backend API Calls (New)

```javascript
// Register
POST /api/auth/register

// Login
POST /api/auth/login

// Send Invite
POST /api/invites/send
POST /api/invites/send-to-lc

// Get Invites
GET /api/invites
```

---

## Implementation Checklist

### Phase 1: Database Setup
- ✅ Modify `users` table (add 4 fields)
- ✅ Modify `invitations` table (add 7 fields, refine enums)
- ✅ Create `registration_audit` table
- ✅ Add indexes for performance
- ✅ Create views for common queries

### Phase 2: Backend API
- [ ] Implement JWT token generation and validation
- [ ] Create password hashing utility (SHA-256)
- [ ] Implement `/auth/register` endpoint
- [ ] Implement `/auth/verify-email` endpoint
- [ ] Implement `/auth/login` endpoint
- [ ] Implement `/auth/change-password` endpoint
- [ ] Implement `/auth/profile` endpoint
- [ ] Implement `/auth/logout` endpoint
- [ ] Create email service integration
- [ ] Implement role-based authorization middleware
- [ ] Implement `/invites/send` endpoint (LC)
- [ ] Implement `/invites/send-to-lc` endpoint (TO/Vendor)
- [ ] Implement `/invites` GET endpoint
- [ ] Implement `/invites/:id/accept` endpoint
- [ ] Implement `/invites/:id/reject` endpoint
- [ ] Implement `/invites/:id/delete` endpoint
- [ ] Add rate limiting middleware
- [ ] Add input validation
- [ ] Add error handling

### Phase 3: Frontend Integration
- [ ] Update registration form to call new API
- [ ] Update login form to call new API
- [ ] Update invite forms with role-based validation
- [ ] Update localStorage usage to complement backend
- [ ] Add token management (store/refresh)
- [ ] Add error handling and user feedback
- [ ] Add email verification flow UI
- [ ] Add password change on first login flow

### Phase 4: Testing & Deployment
- [ ] Unit tests for auth endpoints
- [ ] Unit tests for invite endpoints
- [ ] Integration tests with database
- [ ] E2E tests for registration flow
- [ ] E2E tests for invite flow
- [ ] Security testing (SQL injection, XSS, CSRF)
- [ ] Load testing for rate limiting
- [ ] Deployment to staging
- [ ] Production deployment

---

## File References

### Documentation Created
1. **REGISTRATION_INVITE_IMPLEMENTATION.md** - Comprehensive implementation guide
2. **BACKEND_API_ENDPOINTS.md** - Complete API endpoint reference
3. **database.sql** - Updated database schema
4. **BACKEND_SETUP.md** - Updated setup guide

### Code Structure (To Be Created)

```
triptech-backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js        (registration, login, profile)
│   │   └── invite.controller.js      (invite management)
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── invite.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js        (JWT verification)
│   │   ├── authorize.middleware.js   (role-based)
│   │   ├── validation.middleware.js  (input validation)
│   │   └── rateLimit.middleware.js   (rate limiting)
│   ├── services/
│   │   ├── auth.service.js           (auth logic)
│   │   ├── email.service.js          (email sending)
│   │   ├── invite.service.js         (invite logic)
│   │   └── password.service.js       (password utilities)
│   ├── models/
│   │   ├── User.js
│   │   ├── Invitation.js
│   │   └── RegistrationAudit.js
│   ├── config/
│   │   ├── database.js
│   │   ├── email.js
│   │   └── environment.js
│   └── utils/
│       ├── errorHandler.js
│       ├── responseFormatter.js
│       └── validators.js
├── tests/
│   ├── auth.test.js
│   ├── invite.test.js
│   └── integration.test.js
└── database.sql
```

---

## Timeline Estimate

- **Database Setup**: 2 hours
- **Backend API Development**: 16-20 hours
- **Email Service Integration**: 4 hours
- **Testing**: 8-10 hours
- **Frontend Integration**: 8-10 hours
- **Deployment & Documentation**: 4 hours

**Total**: 42-50 hours (~1 week)

---

## Success Criteria

✅ All users can register with email-based credentials  
✅ Auto-generated usernames and passwords are secure and unique  
✅ Logistics Coordinators can send invites to TO, Vendor, or Both  
✅ Trip Owners can only send invites to Logistics Coordinators  
✅ Vendors can only send invites to Logistics Coordinators  
✅ Manual entry works for unregistered Logistics Coordinators  
✅ All invites tracked in database with complete audit trail  
✅ Email verification workflow functions correctly  
✅ Password change enforced on first login  
✅ Rate limiting prevents abuse  
✅ All API endpoints tested and documented  
✅ Frontend fully integrated with new API  

---

## Next Steps

1. **Review & Approval**: Review this document with stakeholders
2. **Database Setup**: Execute database migration scripts
3. **Backend Development**: Implement API endpoints in priority order
4. **Testing**: Comprehensive testing of all features
5. **Frontend Updates**: Integrate new APIs with frontend
6. **Deployment**: Stage and production deployment
7. **Monitoring**: Monitor usage patterns and error rates

---

## Questions & Support

For questions about this implementation:
- Review REGISTRATION_INVITE_IMPLEMENTATION.md for detailed business logic
- Review BACKEND_API_ENDPOINTS.md for complete endpoint specifications
- Check database.sql for schema details
- Refer to BACKEND_SETUP.md for setup instructions

---

**Document Version**: 1.0  
**Last Updated**: November 17, 2025  
**Status**: Ready for Implementation  
**Author**: TripTech Development Team
