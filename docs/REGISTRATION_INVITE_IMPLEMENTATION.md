# Registration & Trip Invite Management - Backend Implementation Guide

## Table of Contents

1. [Registration System](#registration-system)
2. [Trip Invite Management](#trip-invite-management)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Implementation Examples](#implementation-examples)
6. [Frontend Integration](#frontend-integration)

---

## Registration System

### Overview

Registration is **email-based** with automatic username and password generation:
- **Email** = Primary identifier for registration
- **Username** = Auto-generated from email prefix (e.g., `john@company.com` → `john`)
- **Password** = Auto-generated (8 random alphanumeric characters)
- **Role** = User selects during registration (logistics, owner, vendor)

### User Roles

| Role | Description | Can Create Accounts |
|------|-------------|-------------------|
| **Logistics Coordinator** | Manages trip logistics and invitations | Yes (self or manual) |
| **Trip Owner** | Creates and manages trip requests | Yes (self) |
| **Vendor** | Provides vehicles and logistics services | Yes (self) |
| **Driver** | Operates vehicles (created by logistics) | No (created by logistics) |
| **Admin** | System administrator | Yes (manual) |

### Registration Flow

```
User provides:
  - Full Name
  - Email (Primary)
  - Company Name
  - Phone (Optional)
  - Role (Logistics/Owner/Vendor)
  - Address (Optional)
        ↓
System Auto-generates:
  - Username (from email prefix)
  - Password (8 random chars)
        ↓
User created with:
  - Status: "Pending"
  - Email Verification: Not Sent
  - Password Changed: False
        ↓
Email sent with:
  - Default Credentials
  - Activation Link
  - Instructions to change password
```

### Registration Database Changes

**Modified: `users` table**

```sql
-- NEW FIELDS for registration management:
- company_name VARCHAR(255)           -- Auto-populated from registration
- status ENUM(..., 'Pending')          -- NEW: Pending, Active, Inactive, Suspended
- password_changed BOOLEAN             -- Track if user changed default password
- created_by VARCHAR(255)              -- Who created the account
```

### Sample User Creation (SQL)

```sql
INSERT INTO users (
  username, 
  email, 
  password_hash, 
  full_name, 
  phone, 
  role, 
  company_name,
  status,
  password_changed,
  created_at
) VALUES (
  'john',                              -- Auto-generated from email
  'john@company.com',                  -- Primary identifier
  SHA2('TxK9mP2L', 256),               -- Hashed auto-generated password
  'John Doe',
  '+1-234-567-8900',
  'logistics',
  'ABC Transport Co.',
  'Pending',                           -- Awaiting email verification
  FALSE,
  NOW()
);
```

---

## Trip Invite Management

### Invite Rules by Role

```
┌─────────────────────────────────────────────────────────────┐
│              ROLE-BASED INVITE PERMISSIONS                   │
├─────────────────────────────────────────────────────────────┤
│ LOGISTICS COORDINATOR (LC):                                  │
│   ✓ Can send invites to: Trip Owner (TO)                     │
│   ✓ Can send invites to: Vendor                              │
│   ✓ Can send invites to: Both (TO + Vendor)                  │
│   ✓ Can use own registered email OR manual entry             │
│                                                               │
│ TRIP OWNER (TO):                                             │
│   ✓ Can send invites to: Logistics Coordinator ONLY          │
│   ✗ Cannot send to Vendor                                    │
│   ✗ Cannot send to Both                                      │
│   ✓ Must use registered LC email                             │
│                                                               │
│ VENDOR:                                                       │
│   ✓ Can send invites to: Logistics Coordinator ONLY          │
│   ✗ Cannot send to Trip Owner                                │
│   ✗ Cannot send to Both                                      │
│   ✓ Must use registered LC email                             │
└─────────────────────────────────────────────────────────────┘
```

### Invite Scenarios

#### Scenario 1: LC Registered - Sending to TO & Vendor

```
CASE: Logistics Coordinator is registered in system

USER INPUT:
- Email: coordinator@abc.com (registered)
- Send To: Both (Trip Owner + Vendor)

SYSTEM BEHAVIOR:
1. Check if email exists in users table with role='logistics'
2. If YES:
   - Auto-populate LC Name from users.full_name
   - Auto-populate Company from users.company_name
   - Create 2 invites: one for TO, one for Vendor
3. Store invites in invitations table

DATABASE ENTRIES:
- invitation_type: 'LOGISTICS_COORDINATOR'
- to_role: 'Trip Owner' and 'Vendor'
- manual_entry: FALSE
- lc_name: <from registered user>
- lc_company_name: <from registered user>
```

#### Scenario 2: LC Not Registered - Manual Entry

```
CASE: Logistics Coordinator is NOT registered

USER INPUT (LC):
- Email: newlc@company.com (not in system)
- Send To: Vendor
- Manual Entry Required:
  - LC Name: "Sarah Johnson"
  - Company Name: "XYZ Logistics"

SYSTEM BEHAVIOR:
1. Check if email exists - NOT FOUND
2. Display modal: "LC not registered, enter details manually"
3. Get manual inputs for LC Name & Company
4. Create invite record

DATABASE ENTRY:
- invitation_type: 'LOGISTICS_COORDINATOR'
- to_role: 'Vendor'
- manual_entry: TRUE
- lc_name: "Sarah Johnson"
- lc_company_name: "XYZ Logistics"
- NOTE: Do NOT auto-create user account yet
```

#### Scenario 3: Trip Owner Sending Invite

```
CASE: Trip Owner can only send to Logistics Coordinator

USER INPUT (Trip Owner):
- Email: coordinator@abc.com
- Target: Logistics Coordinator (only option)

SYSTEM BEHAVIOR:
1. Verify email is registered with role='logistics'
2. If NOT registered: Show error "LC not registered"
3. If registered: Create invite to LC

DATABASE ENTRY:
- invitation_type: 'LOGISTICS_COORDINATOR'
- from_role: 'Trip Owner'
- to_role: 'Logistics Coordinator'
- manual_entry: FALSE
```

#### Scenario 4: Vendor Sending Invite

```
CASE: Vendor can only send to Logistics Coordinator

USER INPUT (Vendor):
- Email: coordinator@abc.com
- Target: Logistics Coordinator (only option)

SYSTEM BEHAVIOR:
1. Verify email is registered with role='logistics'
2. If registered: Create invite
3. If NOT registered: Show error "LC not registered"

DATABASE ENTRY:
- invitation_type: 'LOGISTICS_COORDINATOR'
- from_role: 'Vendor'
- to_role: 'Logistics Coordinator'
```

### Invite Status Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    INVITE STATUS FLOW                        │
├─────────────────────────────────────────────────────────────┤
│ Request_Sent                                                 │
│     ↓                                                         │
│     ├─→ Accepted (Recipient accepted)                       │
│     │     ↓                                                   │
│     │     └─→ Auto-register if unregistered                 │
│     │                                                         │
│     ├─→ Rejected (Recipient rejected)                       │
│     │                                                         │
│     └─→ Pending (Awaiting response)                         │
│           ↓                                                   │
│           └─→ Auto-expire after 30 days                     │
└─────────────────────────────────────────────────────────────┘
```

### New Invitations Table Fields

```sql
-- MODIFIED invitations TABLE

-- Core tracking
invitation_id VARCHAR(100)             -- Unique invite identifier
request_id VARCHAR(100) UNIQUE         -- Request reference number

-- Role-based tracking
invitation_type ENUM('TO', 'VENDOR', 'LOGISTICS_COORDINATOR')
from_user_id INT REFERENCES users(id)
from_role VARCHAR(50)                  -- Role of sender
to_role VARCHAR(50)                    -- Role of recipient

-- Recipient details
to_email VARCHAR(255)                  -- Email of recipient
lc_name VARCHAR(255)                   -- LC name (auto-populated or manual)
lc_company_name VARCHAR(255)           -- LC company (auto-populated or manual)
to_name VARCHAR(255)                   -- TO name
vendor_name VARCHAR(255)               -- Vendor name

-- Invite scope
send_to ENUM('TO', 'VENDOR', 'BOTH')   -- Who to send to
manual_entry BOOLEAN                   -- TRUE if LC details manually entered

-- Status tracking
status ENUM('Request_Sent', 'Accepted', 'Rejected', 'Pending')
sent_date TIMESTAMP
response_date TIMESTAMP
response_notes TEXT
```

---

## API Endpoints

### Authentication & Registration

#### POST /api/auth/register

Register a new user with email-based account creation.

**Request Body:**
```json
{
  "email": "john@company.com",
  "full_name": "John Doe",
  "company_name": "ABC Transport Co.",
  "role": "logistics",
  "phone": "+1-234-567-8900",
  "address": "123 Main St, City"
}
```

**Response (201 - Created):**
```json
{
  "success": true,
  "data": {
    "user_id": 42,
    "email": "john@company.com",
    "username": "john",
    "full_name": "John Doe",
    "role": "logistics",
    "default_password": "TxK9mP2L",
    "message": "Account created. Check email for verification."
  },
  "note": "Email & default credentials sent to john@company.com"
}
```

**Error Response (409 - Email Already Exists):**
```json
{
  "success": false,
  "error": "Email already registered",
  "statusCode": 409
}
```

---

#### POST /api/auth/verify-email

Verify email and activate account.

**Request Body:**
```json
{
  "token": "verification_token_from_email",
  "email": "john@company.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified. Account activated.",
  "data": {
    "user_id": 42,
    "status": "Active"
  }
}
```

---

#### POST /api/auth/change-password

User must change password on first login.

**Request Body:**
```json
{
  "current_password": "TxK9mP2L",
  "new_password": "SecureNewPassword123!",
  "confirm_password": "SecureNewPassword123!"
}
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Invite Management

#### POST /api/invites/send

Send invite based on role permissions.

**Request Body (Logistics Coordinator):**
```json
{
  "recipient_email": "owner@company.com",
  "send_to": "BOTH",
  "manual_lc_entry": false,
  "lc_name": null,
  "lc_company": null
}
```

**Request Body (Logistics Coordinator - Manual Entry):**
```json
{
  "recipient_email": "newlc@company.com",
  "send_to": "VENDOR",
  "manual_lc_entry": true,
  "lc_name": "Sarah Johnson",
  "lc_company": "XYZ Logistics"
}
```

**Request Body (Trip Owner - TO/Vendor to LC):**
```json
{
  "recipient_email": "coordinator@abc.com",
  "recipient_role": "logistics_coordinator"
}
```

**Response (201 - Created):**
```json
{
  "success": true,
  "data": {
    "invitation_id": "INV-42-001",
    "request_id": "REQ-4001",
    "status": "Request_Sent",
    "recipient_email": "owner@company.com",
    "send_to": "BOTH",
    "created_at": "2025-11-17T10:30:00Z"
  },
  "message": "Invite sent successfully"
}
```

**Error Response (403 - Permission Denied):**
```json
{
  "success": false,
  "error": "Vendors can only send invites to Logistics Coordinators",
  "statusCode": 403
}
```

**Error Response (404 - Recipient Not Found):**
```json
{
  "success": false,
  "error": "Logistics Coordinator not registered. Please enter details manually.",
  "statusCode": 404,
  "requiresManualEntry": true
}
```

---

#### GET /api/invites

Get all invites for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "invitation_id": "INV-42-001",
      "request_id": "REQ-4001",
      "from_email": "coordinator@abc.com",
      "from_role": "logistics",
      "send_to": "VENDOR",
      "lc_name": "John Coordinator",
      "lc_company": "ABC Logistics",
      "status": "Request_Sent",
      "sent_date": "2025-11-17T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

#### PUT /api/invites/:invitation_id/accept

Accept an invitation.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation accepted",
  "data": {
    "invitation_id": "INV-42-001",
    "status": "Accepted",
    "accepted_at": "2025-11-17T11:00:00Z"
  }
}
```

---

#### PUT /api/invites/:invitation_id/reject

Reject an invitation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rejection_reason": "Not interested at this time"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation rejected",
  "data": {
    "invitation_id": "INV-42-001",
    "status": "Rejected"
  }
}
```

---

#### DELETE /api/invites/:invitation_id

Delete/withdraw an invitation.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation deleted"
}
```

---

## Database Schema

### Users Table (Updated)

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | INT | PK | Auto-increment |
| username | VARCHAR(100) | UNIQUE | Auto-generated from email |
| email | VARCHAR(255) | UNIQUE | Primary identifier for registration |
| password_hash | VARCHAR(255) | - | SHA-256 hashed password |
| full_name | VARCHAR(255) | - | User's full name |
| phone | VARCHAR(20) | - | Contact number |
| company_name | VARCHAR(255) | - | NEW: Organization name |
| role | ENUM | INDEX | logistics, owner, vendor, driver, admin |
| status | ENUM | INDEX | Active, Inactive, Suspended, Pending |
| password_changed | BOOLEAN | - | NEW: Track if default password changed |
| created_by | VARCHAR(255) | - | NEW: Who created the account |
| created_at | TIMESTAMP | - | Account creation time |
| updated_at | TIMESTAMP | - | Last update time |

### Invitations Table (Updated)

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | INT | PK | Auto-increment |
| invitation_id | VARCHAR(100) | - | Unique identifier |
| request_id | VARCHAR(100) | UNIQUE | Reference number |
| invitation_type | ENUM | INDEX | TO, VENDOR, LOGISTICS_COORDINATOR |
| from_user_id | INT | FK | Sender's user ID |
| from_role | VARCHAR(50) | INDEX | Role of sender |
| to_email | VARCHAR(255) | INDEX | Recipient email |
| to_role | VARCHAR(50) | - | Role of recipient |
| lc_name | VARCHAR(255) | - | LC name (auto or manual) |
| lc_company_name | VARCHAR(255) | - | LC company (auto or manual) |
| send_to | ENUM | - | TO, VENDOR, or BOTH |
| manual_entry | BOOLEAN | - | TRUE if LC details manually entered |
| status | ENUM | INDEX | Request_Sent, Accepted, Rejected, Pending |
| sent_date | TIMESTAMP | - | When invite was sent |
| response_date | TIMESTAMP | - | When response received |

### Registration Audit Table (New)

| Column | Type | Key | Notes |
|--------|------|-----|-------|
| id | INT | PK | Auto-increment |
| user_id | INT | FK | Reference to users |
| email | VARCHAR(255) | INDEX | User's email |
| role | VARCHAR(50) | INDEX | Registered role |
| status | VARCHAR(50) | - | Registration status |
| registration_type | ENUM | - | Self, Manual, Invite-based |
| username_generated | VARCHAR(100) | - | Generated username |
| password_generated | BOOLEAN | - | Was password auto-generated? |
| ip_address | VARCHAR(45) | - | Registration IP |
| created_at | TIMESTAMP | INDEX | Registration time |

---

## Implementation Examples

### Example 1: Logistics Coordinator Registration

```javascript
// Frontend: User fills registration form
const registrationData = {
  email: "coordinator@abc.com",
  full_name: "John Coordinator",
  company_name: "ABC Logistics",
  role: "logistics",
  phone: "+1-234-567-8900"
};

// Backend Process
async function registerUser(registrationData) {
  // 1. Validate email is unique
  const existingUser = await User.findOne({ email: registrationData.email });
  if (existingUser) throw new Error('Email already registered');

  // 2. Generate default credentials
  const username = registrationData.email.split('@')[0]; // "coordinator"
  const defaultPassword = generateRandomPassword(8);     // "TxK9mP2L"
  const passwordHash = await hashPassword(defaultPassword);

  // 3. Create user with Pending status
  const user = await User.create({
    username,
    email: registrationData.email,
    password_hash: passwordHash,
    full_name: registrationData.full_name,
    company_name: registrationData.company_name,
    role: 'logistics',
    phone: registrationData.phone,
    status: 'Pending',
    password_changed: false,
    created_at: new Date()
  });

  // 4. Log registration audit
  await RegistrationAudit.create({
    user_id: user.id,
    email: user.email,
    role: 'logistics',
    username_generated: username,
    password_generated: true,
    registration_type: 'Self_Registration'
  });

  // 5. Send verification email with credentials
  await sendEmail({
    to: registrationData.email,
    subject: 'Welcome to TripTech - Activate Your Account',
    template: 'registration_welcome',
    data: {
      username,
      defaultPassword,
      verificationLink: `${APP_URL}/verify?token=${verificationToken}`,
      instructions: 'Please change your password after first login'
    }
  });

  return {
    user_id: user.id,
    email: user.email,
    username,
    default_password: defaultPassword
  };
}
```

### Example 2: Send Invite - LC to TO & Vendor

```javascript
async function sendInvite(inviteData, currentUser) {
  // 1. Validate role permissions
  if (currentUser.role !== 'logistics') {
    throw new Error('Only Logistics Coordinators can send to TO and Vendor');
  }

  // 2. Check if recipient is registered
  let recipientUser = await User.findOne({ 
    email: inviteData.recipient_email,
    role: 'logistics'
  });

  // 3. Prepare invite data
  const requestId = generateRequestId(); // "REQ-4001"
  
  if (recipientUser && !inviteData.manual_lc_entry) {
    // Auto-populate LC details from registered user
    var inviteRecord = {
      request_id: requestId,
      invitation_type: 'LOGISTICS_COORDINATOR',
      from_user_id: currentUser.id,
      from_role: currentUser.role,
      to_email: inviteData.recipient_email,
      lc_name: recipientUser.full_name,
      lc_company_name: recipientUser.company_name,
      send_to: inviteData.send_to,
      manual_entry: false,
      status: 'Request_Sent'
    };
  } else if (inviteData.manual_lc_entry) {
    // Use manually entered LC details
    var inviteRecord = {
      request_id: requestId,
      invitation_type: 'LOGISTICS_COORDINATOR',
      from_user_id: currentUser.id,
      from_role: currentUser.role,
      to_email: inviteData.recipient_email,
      lc_name: inviteData.lc_name,
      lc_company_name: inviteData.lc_company,
      send_to: inviteData.send_to,
      manual_entry: true,
      status: 'Request_Sent'
    };
  }

  // 4. Create invite record
  const invite = await Invitation.create(inviteRecord);

  // 5. Send invite notification
  await sendEmail({
    to: inviteData.recipient_email,
    subject: 'Trip Invitation from TripTech',
    template: 'invite_notification',
    data: {
      from_name: currentUser.full_name,
      lc_name: inviteRecord.lc_name,
      lc_company: inviteRecord.lc_company_name,
      request_id: requestId,
      acceptLink: `${APP_URL}/invites/${invite.id}/accept`,
      rejectLink: `${APP_URL}/invites/${invite.id}/reject`
    }
  });

  return invite;
}
```

### Example 3: Trip Owner Sending Invite to LC

```javascript
async function sendInviteFromTripOwner(inviteData, currentUser) {
  // 1. Validate role
  if (currentUser.role !== 'owner') {
    throw new Error('Only Trip Owners can use this endpoint');
  }

  // 2. Verify recipient is a registered Logistics Coordinator
  const lcUser = await User.findOne({
    email: inviteData.recipient_email,
    role: 'logistics'
  });

  if (!lcUser) {
    throw new Error('Logistics Coordinator not registered');
  }

  // 3. Create invite record
  const requestId = generateRequestId();
  const invite = await Invitation.create({
    request_id: requestId,
    invitation_type: 'LOGISTICS_COORDINATOR',
    from_user_id: currentUser.id,
    from_role: 'owner',
    to_email: lcUser.email,
    to_role: 'logistics',
    lc_name: lcUser.full_name,
    lc_company_name: lcUser.company_name,
    manual_entry: false,
    status: 'Request_Sent'
  });

  // 4. Send email
  await sendEmail({
    to: lcUser.email,
    subject: 'Trip Invitation from ' + currentUser.company_name,
    template: 'invite_notification',
    data: {
      from_name: currentUser.full_name,
      from_company: currentUser.company_name,
      request_id: requestId
    }
  });

  return invite;
}
```

---

## Frontend Integration

### Updated localStorage API Structure

The frontend will maintain the same localStorage API structure while the backend processes registration and invites:

```javascript
// Registration - continues to use similar API
const registerUser = (userData) => {
  // Frontend calls: POST /api/auth/register
  // Response contains: user_id, email, username, default_password
  localStorage.setItem('registeredUser', JSON.stringify(userData));
};

// Login - same structure
const loginUser = (credentials) => {
  // Frontend calls: POST /api/auth/login
  // Response contains: token, user object
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userRole', credentials.role);
};

// Invite Management - continues to use similar API
const getInvites = () => {
  // Frontend calls: GET /api/invites
  // Returns array of invites based on user role
  const invites = JSON.parse(localStorage.getItem('invites') || '[]');
  return invites;
};

const sendInvite = (inviteData) => {
  // Frontend calls: POST /api/invites/send
  // With role-based validation on both frontend and backend
  localStorage.setItem('lastInvite', JSON.stringify(inviteData));
};
```

### Migration Path

1. **Phase 1**: Backend registration API deployed (email-based)
2. **Phase 2**: Frontend registration form updated to call new API
3. **Phase 3**: Backend invite API deployed (role-based)
4. **Phase 4**: Frontend invite forms updated to call new API with validation
5. **Phase 5**: localStorage gradually deprecated for auth, kept for temp data

---

## Summary of Changes

### Database Changes
✅ `users` table: Added company_name, password_changed, created_by, Pending status
✅ `invitations` table: Added from_role, to_role, manual_entry, invitation_type refinement
✅ `registration_audit` table: NEW - Track all registration activities

### API Changes
✅ POST /api/auth/register - Email-based registration
✅ POST /api/auth/verify-email - Email verification
✅ POST /api/auth/change-password - Force password change
✅ POST /api/invites/send - Role-based invite sending
✅ GET /api/invites - Get user's invites
✅ PUT /api/invites/:id/accept - Accept invite
✅ PUT /api/invites/:id/reject - Reject invite
✅ DELETE /api/invites/:id - Delete invite

### Business Rules
✅ Registration via email with auto-generated credentials
✅ LC can send invites to TO, Vendor, or Both
✅ LC can use manual entry for unregistered users
✅ TO/Vendor can only send to registered LC
✅ Invite status lifecycle with auto-expiration
✅ Registration audit trail for compliance

---

## Next Steps

1. Implement backend registration endpoints
2. Set up email service for verification & invites
3. Implement invite management endpoints
4. Add role-based authorization middleware
5. Update frontend to call new APIs
6. Create admin dashboard for registration management
7. Implement email verification workflow
8. Set up invite expiration scheduler
