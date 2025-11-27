# Frontend to Backend API Migration Guide

**Purpose**: Guide for updating frontend code to use new backend APIs while maintaining localStorage compatibility  
**Compatibility**: Minimal frontend changes required  
**Approach**: Gradual migration with parallel localStorage support

---

## Overview

The current frontend uses localStorage for:
1. ✅ User registration data
2. ✅ Login credentials storage
3. ✅ Invite management
4. ✅ Operations team data

New backend APIs will replace these with proper server-side storage while frontend can continue using localStorage as temporary cache.

---

## Migration Strategy

### Phase 1: Authentication (Priority 1)

#### Current Flow (localStorage)
```javascript
// src/views/pages/register/Register.js
const handleSubmit = (e) => {
  localStorage.setItem('userData', JSON.stringify(formData));
  localStorage.setItem('isLoggedIn', 'true');
  navigate('/login');
};
```

#### New Flow (Backend API)
```javascript
// src/views/pages/register/Register.js
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        full_name: formData.fullName,
        company_name: formData.companyName,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store response in localStorage temporarily
      localStorage.setItem('registrationResponse', JSON.stringify(data.data));
      alert(`Account created! Check email for verification.`);
      navigate('/login');
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};
```

#### Changes Required
- ✏️ Remove direct localStorage writes for user registration
- ✏️ Add API call to `/api/auth/register`
- ✏️ Add email verification step before login
- ✏️ Add password change enforcement on first login

---

### Phase 2: Login & Authentication (Priority 1)

#### Current Flow (localStorage)
```javascript
// src/views/pages/login/Login.js
const handleLogin = (e) => {
  const credentials = {
    logistics: [
      { username: 'logistics', password: 'logi123' },
      { username: 'logistics2', password: 'logi234' }
    ],
    owner: [
      { username: 'owner1', password: 'owner123' }
    ]
  };
  
  // Validate against dummy credentials
  if (credentials[role]?.some(...)) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('role', role);
  }
};
```

#### New Flow (Backend API)
```javascript
// src/views/pages/login/Login.js
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        password: password,
        role: role
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store token and user data
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', data.data.user.role);
      
      // Check if password change required
      if (!data.data.user.password_changed) {
        navigate('/auth/change-password');
      } else {
        navigate(`/${role}/dashboard`);
      }
    } else {
      alert('Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

#### Changes Required
- ✏️ Replace dummy credential validation with API call
- ✏️ Store JWT token from response
- ✏️ Check `password_changed` flag
- ✏️ Add password change flow after first login
- ✏️ Update private route component to verify token

---

### Phase 3: Invite Management (Priority 2)

#### Current Flow (localStorage - Logistics Coordinator)
```javascript
// src/views/pages/invite/Logistics/AddInvite.jsx
const handleSaveInvite = (e) => {
  const registeredLCs = JSON.parse(localStorage.getItem('registeredLCs') || '[]');
  const registeredVendors = JSON.parse(localStorage.getItem('registeredVendors') || '[]');
  
  // Create invites manually
  if (existingUser) {
    // Auto-populate
  } else {
    // Show modal for manual entry
  }
  
  localStorage.setItem('toInvites', JSON.stringify([...existing, newInvite]));
};
```

#### New Flow (Backend API)
```javascript
// src/views/pages/invite/Logistics/AddInvite.jsx
const handleSaveInvite = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/invites/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient_email: formData.email,
        send_to: formData.sendTo,
        manual_entry: manualDetails.lcName ? true : false,
        lc_name: manualDetails.lcName,
        lc_company: manualDetails.company
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store in localStorage for display
      const invites = JSON.parse(localStorage.getItem('sentInvites') || '[]');
      localStorage.setItem('sentInvites', JSON.stringify([...invites, data.data]));
      
      navigate('/logistics/invites');
    } else if (response.status === 404) {
      // Show manual entry modal
      setShowModal(true);
    }
  } catch (error) {
    console.error('Invite send error:', error);
  }
};
```

#### Changes Required
- ✏️ Add Authorization header with JWT token
- ✏️ Replace localStorage creation with API call
- ✏️ Handle manual entry modal trigger from API response
- ✏️ Store response in localStorage for caching
- ✏️ Add error handling for unregistered users

---

#### Current Flow (localStorage - Trip Owner)
```javascript
// src/views/pages/invite/TripOwner/AddInvite.jsx
const handleSaveInvite = (e) => {
  const registeredLCs = JSON.parse(localStorage.getItem('registeredLCs') || '[]');
  const existingUser = registeredLCs.find(u => u.email === value);
  
  if (existingUser) {
    // Auto-populate
  } else {
    setShowErrorModal(true);
  }
};
```

#### New Flow (Backend API)
```javascript
// src/views/pages/invite/TripOwner/AddInvite.jsx
const handleSaveInvite = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/invites/send-to-lc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipient_email: formData.email
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      // Store in localStorage
      const invites = JSON.parse(localStorage.getItem('sentInvites') || '[]');
      localStorage.setItem('sentInvites', JSON.stringify([...invites, data.data]));
      
      navigate('/owner/invites');
    } else if (response.status === 404) {
      setErrors({ email: 'Logistics Coordinator not registered' });
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Changes Required
- ✏️ Add Authorization header
- ✏️ Call `/api/invites/send-to-lc` instead of manual validation
- ✏️ Remove localStorage-based LC lookup
- ✏️ Let backend handle role validation

---

#### Current Flow (localStorage - View Invites)
```javascript
// src/views/pages/invite/Logistics/Invite.jsx
useEffect(() => {
  const toInvites = JSON.parse(localStorage.getItem('toInvites') || '[]');
  const vendorInvites = JSON.parse(localStorage.getItem('vendorInvites') || '[]');
  setInvites([...toInvites, ...vendorInvites]);
}, []);
```

#### New Flow (Backend API)
```javascript
// src/views/pages/invite/Logistics/Invite.jsx
useEffect(() => {
  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvites(data.data);
        // Cache in localStorage
        localStorage.setItem('cachedInvites', JSON.stringify(data.data));
      }
    } catch (error) {
      // Fall back to localStorage if offline
      const cached = JSON.parse(localStorage.getItem('cachedInvites') || '[]');
      setInvites(cached);
    }
  };
  
  fetchInvites();
}, []);
```

#### Changes Required
- ✏️ Add Authorization header
- ✏️ Replace localStorage read with API call
- ✏️ Keep localStorage as cache for offline support
- ✏️ Add error handling with fallback

---

### Phase 4: Operations Team (Priority 3)

#### Current Flow (localStorage)
```javascript
// src/views/pages/operations/Logistics/AddUser.jsx
const handleSaveUser = (e) => {
  const existingUsers = JSON.parse(localStorage.getItem('operations') || '[]');
  const newUser = { id: Date.now(), ...formData };
  const updatedUsers = [...existingUsers, newUser];
  localStorage.setItem('operations', JSON.stringify(updatedUsers));
};
```

#### New Flow (Backend API)
```javascript
// src/views/pages/operations/Logistics/AddUser.jsx
const handleSaveUser = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('/api/operations/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update localStorage cache
      const existingUsers = JSON.parse(localStorage.getItem('operations') || '[]');
      localStorage.setItem('operations', JSON.stringify([...existingUsers, data.data]));
      
      navigate('/logistics/operations');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

#### Changes Required
- ✏️ Add API call for operations team management
- ✏️ Include Authorization header
- ✏️ Maintain localStorage cache

---

## Authorization Header Utility

Create a utility function for API calls:

```javascript
// src/utils/api.js
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  
  return response;
};

// Usage:
const response = await apiCall('/invites/send', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

---

## Updated Private Route Component

```javascript
// src/layout/PrivateRoute.js
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

---

## Frontend Component Updates Checklist

### Authentication Components
- [ ] Register.js - Update to use `/api/auth/register`
- [ ] Login.js - Update to use `/api/auth/login`
- [ ] Profile.js - Update to use `/api/auth/profile` and `/api/auth/change-password`
- [ ] PrivateRoute.js - Update to verify JWT token

### Invite Components (Logistics)
- [ ] AddInvite.jsx - Update to use `/api/invites/send`
- [ ] Invite.jsx - Update to use `/api/invites` GET
- [ ] Accept/Reject modals - Update to use API endpoints

### Invite Components (Trip Owner)
- [ ] AddInvite.jsx - Update to use `/api/invites/send-to-lc`
- [ ] Invite.jsx - Update to use `/api/invites` GET

### Invite Components (Vendor)
- [ ] AddInvite.jsx - Update to use `/api/invites/send-to-lc`
- [ ] Invite.jsx - Update to use `/api/invites` GET

### Operations Components
- [ ] AddUser.jsx - Update to use new operations API
- [ ] Operations.jsx - Update to fetch from API
- [ ] Driver/Vehicle management - Update to use API

---

## localStorage Keys Reference

### Temporary Cache Keys (Still Used)
```javascript
// Auth
localStorage.getItem('authToken')          // JWT token
localStorage.getItem('currentUser')        // Current user object
localStorage.getItem('isLoggedIn')         // 'true'/'false'
localStorage.getItem('role')               // 'logistics'/'owner'/'vendor'

// Invites (cache)
localStorage.getItem('cachedInvites')      // Array of invites
localStorage.getItem('sentInvites')        // Sent invites for display

// Operations (cache)
localStorage.getItem('operations')         // Operations team data

// OLD - TO BE REMOVED
localStorage.getItem('userData')           // Remove
localStorage.getItem('registeredLCs')      // Remove
localStorage.getItem('registeredVendors')  // Remove
localStorage.getItem('toInvites')          // Remove
localStorage.getItem('vendorInvites')      // Remove
```

---

## Testing & Validation

### 1. Registration Flow
```javascript
// Test: Register -> Verify Email -> Login -> Change Password
const testRegistration = async () => {
  // 1. Call /api/auth/register
  // 2. Check token received at /api/auth/verify-email
  // 3. Call /api/auth/login
  // 4. Verify password_changed = false
  // 5. Call /api/auth/change-password
  // 6. Verify access to dashboard
};
```

### 2. Invite Flow (LC)
```javascript
// Test: Send to TO, Vendor, Both, and Manual Entry
const testLCInvites = async () => {
  // 1. Call /api/invites/send with send_to = 'TO'
  // 2. Call /api/invites/send with send_to = 'VENDOR'
  // 3. Call /api/invites/send with send_to = 'BOTH'
  // 4. Call /api/invites/send with manual_entry = true
  // 5. Verify all invites in GET /api/invites
};
```

### 3. Invite Flow (TO/Vendor)
```javascript
// Test: Send to LC only
const testTOVendorInvites = async () => {
  // 1. Call /api/invites/send-to-lc (should work)
  // 2. Call /api/invites/send (should fail with 403)
  // 3. Verify role-based restrictions
};
```

---

## Rollback Plan

If backend API issues occur:

1. Keep localStorage keys active for temporary data
2. Add fallback to localStorage in catch blocks
3. Implement feature flags to toggle between localStorage and API
4. Gradually migrate features one by one

---

## Performance Optimization

### Caching Strategy
```javascript
// Cache API responses in localStorage
const cachedInvites = localStorage.getItem('cachedInvites');
const cacheTime = localStorage.getItem('invitesTimestamp');

if (cachedInvites && Date.now() - cacheTime < 5*60*1000) {
  // Use cache if less than 5 minutes old
  setInvites(JSON.parse(cachedInvites));
} else {
  // Fetch fresh data from API
  fetchInvites();
}
```

### Request Batching
```javascript
// Fetch multiple resources with one API call
const response = await apiCall('/data/batch', {
  method: 'POST',
  body: JSON.stringify({
    requests: [
      { endpoint: '/invites' },
      { endpoint: '/operations' },
      { endpoint: '/profile' }
    ]
  })
});
```

---

## Migration Timeline

| Phase | Component | Days | Status |
|-------|-----------|------|--------|
| 1 | Registration/Login | 3 | Highest Priority |
| 2 | Invite Management | 4 | High Priority |
| 3 | Operations Team | 2 | Medium Priority |
| 4 | Testing & Polish | 2 | |
| **Total** | | **11 days** | |

---

## Success Metrics

✅ All API calls include Authorization header  
✅ localStorage used only for caching and temp data  
✅ All 13 API endpoints integrated with frontend  
✅ JWT token refresh handled properly  
✅ Role-based access enforced  
✅ Error handling with user-friendly messages  
✅ Offline fallback using cached data  
✅ All forms validate on client-side  
✅ All forms submit to backend API  
✅ No remaining dummy data in code  

---

## Support & Questions

For questions about:
- **API Endpoints**: See BACKEND_API_ENDPOINTS.md
- **Business Logic**: See REGISTRATION_INVITE_IMPLEMENTATION.md
- **Database Schema**: See database.sql
- **Setup Instructions**: See BACKEND_SETUP.md

---

**Last Updated**: November 17, 2025  
**Version**: 1.0
