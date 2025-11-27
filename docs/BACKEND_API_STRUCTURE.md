# TripTech Backend API Structure

## Overview

This document outlines the backend API structure to replace the current localStorage implementation in the frontend. The API maintains the same data structure to minimize frontend changes.

---

## Current localStorage Implementation

### Storage Keys & Data Types

| Key | Type | Operations | Description |
|-----|------|-----------|-------------|
| `trips` | Array | GET, SET | Trip records with details, costs, incharges, attachments |
| `vendors` | Array | GET, SET | Vendor company information with vehicles |
| `drivers` | Array | GET, SET | Driver information and assignments |
| `vehicles` | Array | GET, SET | Vehicle fleet details |
| `owners` | Array | GET, SET | Trip owner company information |
| `operations` | Array | GET, SET | Logistics operations team members |
| `owneroperations` | Array | GET, SET | Trip owner operations team members |
| `coordinators` | Array | GET, SET | Trip coordinators |
| `driverLogins` | Array | GET, SET | Driver login credentials |
| `documents` | Array | GET, SET | Vendor/Owner/Vehicle documents |
| `tripCosts` | Array | GET, SET | Trip cost details |
| `tripIncharges` | Array | GET, SET | Trip in-charge assignments |
| `tripAttachments` | Array | GET, SET | Trip file attachments |
| `services` | Array | GET, SET | Services management |
| `toInvites` | Array | GET, SET | Trip Owner invitations |
| `vendorInvites` | Array | GET, SET | Vendor invitations |
| `registeredLCs` | Array | GET, SET | Registered Logistics Coordinators |
| `registeredVendors` | Array | GET, SET | Registered Vendors |
| `bookings` | Array | GET, SET | Trip booking records |
| `logisticsUser` | Object | GET, SET | Current logistics coordinator profile |
| `isLoggedIn` | Boolean | GET, SET | Login state |
| `role` | String | GET, SET | User role (logistics, owner, vendor) |
| `userData` | Object | GET, SET | User registration data |

---

## API Endpoints Structure

### Authentication
```
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
POST   /api/auth/logout         - User logout
GET    /api/auth/profile        - Get current user profile
PUT    /api/auth/profile        - Update user profile
```

### Vendors
```
GET    /api/vendors             - List all vendors
GET    /api/vendors/:id         - Get vendor details
POST   /api/vendors             - Create vendor (with vehicles)
PUT    /api/vendors/:id         - Update vendor
DELETE /api/vendors/:id         - Delete vendor
PATCH  /api/vendors/:id/status  - Update vendor status (Active/Inactive)
```

### Drivers
```
GET    /api/drivers             - List all drivers
GET    /api/drivers/:id         - Get driver details
POST   /api/drivers             - Create driver
PUT    /api/drivers/:id         - Update driver
DELETE /api/drivers/:id         - Delete driver
GET    /api/drivers/available   - Get available drivers (not assigned)
POST   /api/drivers/login       - Driver login
```

### Vehicles
```
GET    /api/vehicles            - List all vehicles
GET    /api/vehicles/:id        - Get vehicle details
POST   /api/vehicles            - Create vehicle
PUT    /api/vehicles/:id        - Update vehicle
DELETE /api/vehicles/:id        - Delete vehicle
PATCH  /api/vehicles/:id/status - Update vehicle status
GET    /api/vehicles/status/:status - Get vehicles by status
```

### Trip Owners
```
GET    /api/owners              - List all trip owners
GET    /api/owners/:id          - Get owner details
POST   /api/owners              - Create owner
PUT    /api/owners/:id          - Update owner
DELETE /api/owners/:id          - Delete owner
PATCH  /api/owners/:id/status   - Update owner status
```

### Trips
```
GET    /api/trips               - List all trips
GET    /api/trips/:id           - Get trip details
POST   /api/trips               - Create trip
PUT    /api/trips/:id           - Update trip
DELETE /api/trips/:id           - Delete trip
PATCH  /api/trips/:id/status    - Update trip status
GET    /api/trips/status/:status - Get trips by status
```

### Trip Costs & In-Charges
```
GET    /api/trips/:id/costs     - Get trip costs
POST   /api/trips/:id/costs     - Add trip cost
PUT    /api/trip-costs/:id      - Update trip cost
DELETE /api/trip-costs/:id      - Delete trip cost

GET    /api/trips/:id/incharges - Get trip in-charges
POST   /api/trips/:id/incharges - Add trip in-charge
PUT    /api/trip-incharges/:id  - Update trip in-charge
DELETE /api/trip-incharges/:id  - Delete trip in-charge
```

### Trip Attachments
```
GET    /api/trips/:id/attachments     - List trip attachments
POST   /api/trips/:id/attachments     - Upload attachment
DELETE /api/attachments/:id           - Delete attachment
GET    /api/attachments/:id/download  - Download attachment
```

### Operations Team
```
GET    /api/operations          - List operations team (Logistics)
POST   /api/operations          - Add operations member
PUT    /api/operations/:id      - Update operations member
DELETE /api/operations/:id      - Delete operations member
PATCH  /api/operations/:id/status - Update member status

GET    /api/owner-operations    - List operations team (Owner)
POST   /api/owner-operations    - Add owner operations member
PUT    /api/owner-operations/:id - Update owner operations member
DELETE /api/owner-operations/:id - Delete owner operations member
```

### Invitations
```
GET    /api/invites/to          - List TO invitations
GET    /api/invites/vendor      - List vendor invitations
POST   /api/invites/to          - Create TO invitation
POST   /api/invites/vendor      - Create vendor invitation
PUT    /api/invites/:id         - Update invitation status
DELETE /api/invites/:id         - Delete invitation

GET    /api/registered-lcs      - List registered LCs
GET    /api/registered-vendors  - List registered vendors
```

### Bookings
```
GET    /api/bookings            - List bookings
GET    /api/bookings/:id        - Get booking details
POST   /api/bookings            - Create booking
PUT    /api/bookings/:id        - Update booking
DELETE /api/bookings/:id        - Delete booking
GET    /api/bookings/owner/:company - Get bookings by owner company
```

### Services
```
GET    /api/services            - List services
GET    /api/services/:id        - Get service details
POST   /api/services            - Create service
PUT    /api/services/:id        - Update service
DELETE /api/services/:id        - Delete service
PATCH  /api/services/:id/status - Update service status
```

### Documents
```
GET    /api/documents           - List all documents
GET    /api/documents/:id       - Get document details
POST   /api/documents           - Upload document
DELETE /api/documents/:id       - Delete document
GET    /api/documents/type/:type - Get documents by type
GET    /api/documents/:entityId - Get documents for entity (vendor/owner/vehicle)
```

### Coordinators
```
GET    /api/coordinators        - List trip coordinators
POST   /api/coordinators        - Add coordinator
PUT    /api/coordinators/:id    - Update coordinator
DELETE /api/coordinators/:id    - Delete coordinator
```

---

## Data Response Format

All API responses follow this standard format:

### Success Response (2xx)
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### List Response
```json
{
  "success": true,
  "data": [],
  "total": 10,
  "page": 1,
  "limit": 20,
  "message": "Data retrieved successfully"
}
```

---

## Frontend Integration Changes

### Minimal Changes Required

The frontend implementation requires these minimal changes:

#### 1. Replace localStorage calls with API calls

**Before (localStorage):**
```javascript
const vendors = JSON.parse(localStorage.getItem("vendors") || "[]");
localStorage.setItem("vendors", JSON.stringify(updatedVendors));
```

**After (API):**
```javascript
// GET - Read data
const response = await fetch('/api/vendors');
const { data: vendors } = await response.json();

// POST - Create
const response = await fetch('/api/vendors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(vendorData)
});

// PUT - Update
const response = await fetch(`/api/vendors/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData)
});

// DELETE
const response = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
```

#### 2. Create API Service Layer (Optional but Recommended)

Create a utility file `src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  // Generic methods
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

// Domain-specific methods
export const vendorAPI = {
  getAll: () => apiClient.get('/vendors'),
  getById: (id) => apiClient.get(`/vendors/${id}`),
  create: (data) => apiClient.post('/vendors', data),
  update: (id, data) => apiClient.put(`/vendors/${id}`, data),
  delete: (id) => apiClient.delete(`/vendors/${id}`),
  updateStatus: (id, status) => apiClient.patch(`/vendors/${id}/status`, { status })
};

export const driverAPI = {
  getAll: () => apiClient.get('/drivers'),
  getAvailable: () => apiClient.get('/drivers/available'),
  // ... more methods
};

// ... more API modules
```

#### 3. Usage in Components

**Before:**
```javascript
useEffect(() => {
  const storedVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
  setVendors(storedVendors);
}, []);
```

**After:**
```javascript
useEffect(() => {
  const fetchVendors = async () => {
    const { data } = await vendorAPI.getAll();
    setVendors(data);
  };
  fetchVendors();
}, []);
```

---

## Authentication

### Login Flow
```
1. User submits credentials
2. Backend validates and returns JWT token
3. Store token in localStorage or sessionStorage
4. Include token in Authorization header for subsequent requests

POST /api/auth/login
Request:
{
  "username": "string",
  "password": "string",
  "role": "logistics" | "owner" | "vendor"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "user": { ... }
  }
}
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## Database Schema Overview

See `database.sql` for complete schema. Key tables:

- **users** - User accounts
- **vendors** - Vendor companies
- **drivers** - Driver information
- **vehicles** - Vehicle fleet
- **owners** - Trip owner companies
- **trips** - Trip records
- **trip_costs** - Trip expense details
- **trip_incharges** - Trip responsibility assignments
- **operations_team** - Operations staff
- **invitations** - Invitation records
- **documents** - File storage metadata
- **services** - Service types and details

---

## Migration Path

1. **Phase 1**: Backend APIs development
2. **Phase 2**: API testing with Postman/Insomnia
3. **Phase 3**: Frontend integration with API calls
4. **Phase 4**: Testing and validation
5. **Phase 5**: Deprecate localStorage usage

---

## Error Handling

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

### Error Response Example
```json
{
  "success": false,
  "error": "Vendor not found",
  "statusCode": 404
}
```

---

## Environment Variables

Backend should support these environment variables:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=triptech
JWT_SECRET=your_secret_key
JWT_EXPIRY=24h
API_PORT=5000
NODE_ENV=development
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Notes

- All timestamps use ISO 8601 format (UTC)
- IDs are recommended to be UUID or database-generated integers
- Passwords are hashed (bcrypt recommended)
- Use soft deletes for audit trails (optional)
- Implement request logging for debugging
