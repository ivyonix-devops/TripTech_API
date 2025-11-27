# Backend API Endpoints - Registration & Invite Management

## Base URL
```
http://localhost:3000/api
```

---

## Authentication Endpoints

### 1. Register New User
**POST** `/auth/register`

Register a new user with email-based account creation. System auto-generates username and password.

**Request:**
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

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user_id": 42,
    "email": "john@company.com",
    "username": "john",
    "full_name": "John Doe",
    "role": "logistics",
    "company_name": "ABC Transport Co.",
    "status": "Pending",
    "default_password": "TxK9mP2L",
    "credentials": {
      "username": "john",
      "password": "TxK9mP2L"
    },
    "message": "Account created successfully"
  },
  "notification": "Verification email sent to john@company.com"
}
```

**Error (409):**
```json
{
  "success": false,
  "error": "Email already registered",
  "statusCode": 409
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Invalid email format",
  "statusCode": 400,
  "required_fields": ["email", "full_name", "company_name", "role"]
}
```

---

### 2. Verify Email
**POST** `/auth/verify-email`

Verify email address using token sent to user's inbox.

**Request:**
```json
{
  "email": "john@company.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user_id": 42,
    "email": "john@company.com",
    "status": "Active"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid or expired verification token",
  "statusCode": 401
}
```

---

### 3. Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request:**
```json
{
  "username": "john",
  "password": "TxK9mP2L",
  "role": "logistics"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 42,
      "username": "john",
      "email": "john@company.com",
      "full_name": "John Doe",
      "role": "logistics",
      "company_name": "ABC Transport Co.",
      "status": "Active",
      "password_changed": false
    },
    "message": "Login successful"
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid username or password",
  "statusCode": 401
}
```

---

### 4. Change Password (First Login)
**POST** `/auth/change-password`

User must change password after first login. Required if `password_changed` is false.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "current_password": "TxK9mP2L",
  "new_password": "SecureNewPassword123!",
  "confirm_password": "SecureNewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "user_id": 42,
    "password_changed": true
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Current password is incorrect",
  "statusCode": 401
}
```

---

### 5. Get Current User Profile
**GET** `/auth/profile`

Get profile of authenticated user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "username": "john",
    "email": "john@company.com",
    "full_name": "John Doe",
    "role": "logistics",
    "company_name": "ABC Transport Co.",
    "phone": "+1-234-567-8900",
    "address": "123 Main St, City",
    "status": "Active",
    "password_changed": true
  }
}
```

---

### 6. Logout
**POST** `/auth/logout`

Logout user and invalidate token.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Invite Management Endpoints

### 1. Send Invite (Logistics Coordinator)
**POST** `/invites/send`

Logistics Coordinator sends invite to Trip Owner, Vendor, or Both.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request (Recipient Registered):**
```json
{
  "recipient_email": "owner@company.com",
  "send_to": "BOTH",
  "manual_entry": false
}
```

**Request (Manual Entry - Unregistered):**
```json
{
  "recipient_email": "newlc@company.com",
  "send_to": "VENDOR",
  "manual_entry": true,
  "lc_name": "Sarah Johnson",
  "lc_company": "XYZ Logistics"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "invitation_id": "INV-42-001",
    "request_id": "REQ-4001",
    "type": "LOGISTICS_COORDINATOR",
    "from_user_id": 42,
    "from_name": "John Coordinator",
    "from_email": "john@company.com",
    "recipient_email": "owner@company.com",
    "lc_name": "John Coordinator",
    "lc_company": "ABC Transport Co.",
    "send_to": "BOTH",
    "manual_entry": false,
    "status": "Request_Sent",
    "created_at": "2025-11-17T10:30:00Z"
  },
  "message": "Invite sent successfully"
}
```

**Error (403 - Permission Denied):**
```json
{
  "success": false,
  "error": "Only Logistics Coordinators can send to Trip Owners and Vendors",
  "statusCode": 403
}
```

---

### 2. Send Invite (Trip Owner to LC)
**POST** `/invites/send-to-lc`

Trip Owner sends invite to Logistics Coordinator only.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "recipient_email": "coordinator@abc.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "invitation_id": "INV-43-001",
    "request_id": "REQ-4002",
    "type": "LOGISTICS_COORDINATOR",
    "from_user_id": 43,
    "from_role": "owner",
    "from_name": "Jane Owner",
    "recipient_email": "coordinator@abc.com",
    "recipient_role": "logistics",
    "status": "Request_Sent",
    "created_at": "2025-11-17T11:00:00Z"
  },
  "message": "Invite sent to Logistics Coordinator"
}
```

**Error (404):**
```json
{
  "success": false,
  "error": "Logistics Coordinator not registered",
  "statusCode": 404
}
```

**Error (403):**
```json
{
  "success": false,
  "error": "Trip Owners can only send invites to Logistics Coordinators",
  "statusCode": 403
}
```

---

### 3. Send Invite (Vendor to LC)
**POST** `/invites/send-to-lc`

Vendor sends invite to Logistics Coordinator only.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "recipient_email": "coordinator@abc.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "invitation_id": "INV-44-001",
    "request_id": "REQ-4003",
    "type": "LOGISTICS_COORDINATOR",
    "from_user_id": 44,
    "from_role": "vendor",
    "from_name": "ABC Vendor Services",
    "recipient_email": "coordinator@abc.com",
    "status": "Request_Sent",
    "created_at": "2025-11-17T11:30:00Z"
  },
  "message": "Invite sent to Logistics Coordinator"
}
```

---

### 4. Get All Invites for Current User
**GET** `/invites`

Get all invites sent to or from current user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
```
?status=Request_Sent
?type=LOGISTICS_COORDINATOR
?page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": [
      {
        "invitation_id": "INV-42-001",
        "request_id": "REQ-4001",
        "recipient_email": "owner@company.com",
        "recipient_role": "owner",
        "status": "Request_Sent",
        "send_to": "BOTH",
        "created_at": "2025-11-17T10:30:00Z"
      }
    ],
    "received": [
      {
        "invitation_id": "INV-43-002",
        "request_id": "REQ-4002",
        "from_email": "coordinator@abc.com",
        "from_name": "John Coordinator",
        "from_role": "logistics",
        "status": "Pending",
        "created_at": "2025-11-16T14:20:00Z"
      }
    ]
  },
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

---

### 5. Get Single Invite Details
**GET** `/invites/:invitation_id`

Get detailed information about a specific invite.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "invitation_id": "INV-43-002",
    "request_id": "REQ-4002",
    "type": "LOGISTICS_COORDINATOR",
    "from_user_id": 42,
    "from_email": "coordinator@abc.com",
    "from_name": "John Coordinator",
    "from_role": "logistics",
    "from_company": "ABC Transport Co.",
    "recipient_email": "owner@company.com",
    "recipient_role": "owner",
    "lc_name": "John Coordinator",
    "lc_company": "ABC Transport Co.",
    "status": "Pending",
    "sent_date": "2025-11-16T14:20:00Z",
    "expires_at": "2025-12-16T14:20:00Z"
  }
}
```

---

### 6. Accept Invite
**PUT** `/invites/:invitation_id/accept`

Accept an invitation. If sender is unregistered, account may be auto-created.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request (Optional):**
```json
{
  "acceptance_note": "We accept the invitation"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "data": {
    "invitation_id": "INV-43-002",
    "request_id": "REQ-4002",
    "status": "Accepted",
    "accepted_at": "2025-11-17T12:00:00Z"
  }
}
```

---

### 7. Reject Invite
**PUT** `/invites/:invitation_id/reject`

Reject an invitation.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
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
    "invitation_id": "INV-43-002",
    "request_id": "REQ-4002",
    "status": "Rejected",
    "rejection_reason": "Not interested at this time",
    "rejected_at": "2025-11-17T12:15:00Z"
  }
}
```

---

### 8. Delete/Withdraw Invite
**DELETE** `/invites/:invitation_id`

Delete or withdraw an invitation (only by sender).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation deleted successfully",
  "data": {
    "invitation_id": "INV-42-001",
    "request_id": "REQ-4001",
    "deleted_at": "2025-11-17T13:00:00Z"
  }
}
```

**Error (403):**
```json
{
  "success": false,
  "error": "Only the sender can delete this invitation",
  "statusCode": 403
}
```

---

## User Management Endpoints

### 1. Update User Profile
**PUT** `/users/profile`

Update current user's profile information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "+1-234-567-8901",
  "address": "456 New St, City",
  "company_name": "ABC Transport Co. Updated"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 42,
    "full_name": "John Doe Updated",
    "email": "john@company.com",
    "phone": "+1-234-567-8901",
    "address": "456 New St, City",
    "updated_at": "2025-11-17T13:30:00Z"
  }
}
```

---

### 2. Get All Users (Admin Only)
**GET** `/users`

Get all users in the system (admin endpoint).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
```
?role=logistics
?status=Active
?company=ABC%20Transport
?page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "username": "john",
      "email": "john@company.com",
      "full_name": "John Doe",
      "role": "logistics",
      "company_name": "ABC Transport Co.",
      "status": "Active",
      "created_at": "2025-11-10T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error description",
  "statusCode": 400,
  "details": {
    "field": "error specific to field"
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials or expired token |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Email already registered |
| 500 | Server Error - Internal server error |

---

## Authentication

All endpoints (except login, register, verify-email) require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

Token is valid for 24 hours. After expiration, user must login again.

---

## Rate Limiting

- Login: 5 attempts per 15 minutes per IP
- Registration: 3 attempts per hour per IP
- Invite Send: 50 invites per day per user
- General API: 1000 requests per hour per user

---

## Testing with curl/Postman

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "full_name": "Test User",
    "company_name": "Test Co.",
    "role": "logistics"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "password123",
    "role": "logistics"
  }'
```

### Send Invite
```bash
curl -X POST http://localhost:3000/api/invites/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "owner@company.com",
    "send_to": "BOTH",
    "manual_entry": false
  }'
```

---

## API Version

Current Version: **1.0.0**

Last Updated: November 17, 2025
