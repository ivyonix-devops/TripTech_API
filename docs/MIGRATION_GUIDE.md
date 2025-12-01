# localStorage to API Migration Guide

## Overview

This document provides detailed guidance for migrating the TripTech frontend from localStorage-based data management to API-based backend services. The migration maintains the same response structure for minimal frontend changes.

---

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Storage Key to API Endpoint Mapping](#storage-key-to-api-endpoint-mapping)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Frontend Code Changes](#frontend-code-changes)
5. [Testing & Validation](#testing--validation)
6. [Rollback Procedure](#rollback-procedure)

---

## Migration Strategy

### Phase 1: Preparation
- [ ] Set up backend infrastructure
- [ ] Configure database
- [ ] Deploy API server
- [ ] Test all endpoints

### Phase 2: Gradual Migration
- [ ] Migrate authentication (login/register)
- [ ] Migrate trip types management
- [ ] Migrate coordinator management
- [ ] Migrate trip invite system
- [ ] Migrate trips management

### Phase 3: Testing
- [ ] UAT in staging environment
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing

### Phase 4: Deployment
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Maintain fallback mechanism

---

## Storage Key to API Endpoint Mapping

### Current localStorage Keys → New API Endpoints

| localStorage Key | Data Type | New Endpoint | Method | Purpose |
|---|---|---|---|---|
| `trips` | Array | `/trips` | GET/POST/PUT/DELETE | Trip management |
| `drivers` | Array | `/drivers` | GET/POST/PUT/DELETE | Driver management |
| `vehicles` | Array | `/vehicles` | GET/POST/PUT/DELETE | Vehicle management |
| `tripCosts` | Array | `/trip-costs` | GET/POST/PUT/DELETE | Cost tracking |
| `tripIncharges` | Array | `/trip-incharges` | GET/POST/PUT/DELETE | Incharge management |
| `vendors` | Array | `/vendors` | GET/POST/PUT/DELETE | Vendor management |
| `owners` | Array | `/owners` | GET/POST/PUT/DELETE | Owner management |
| `operations` | Array | `/operations/users` | GET/POST/PUT/DELETE | Operations staff |
| `owneroperations` | Array | `/operations/users` | GET/POST/PUT/DELETE | Operations staff |
| `triptypes` | Array | `/trip-types` | GET/POST/PUT/DELETE | Trip types |
| `coordinators` | Array | `/coordinators` | GET/POST/PUT/DELETE | Coordinators |
| `currentUser` | Object | `/auth/profile` | GET | User profile |
| `user` | Object | `/auth/profile` | GET | User profile |
| `role` | String | `/auth/profile` | GET | User role |

---

## Step-by-Step Migration

### Step 1: Authentication Migration

#### Current Code (localStorage):
```javascript
// src/services/apiService.js (Login)
const handleLogin = (email, password) => {
  // Mock login
  localStorage.setItem("user", JSON.stringify({
    userId: "user1",
    email: email,
    role: "logistics"
  }));
  localStorage.setItem("currentUser", JSON.stringify({
    userId: "user1",
    email: email,
    role: "logistics"
  }));
  localStorage.setItem("role", "logistics");
};
```

#### New Code (API):
```javascript
// src/services/authService.js
import apiService from './apiService';

export const loginUser = async (email, password) => {
  try {
    const response = await apiService({
      method: 'post',
      url: '/auth/login',
      data: { email, password }
    });
    
    if (response.success) {
      // Store user info and token
      localStorage.setItem("user", JSON.stringify(response.data));
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      
      return response;
    } else {
      throw new Error(response.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (email, firstName, lastName, role) => {
  try {
    const response = await apiService({
      method: 'post',
      url: '/auth/register',
      data: { email, firstName, lastName, role }
    });
    
    if (response.success) {
      // Auto-generated credentials provided in response
      return response;
    } else {
      throw new Error(response.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};
```

### Step 2: Trip Types Migration

#### Current Code (localStorage):
```javascript
// src/views/pages/services/Logistics/TripTypes.jsx
const fetchTripTypes = () => {
  try {
    setLoading(true);
    const storedTripTypes = JSON.parse(
      localStorage.getItem("triptypes") || "[]"
    );
    setTriptypeData(storedTripTypes);
  } catch (error) {
    console.error("Error fetching trip types:", error);
    setError("Failed to load trip types.");
  } finally {
    setLoading(false);
  }
};

const handleDeleteTripType = (tripTypeId) => {
  const updatedTripTypes = triptypeData.filter(
    triptype => triptype.id !== tripTypeId
  );
  setTriptypeData(updatedTripTypes);
  localStorage.setItem("triptypes", JSON.stringify(updatedTripTypes));
};
```

#### New Code (API):
```javascript
// src/views/pages/services/Logistics/TripTypes.jsx
import apiService from '../../../../services/apiService';

const fetchTripTypes = async () => {
  try {
    setLoading(true);
    const response = await apiService({
      method: 'get',
      url: '/trip-types'
    });
    
    if (response.success) {
      setTriptypeData(Array.isArray(response.data) ? response.data : []);
    } else {
      setError(response.error || "Failed to load trip types.");
    }
  } catch (error) {
    console.error("Error fetching trip types:", error);
    setError("Failed to load trip types.");
  } finally {
    setLoading(false);
  }
};

const handleDeleteTripType = async (tripTypeId) => {
  try {
    setActionLoading(tripTypeId);
    const response = await apiService({
      method: 'delete',
      url: `/trip-types/${tripTypeId}`
    });
    
    if (response.success) {
      // Update local state
      const updatedTripTypes = triptypeData.filter(
        triptype => triptype.id !== tripTypeId
      );
      setTriptypeData(updatedTripTypes);
      setSuccess("Trip type deleted successfully!");
    } else {
      setError(response.error || "Failed to delete trip type.");
    }
  } catch (error) {
    console.error("Error deleting trip type:", error);
    setError("Failed to delete trip type.");
  } finally {
    setActionLoading(null);
  }
};
```

### Step 3: Trip Coordinator Migration

#### Current Code (localStorage):
```javascript
// src/views/pages/tripcoordinators/TripCoordinators.jsx
useEffect(() => {
  const storedCoordinators = JSON.parse(
    localStorage.getItem("coordinators") || "[]"
  );
  setCoordinatorData(storedCoordinators);
}, []);

const handleDeleteCoordinator = (index) => {
  const updatedCoordinators = coordinatorData.filter((_, i) => i !== index);
  setCoordinatorData(updatedCoordinators);
  localStorage.setItem("coordinators", JSON.stringify(updatedCoordinators));
};
```

#### New Code (API):
```javascript
// src/views/pages/tripcoordinators/TripCoordinators.jsx
import apiService from '../../../../services/apiService';

useEffect(() => {
  fetchCoordinators();
}, []);

const fetchCoordinators = async () => {
  try {
    const response = await apiService({
      method: 'get',
      url: '/coordinators'
    });
    
    if (response.success) {
      setCoordinatorData(Array.isArray(response.data) ? response.data : []);
    }
  } catch (error) {
    console.error("Error fetching coordinators:", error);
    setError("Failed to load coordinators.");
  }
};

const handleDeleteCoordinator = async (coordinatorId) => {
  try {
    if (!window.confirm("Are you sure?")) return;
    
    const response = await apiService({
      method: 'delete',
      url: `/coordinators/${coordinatorId}`
    });
    
    if (response.success) {
      await fetchCoordinators(); // Refresh list
      setSuccess("Coordinator deleted successfully!");
    }
  } catch (error) {
    console.error("Error deleting coordinator:", error);
    setError("Failed to delete coordinator.");
  }
};
```

### Step 4: Trip Invite Migration

#### Current Code (localStorage):
```javascript
// src/views/pages/invite/Logistics/AddInvite.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Mock API call
  localStorage.setItem("invites", JSON.stringify([
    { email: formData.email, sendTo: formData.sendTo, status: "Sent" }
  ]));
  
  setSuccess("Invite sent successfully!");
};
```

#### New Code (API):
```javascript
// src/views/pages/invite/Logistics/AddInvite.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    
    const inviteData = {
      senderUserId: currentUser.userId,
      recipientEmail: formData.email,
      sendTo: formData.sendTo,
      lcName: manualDetails.lcName || undefined,
      lcCompany: manualDetails.lcCompany || undefined
    };
    
    const response = await apiService({
      method: 'post',
      url: '/invites/send',
      data: inviteData
    });
    
    if (response.success) {
      setSuccess("Invite sent successfully!");
      setFormData({ email: "", sendTo: "" });
      setTimeout(() => navigate("/logistics/invites"), 1500);
    } else {
      // Check for specific error codes
      if (response.code === 'RECIPIENT_NOT_FOUND') {
        setShowModal(true); // Show manual entry modal
      } else {
        setError(response.error || "Failed to send invite");
      }
    }
  } catch (error) {
    console.error('Error sending invite:', error);
    setError("Error sending invite. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

### Step 5: Trips Management Migration

#### Current Code (localStorage):
```javascript
// src/views/pages/trips/Trip_Owner/Trips.jsx
useEffect(() => {
  setTrips(JSON.parse(localStorage.getItem("trips")) || []);
}, []);

const handleEditSave = () => {
  const updatedTrips = [...trips];
  updatedTrips[selectedTripIndex] = editTrip;
  setTrips(updatedTrips);
  localStorage.setItem("trips", JSON.stringify(updatedTrips));
};
```

#### New Code (API):
```javascript
// src/views/pages/trips/Trip_Owner/Trips.jsx
useEffect(() => {
  fetchTrips();
}, []);

const fetchTrips = async () => {
  try {
    setLoading(true);
    const response = await apiService({
      method: 'get',
      url: '/trips'
    });
    
    if (response.success) {
      setTrips(Array.isArray(response.data) ? response.data : []);
    }
  } catch (error) {
    console.error("Error fetching trips:", error);
    setError("Failed to load trips.");
  } finally {
    setLoading(false);
  }
};

const handleEditSave = async () => {
  try {
    const response = await apiService({
      method: 'put',
      url: `/trips/${editTrip.trip_id}`,
      data: editTrip
    });
    
    if (response.success) {
      // Update local state
      const updatedTrips = trips.map(t => 
        t.trip_id === editTrip.trip_id ? response.data : t
      );
      setTrips(updatedTrips);
      setSuccess("Trip updated successfully!");
      setEditModalVisible(false);
    }
  } catch (error) {
    console.error("Error updating trip:", error);
    setError("Failed to update trip.");
  }
};
```

---

## Frontend Code Changes

### 1. API Service Update

```javascript
// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const apiService = async ({
  method = 'get',
  url,
  data = null,
  headers = {}
}) => {
  try {
    const token = localStorage.getItem('token');
    
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: error.message || 'An error occurred'
    };
  }
};

export default apiService;
```

### 2. Environment Variables

```env
# .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### 3. useEffect Pattern for Data Fetching

```javascript
// Common pattern for data fetching
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await apiService({
        method: 'get',
        url: '/your-endpoint'
      });
      
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []); // Dependencies array
```

---

## Testing & Validation

### Unit Testing Template

```javascript
// tests/tripTypes.test.js
import apiService from '../services/apiService';

describe('Trip Types API', () => {
  test('should fetch all trip types', async () => {
    const response = await apiService({
      method: 'get',
      url: '/trip-types'
    });
    
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
  });
  
  test('should create trip type', async () => {
    const data = {
      tripType: 'Test Type',
      tripName: 'Test Name',
      triptypeStatus: 'Active',
      triptypeRemarks: 'Test remarks'
    };
    
    const response = await apiService({
      method: 'post',
      url: '/trip-types',
      data
    });
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });
});
```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login generates JWT token
- [ ] Trip types CRUD operations
- [ ] Coordinator management
- [ ] Trip invite system
- [ ] Error handling
- [ ] Token expiration handling
- [ ] Network error handling

---

## Rollback Procedure

### If Issues Occur:

1. **Immediate Rollback**
   ```javascript
   // Revert to localStorage temporarily
   const getDataWithFallback = async (storageKey, apiUrl) => {
     try {
       const response = await apiService({
         method: 'get',
         url: apiUrl
       });
       return response.success ? response.data : 
              JSON.parse(localStorage.getItem(storageKey) || '[]');
     } catch (error) {
       console.log('API failed, using localStorage fallback');
       return JSON.parse(localStorage.getItem(storageKey) || '[]');
     }
   };
   ```

2. **Gradual Rollback**
   - Revert to previous API version
   - Fix issues in staging
   - Redeploy to production

3. **Data Recovery**
   - Restore from database backup
   - Sync localStorage with API data

---

## Migration Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Preparation | 1-2 weeks | Backend ready for testing |
| Auth Migration | 2-3 days | Login/Register working |
| Core Data Migration | 1 week | Trip Types, Coordinators migrated |
| Invite System | 3-5 days | Full invite system live |
| Trips Management | 1 week | Trip CRUD operations live |
| Testing & Fixes | 1 week | UAT complete |
| Production Deploy | 1 day | Go live |
| Monitoring | Ongoing | Issues resolved |

---

## Common Issues & Solutions

### Issue 1: CORS Errors
```javascript
// Error: No 'Access-Control-Allow-Origin' header
// Solution: Add CORS middleware to backend
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### Issue 2: Token Expiration
```javascript
// Solution: Implement token refresh
const refreshToken = async () => {
  const response = await apiService({
    method: 'post',
    url: '/auth/refresh',
    data: { refreshToken: localStorage.getItem('refreshToken') }
  });
  
  if (response.success) {
    localStorage.setItem('token', response.data.token);
  }
};
```

### Issue 3: Network Timeout
```javascript
// Solution: Implement retry logic
const fetchWithRetry = async (config, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiService(config);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

---

## Performance Considerations

1. **Reduce API Calls**
   - Cache data appropriately
   - Batch requests where possible

2. **Implement Pagination**
   ```javascript
   const fetchTrips = async (page = 1, limit = 20) => {
     const response = await apiService({
       method: 'get',
       url: `/trips?page=${page}&limit=${limit}`
     });
   };
   ```

3. **Use Conditional Requests**
   ```javascript
   const response = await apiService({
     method: 'get',
     url: '/trips',
     headers: {
       'If-Modified-Since': lastModified
     }
   });
   ```

---

## Conclusion

This migration provides:
- ✅ Centralized data management
- ✅ Real-time data synchronization
- ✅ Better security with JWT tokens
- ✅ Audit trail for compliance
- ✅ Scalable architecture

All with minimal frontend changes due to consistent API response structure.

