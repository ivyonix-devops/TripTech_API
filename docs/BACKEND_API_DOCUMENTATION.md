# TripTech Backend API Documentation

## Overview
This document outlines the backend API structure that replaces the current localStorage implementation. The API maintains the same structure as the frontend with minimal changes required.

---

## 1. Authentication & User Management APIs

### 1.1 User Registration
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "logistics|owner|vendor",
  "status": "Active|Inactive"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "john.doe",
    "password": "auto_generated_password",
    "role": "logistics",
    "status": "Active",
    "createdAt": "2025-01-20T10:00:00Z"
  },
  "message": "User registered successfully"
}
```

### 1.2 User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "john.doe",
    "role": "logistics",
    "status": "Active",
    "token": "jwt_token"
  }
}
```

---

## 2. Trip Types Management APIs

### 2.1 Create Trip Type
**Endpoint:** `POST /trip-types`

**Request Body:**
```json
{
  "tripType": "One Way Transfer",
  "tripName": "Standard One Way",
  "triptypeStatus": "Active|Inactive",
  "triptypeRemarks": "Standard transfer between two locations",
  "createdBy": "logistics_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "trip_type_id",
    "tripType": "One Way Transfer",
    "tripName": "Standard One Way",
    "triptypeStatus": "Active",
    "triptypeRemarks": "Standard transfer between two locations",
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

### 2.2 Get All Trip Types
**Endpoint:** `GET /trip-types`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "trip_type_id",
      "tripType": "One Way Transfer",
      "tripName": "Standard One Way",
      "triptypeStatus": "Active",
      "triptypeRemarks": "...",
      "createdAt": "..."
    }
  ]
}
```

### 2.3 Get Trip Type by ID
**Endpoint:** `GET /trip-types/:id`

### 2.4 Update Trip Type
**Endpoint:** `PUT /trip-types/:id`

**Request Body:**
```json
{
  "tripType": "One Way Transfer",
  "tripName": "Updated Trip Type",
  "triptypeStatus": "Active",
  "triptypeRemarks": "Updated remarks"
}
```

### 2.5 Delete Trip Type
**Endpoint:** `DELETE /trip-types/:id`

---

## 3. Trip Coordinator Management APIs

### 3.1 Create Trip Coordinator (Registration-based)
**Endpoint:** `POST /coordinators`

**Request Body:**
```json
{
  "email": "coordinator@example.com",
  "name": "John Coordinator",
  "coordinatorType": "Logistics Coordinator|Logistics Staff|Operations Staff",
  "location": "New York",
  "status": "Active|Inactive",
  "createdBy": "admin_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coordinatorId": "coordinator_id",
    "userId": "user_id",
    "email": "coordinator@example.com",
    "username": "john.coordinator",
    "password": "auto_generated_password",
    "name": "John Coordinator",
    "coordinatorType": "Logistics Coordinator",
    "location": "New York",
    "status": "Active",
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

### 3.2 Get All Coordinators
**Endpoint:** `GET /coordinators`

**Query Parameters:**
- `status`: "Active|Inactive" (optional)
- `coordinatorType`: "Logistics Coordinator|Logistics Staff" (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "coordinatorId": "coordinator_id",
      "name": "John Coordinator",
      "email": "coordinator@example.com",
      "coordinatorType": "Logistics Coordinator",
      "location": "New York",
      "status": "Active"
    }
  ]
}
```

### 3.3 Get Coordinator by ID
**Endpoint:** `GET /coordinators/:id`

### 3.4 Update Coordinator
**Endpoint:** `PUT /coordinators/:id`

**Request Body:**
```json
{
  "name": "Updated Name",
  "coordinatorType": "Logistics Coordinator",
  "location": "Boston",
  "status": "Active"
}
```

### 3.5 Delete Coordinator
**Endpoint:** `DELETE /coordinators/:id`

---

## 4. Trip Invite Management APIs

### 4.1 Send Invite (Logistics Coordinator to Trip Owner/Vendor/Both)
**Endpoint:** `POST /invites/send`

**Request Body (Coordinator Sending to Registered User):**
```json
{
  "senderUserId": "coordinator_user_id",
  "senderEmail": "coordinator@example.com",
  "recipientEmail": "owner@example.com",
  "sendTo": "Trip Owner|Vendor|Both",
  "inviteType": "trip_management",
  "message": "Optional message"
}
```

**Request Body (Coordinator Sending to Unregistered User):**
```json
{
  "senderUserId": "coordinator_user_id",
  "senderEmail": "coordinator@example.com",
  "recipientEmail": "owner@example.com",
  "sendTo": "Trip Owner|Vendor|Both",
  "lcName": "Logistics Coordinator Name",
  "lcCompany": "Logistics Company Name",
  "inviteType": "trip_management"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inviteId": "invite_id",
    "senderUserId": "coordinator_user_id",
    "senderEmail": "coordinator@example.com",
    "recipientEmail": "owner@example.com",
    "sendTo": "Trip Owner",
    "status": "Pending",
    "createdAt": "2025-01-20T10:00:00Z",
    "expiresAt": "2025-02-03T10:00:00Z"
  }
}
```

### 4.2 Send Invite (Trip Owner/Vendor to Logistics Coordinator)
**Endpoint:** `POST /invites/send`

**Request Body (To Registered Coordinator):**
```json
{
  "senderUserId": "owner_user_id",
  "senderEmail": "owner@example.com",
  "recipientEmail": "coordinator@example.com",
  "sendTo": "Logistics Coordinator",
  "inviteType": "trip_management"
}
```

**Request Body (To Unregistered Coordinator):**
```json
{
  "senderUserId": "owner_user_id",
  "senderEmail": "owner@example.com",
  "recipientEmail": "coordinator@example.com",
  "sendTo": "Logistics Coordinator",
  "lcName": "LC Name",
  "lcCompany": "LC Company",
  "inviteType": "trip_management"
}
```

### 4.3 Get Received Invites
**Endpoint:** `GET /invites?filter=received`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "inviteId": "invite_id",
      "senderEmail": "coordinator@example.com",
      "senderName": "John Coordinator",
      "status": "Pending|Accepted|Rejected",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### 4.4 Get Sent Invites
**Endpoint:** `GET /invites?filter=sent`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "inviteId": "invite_id",
      "recipientEmail": "owner@example.com",
      "status": "Pending|Accepted|Rejected",
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### 4.5 Accept Invite
**Endpoint:** `PUT /invites/:id/accept`

**Request Body:**
```json
{
  "userId": "recipient_user_id"
}
```

### 4.6 Reject Invite
**Endpoint:** `PUT /invites/:id/reject`

**Request Body:**
```json
{
  "userId": "recipient_user_id",
  "reason": "Optional rejection reason"
}
```

### 4.7 Delete Invite
**Endpoint:** `DELETE /invites/:id`

---

## 5. Logistics Coordinator (Operations Users) APIs

### 5.1 Create Operations User
**Endpoint:** `POST /operations/users`

**Request Body:**
```json
{
  "email": "ops@example.com",
  "firstName": "Logistics",
  "lastName": "Staff",
  "userType": "Logistics Coordinator|Logistics Staff|Operations Staff",
  "status": "Active|Inactive",
  "parentUserId": "parent_admin_id",
  "parentRole": "logistics"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "operation_user_id": "operation_user_id",
    "email": "ops@example.com",
    "username": "logistics.staff",
    "password": "auto_generated_password",
    "userType": "Logistics Staff",
    "status": "Active"
  }
}
```

### 5.2 Get All Operations Users
**Endpoint:** `GET /operations/users`

### 5.3 Get Operations User by ID
**Endpoint:** `GET /operations/users/:id`

### 5.4 Update Operations User
**Endpoint:** `PUT /operations/users/:id`

### 5.5 Delete Operations User
**Endpoint:** `DELETE /operations/users/:id`

---

## 6. Trips Management APIs

### 6.1 Create Trip
**Endpoint:** `POST /trips`

**Request Body:**
```json
{
  "tripOwnerId": "owner_id",
  "tripType": "One Way Transfer",
  "tripName": "Boston to NYC",
  "startDate": "2025-02-01",
  "requestedDate": "2025-02-01",
  "status": "Requested|Quoted|Approved|In Progress|Completed",
  "information": "Trip details and notes",
  "assignedTo": "logistics_coordinator_id",
  "estimatedCost": 150.00
}
```

### 6.2 Get All Trips
**Endpoint:** `GET /trips`

### 6.3 Get Trip by ID
**Endpoint:** `GET /trips/:id`

### 6.4 Update Trip
**Endpoint:** `PUT /trips/:id`

### 6.5 Delete Trip
**Endpoint:** `DELETE /trips/:id`

---

## 7. Error Response Format

**Error Response (All Endpoints):**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Missing or invalid fields
- `UNAUTHORIZED` - Authentication failed
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `DUPLICATE_EMAIL` - Email already registered
- `RECIPIENT_NOT_FOUND` - Invite recipient not found (when sending to unregistered user)
- `INTERNAL_SERVER_ERROR` - Server error

---

## 8. Authentication Headers

All API endpoints (except `/auth/register` and `/auth/login`) require:

```
Authorization: Bearer jwt_token
Content-Type: application/json
```

---

## 9. Frontend Integration Notes

### Minimal Changes Required:
1. Replace `localStorage.setItem(key, JSON.stringify(data))` with API calls
2. Replace `JSON.parse(localStorage.getItem(key))` with API GET requests
3. Use the same response structure: `{ success: boolean, data: object, error: string }`

### Example Frontend Change:

**Before (localStorage):**
```javascript
const triptypes = JSON.parse(localStorage.getItem("triptypes") || "[]");
setTriptypeData(triptypes);
```

**After (API):**
```javascript
const response = await apiService({
  method: 'get',
  url: '/trip-types'
});
if (response.success) {
  setTriptypeData(response.data);
}
```

---

## 10. Database Schema Summary

See `database.sql` for complete schema including:
- users
- trip_coordinators
- trip_types
- trips
- invites
- operations_users
- drivers
- vehicles
- vendors
- owners

---

## 11. Key Features

### Registration-Based User Management
- Users register with email
- System generates default `username` and `password` automatically
- Users can change password after first login
- Role assignment during registration

### Trip Invite Management
- **Logistics Coordinator → Trip Owner/Vendor/Both**
  - Can send to registered email or manually enter unregistered user details
  - Unregistered users receive email with login credentials

- **Trip Owner/Vendor → Logistics Coordinator Only**
  - Restricted to sending only to Logistics Coordinator role
  - Cannot send to other Trip Owners or Vendors

### Auto-Credential Generation
- Email used as unique identifier
- Username generated from email
- Password auto-generated and sent via email
- Users prompted to change password on first login

---

## 12. API Rate Limiting

Recommended rate limits:
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute per user for authenticated endpoints

---

## 13. Pagination Support

All list endpoints support pagination:
```
GET /trips?page=1&limit=20&sort=createdAt&order=desc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order: asc|desc (default: desc)

---

## 14. Deployment Checklist

- [ ] Database migrations applied
- [ ] JWT secret configured
- [ ] Email service configured for credentials
- [ ] CORS enabled for frontend origin
- [ ] Environment variables set
- [ ] SSL/TLS certificates installed
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured

