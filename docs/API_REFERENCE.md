# TripTech - API Reference & Implementation Guide

## Quick Start

This guide provides detailed API endpoint specifications, request/response examples, and implementation notes.

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Vendor APIs](#vendor-apis)
3. [Driver APIs](#driver-apis)
4. [Vehicle APIs](#vehicle-apis)
5. [Trip Owner APIs](#trip-owner-apis)
6. [Trip APIs](#trip-apis)
7. [Operations APIs](#operations-apis)
8. [Invitation APIs](#invitation-apis)
9. [Booking APIs](#booking-apis)
10. [Document APIs](#document-apis)
11. [Service APIs](#service-apis)
12. [Response Format & Error Handling](#response-format--error-handling)

---

## Authentication APIs

### POST /api/auth/login

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "username": "logistics",
  "password": "logi123",
  "role": "logistics"
}
```

**Response (200 - Success):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "logistics",
      "email": "logistics@triptech.com",
      "full_name": "Logistics Coordinator",
      "role": "logistics",
      "status": "Active"
    }
  },
  "message": "Login successful"
}
```

**Response (401 - Invalid Credentials):**
```json
{
  "success": false,
  "error": "Invalid username or password",
  "statusCode": 401
}
```

---

### POST /api/auth/register

Register new user.

**Request Body:**
```json
{
  "username": "owner1",
  "email": "owner@triptech.com",
  "password": "secure_password123",
  "full_name": "Trip Owner",
  "role": "owner",
  "company_name": "ABC Shipping Ltd",
  "phone": "1234567890"
}
```

**Response (201 - Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "owner1",
    "email": "owner@triptech.com",
    "role": "owner",
    "message": "Registration successful. Please login."
  }
}
```

---

### POST /api/auth/logout

Logout user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "logistics",
    "email": "logistics@triptech.com",
    "full_name": "Logistics Coordinator",
    "role": "logistics",
    "phone": "+1234567890",
    "address": "123 Main St",
    "status": "Active"
  }
}
```

---

### PUT /api/auth/profile

Update user profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "phone": "+0987654321",
  "address": "456 New St"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "Updated Name",
    "phone": "+0987654321",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

## Vendor APIs

### GET /api/vendors

List all vendors with pagination.

**Query Parameters:**
```
?page=1&limit=20&status=Active&search=transport
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company": "Sample Transport Co.",
      "contact_person": "John Doe",
      "email": "vendor@example.com",
      "phone": "123456789",
      "address": "123 Business St",
      "city": "New York",
      "country": "USA",
      "status": "Active",
      "total_vehicles": 5,
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "message": "Vendors retrieved successfully"
}
```

---

### GET /api/vendors/:id

Get vendor details by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company": "Sample Transport Co.",
    "contact_person": "John Doe",
    "email": "vendor@example.com",
    "phone": "123456789",
    "address": "123 Business St",
    "city": "New York",
    "country": "USA",
    "registration_number": "REG123456",
    "tax_id": "TAX789",
    "status": "Active",
    "total_vehicles": 5,
    "vehicles": [
      {
        "id": 1,
        "license_plate": "ABC-1234",
        "brand": "Volvo",
        "model": "FH16",
        "year": 2020,
        "status": "Active"
      }
    ]
  }
}
```

---

### POST /api/vendors

Create new vendor.

**Request Body:**
```json
{
  "company": "New Transport Ltd",
  "contact_person": "Jane Smith",
  "email": "jane@transport.com",
  "phone": "+1987654321",
  "address": "456 Transport Ave",
  "city": "Boston",
  "country": "USA",
  "registration_number": "REG987654",
  "tax_id": "TAX456",
  "vehicles": [
    {
      "vehicle_class": "HGV",
      "brand": "Mercedes",
      "model": "Actros",
      "year": 2021,
      "license_plate": "XYZ-5678",
      "seating_capacity": 2
    }
  ]
}
```

**Response (201 - Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "company": "New Transport Ltd",
    "contact_person": "Jane Smith",
    "email": "jane@transport.com",
    "status": "Inactive",
    "created_at": "2024-01-16T09:00:00Z"
  },
  "message": "Vendor created successfully"
}
```

---

### PUT /api/vendors/:id

Update vendor details.

**Request Body:**
```json
{
  "contact_person": "John Updated",
  "email": "john.updated@example.com",
  "phone": "+1111111111"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company": "Sample Transport Co.",
    "contact_person": "John Updated",
    "email": "john.updated@example.com",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "message": "Vendor updated successfully"
}
```

---

### PATCH /api/vendors/:id/status

Update vendor status (Active/Inactive).

**Request Body:**
```json
{
  "status": "Active"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "Active",
    "updated_at": "2024-01-16T10:30:00Z"
  },
  "message": "Vendor status updated successfully"
}
```

---

### DELETE /api/vendors/:id

Delete vendor (soft delete).

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

---

## Driver APIs

### GET /api/drivers

List all drivers.

**Query Parameters:**
```
?page=1&limit=20&status=Active&available=true
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Driver",
      "email": "john@driver.com",
      "phone": "+1234567890",
      "license_number": "DRV123456",
      "license_expiry": "2025-12-31",
      "license_class": "HGV",
      "status": "Active",
      "is_available": true,
      "assigned_vehicle_id": null,
      "assigned_trip_id": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/drivers/available

Get available drivers (not assigned).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Driver",
      "email": "john@driver.com",
      "phone": "+1234567890",
      "license_number": "DRV123456",
      "license_expiry": "2025-12-31",
      "status": "Active"
    }
  ],
  "total": 1
}
```

---

### POST /api/drivers

Create new driver.

**Request Body:**
```json
{
  "first_name": "James",
  "last_name": "Wilson",
  "email": "james@driver.com",
  "phone": "+1234567890",
  "license_number": "DRV987654",
  "license_expiry": "2026-06-30",
  "license_class": "HGV",
  "date_of_birth": "1985-05-15",
  "address": "123 Driver St",
  "city": "Chicago",
  "country": "USA",
  "emergency_contact": "Sarah Wilson",
  "emergency_phone": "+1111111111"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "James",
    "last_name": "Wilson",
    "status": "Active",
    "created_at": "2024-01-16T11:00:00Z"
  },
  "message": "Driver created successfully"
}
```

---

### PUT /api/drivers/:id

Update driver details.

**Request Body:**
```json
{
  "phone": "+2222222222",
  "license_expiry": "2027-12-31"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "phone": "+2222222222",
    "updated_at": "2024-01-16T11:30:00Z"
  },
  "message": "Driver updated successfully"
}
```

---

### DELETE /api/drivers/:id

Delete driver.

**Response (200):**
```json
{
  "success": true,
  "message": "Driver deleted successfully"
}
```

---

## Vehicle APIs

### GET /api/vehicles

List all vehicles.

**Query Parameters:**
```
?page=1&limit=20&status=Active&vendor_id=1
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "license_plate": "ABC-1234",
      "brand": "Volvo",
      "model": "FH16",
      "year": 2020,
      "vehicle_class": "HGV",
      "vendor_id": 1,
      "vendor_name": "Sample Transport Co.",
      "seating_capacity": 2,
      "status": "Active",
      "assigned_driver_id": null,
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/vehicles/status/:status

Get vehicles by status.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "license_plate": "ABC-1234",
      "status": "Active"
    }
  ],
  "total": 5
}
```

---

### POST /api/vehicles

Create new vehicle.

**Request Body:**
```json
{
  "vendor_id": 1,
  "vehicle_class": "HGV",
  "brand": "Scania",
  "model": "R440",
  "year": 2022,
  "license_plate": "NEW-9999",
  "vin": "SCANIA1234567890",
  "seating_capacity": 2,
  "fuel_type": "Diesel",
  "registration_date": "2022-01-15",
  "registration_expiry": "2025-01-15",
  "insurance_expiry": "2024-12-31"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "license_plate": "NEW-9999",
    "brand": "Scania",
    "status": "Inactive",
    "created_at": "2024-01-16T12:00:00Z"
  },
  "message": "Vehicle created successfully"
}
```

---

### PUT /api/vehicles/:id

Update vehicle.

**Request Body:**
```json
{
  "assigned_driver_id": 1,
  "insurance_expiry": "2025-12-31"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "license_plate": "ABC-1234",
    "assigned_driver_id": 1,
    "updated_at": "2024-01-16T12:30:00Z"
  }
}
```

---

### PATCH /api/vehicles/:id/status

Update vehicle status.

**Request Body:**
```json
{
  "status": "Maintenance"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "Maintenance",
    "updated_at": "2024-01-16T13:00:00Z"
  }
}
```

---

### DELETE /api/vehicles/:id

Delete vehicle.

**Response (200):**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

---

## Trip Owner APIs

### GET /api/owners

List all trip owners.

**Query Parameters:**
```
?page=1&limit=20&status=Active
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company": "ABC Shipping Ltd",
      "contact_person": "Jane Smith",
      "email": "jane@abc.com",
      "phone": "+1987654321",
      "type": "Corporate",
      "address": "789 Owner St",
      "city": "Los Angeles",
      "country": "USA",
      "status": "Active",
      "created_at": "2024-01-10T09:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### POST /api/owners

Create new trip owner.

**Request Body:**
```json
{
  "company": "XYZ Logistics Corp",
  "contact_person": "Mark Johnson",
  "email": "mark@xyz.com",
  "phone": "+1555555555",
  "type": "Corporate",
  "address": "321 Corporate Ave",
  "city": "Denver",
  "country": "USA",
  "postal_code": "80202",
  "registration_number": "REG321",
  "tax_id": "TAX321"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "company": "XYZ Logistics Corp",
    "status": "Inactive",
    "created_at": "2024-01-16T14:00:00Z"
  },
  "message": "Trip owner created successfully"
}
```

---

## Trip APIs

### GET /api/trips

List all trips.

**Query Parameters:**
```
?page=1&limit=20&status=Confirmed&owner_id=1&start_date=2024-01-01&end_date=2024-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "trip_id": "TRIP001",
      "origin_location": "New York",
      "destination_location": "Boston",
      "scheduled_date": "2024-01-20",
      "scheduled_time": "08:00:00",
      "trip_type": "Regular",
      "owner_company": "ABC Shipping Ltd",
      "vendor_company": "Sample Transport Co.",
      "vehicle_license_plate": "ABC-1234",
      "driver_name": "John Driver",
      "status": "Confirmed",
      "passengers_count": 4,
      "distance_km": 215.5,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/trips/:id

Get trip details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "trip_id": "TRIP001",
    "origin_location": "New York",
    "destination_location": "Boston",
    "scheduled_date": "2024-01-20",
    "scheduled_time": "08:00:00",
    "estimated_duration": 4,
    "distance_km": 215.5,
    "status": "Confirmed",
    "trip_owner_id": 1,
    "vendor_id": 1,
    "vehicle_id": 1,
    "driver_id": 1,
    "passengers_count": 4,
    "cargo_details": "Electronics shipment",
    "special_requirements": "Temperature controlled",
    "costs": [
      {
        "id": 1,
        "cost_type": "Fuel",
        "amount": 250.00,
        "status": "Pending"
      }
    ],
    "incharges": [
      {
        "id": 1,
        "coordinator_id": 1,
        "responsibility": "Trip oversight",
        "contact_person": "Manager Name"
      }
    ],
    "attachments": [
      {
        "id": 1,
        "file_name": "invoice.pdf",
        "file_size": 102400
      }
    ],
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### POST /api/trips

Create new trip.

**Request Body:**
```json
{
  "trip_owner_id": 1,
  "trip_type": "Regular",
  "origin_location": "Seattle",
  "destination_location": "Portland",
  "scheduled_date": "2024-01-25",
  "scheduled_time": "09:00:00",
  "estimated_duration": 3,
  "passengers_count": 2,
  "cargo_details": "Office equipment",
  "cargo_weight": 500.00,
  "special_requirements": "Fragile items"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "trip_id": "TRIP005",
    "status": "Draft",
    "created_at": "2024-01-16T15:00:00Z"
  },
  "message": "Trip created successfully"
}
```

---

### PUT /api/trips/:id

Update trip.

**Request Body:**
```json
{
  "vendor_id": 1,
  "vehicle_id": 1,
  "driver_id": 1,
  "scheduled_time": "10:00:00",
  "status": "Confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "trip_id": "TRIP001",
    "vendor_id": 1,
    "status": "Confirmed",
    "updated_at": "2024-01-16T15:30:00Z"
  }
}
```

---

### PATCH /api/trips/:id/status

Update trip status.

**Request Body:**
```json
{
  "status": "In_Progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "In_Progress",
    "updated_at": "2024-01-20T08:30:00Z"
  }
}
```

---

## Trip Costs APIs

### POST /api/trips/:id/costs

Add trip cost.

**Request Body:**
```json
{
  "cost_type": "Fuel",
  "description": "Diesel fuel for journey",
  "amount": 350.00,
  "currency": "USD"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "trip_id": 1,
    "cost_type": "Fuel",
    "amount": 350.00,
    "status": "Pending",
    "created_at": "2024-01-16T16:00:00Z"
  }
}
```

---

### GET /api/trips/:id/costs

Get trip costs.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "trip_id": 1,
      "cost_type": "Fuel",
      "amount": 250.00,
      "status": "Pending"
    },
    {
      "id": 2,
      "trip_id": 1,
      "cost_type": "Toll",
      "amount": 50.00,
      "status": "Paid"
    }
  ],
  "total": 300.00
}
```

---

## Response Format & Error Handling

### Success Response Structure
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### List Response Structure
```json
{
  "success": true,
  "data": [],
  "total": 10,
  "page": 1,
  "limit": 20,
  "message": "Data retrieved"
}
```

### Error Response Structure
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "details": {}
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource missing |
| 409 | Conflict - Duplicate entry |
| 500 | Server Error |

---

## Implementation Notes

1. **Authentication**: All endpoints (except login/register) require JWT token in Authorization header
2. **Pagination**: Default limit is 20, max is 100
3. **Dates**: Use ISO 8601 format (YYYY-MM-DD)
4. **Times**: Use 24-hour format (HH:MM:SS)
5. **Timestamps**: Use ISO 8601 with timezone (2024-01-16T16:00:00Z)
6. **Currency**: Always specify currency code (USD, EUR, etc.)
7. **Soft Deletes**: Deleted records have `deleted_at` timestamp, not physically removed

---

## Frontend Migration Checklist

- [ ] Create API service layer (`src/services/api.js`)
- [ ] Update all localStorage.getItem() calls to use API.get()
- [ ] Update all localStorage.setItem() calls to use API.post/put()
- [ ] Update all components that use localStorage
- [ ] Add error handling for API failures
- [ ] Add loading states for async operations
- [ ] Test all CRUD operations
- [ ] Update environment variables
- [ ] Remove localStorage dependencies

---

## Sample Frontend Code

```javascript
// src/services/api.js
export class ApiService {
  constructor(baseURL = process.env.REACT_APP_API_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API Error');
    }
    
    return data;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
```

Usage in component:
```javascript
// Before (localStorage)
const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');

// After (API)
const { data: vendors } = await api.get('/vendors');
```

---

## End of API Reference

For more information, contact the development team.
