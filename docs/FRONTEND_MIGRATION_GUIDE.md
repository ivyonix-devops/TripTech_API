# Frontend Migration Guide: localStorage → API

## Overview

This guide provides step-by-step instructions for migrating from localStorage-based data management to REST API calls.

---

## Migration Strategy

### Phase 1: Setup API Service Layer
### Phase 2: Update Individual Components
### Phase 3: Test & Validate
### Phase 4: Cleanup

---

## Phase 1: Setup API Service Layer

### Step 1: Create API Service File

Create `src/services/api.js`:

```javascript
// src/services/api.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.timeout = 30000; // 30 seconds
  }

  getToken() {
    return localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        timeout: this.timeout,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiService();

// Domain-specific API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout', {}),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const vendorAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/vendors${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vendors/${id}/status`, { status }),
  delete: (id) => api.delete(`/vendors/${id}`),
};

export const driverAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/drivers${query ? '?' + query : ''}`);
  },
  getAvailable: () => api.get('/drivers/available'),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  login: (credentials) => api.post('/drivers/login', credentials),
};

export const vehicleAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/vehicles${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/vehicles/${id}`),
  getByStatus: (status) => api.get(`/vehicles/status/${status}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, { status }),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const ownerAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/owners${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/owners/${id}`),
  create: (data) => api.post('/owners', data),
  update: (id, data) => api.put(`/owners/${id}`, data),
  updateStatus: (id, status) => api.patch(`/owners/${id}/status`, { status }),
  delete: (id) => api.delete(`/owners/${id}`),
};

export const tripAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/trips${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  updateStatus: (id, status) => api.patch(`/trips/${id}/status`, { status }),
  delete: (id) => api.delete(`/trips/${id}`),
  getCosts: (id) => api.get(`/trips/${id}/costs`),
  addCost: (id, data) => api.post(`/trips/${id}/costs`, data),
  getIncharges: (id) => api.get(`/trips/${id}/incharges`),
  addIncharge: (id, data) => api.post(`/trips/${id}/incharges`, data),
  getAttachments: (id) => api.get(`/trips/${id}/attachments`),
  uploadAttachment: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/trips/${id}/attachments`, formData);
  },
};

export const bookingAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/bookings${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getByOwner: (company) => api.get(`/bookings/owner/${company}`),
};

export const operationsAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/operations${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/operations/${id}`),
  create: (data) => api.post('/operations', data),
  update: (id, data) => api.put(`/operations/${id}`, data),
  updateStatus: (id, status) => api.patch(`/operations/${id}/status`, { status }),
  delete: (id) => api.delete(`/operations/${id}`),
};

export const invitationAPI = {
  getToInvites: () => api.get('/invites/to'),
  getVendorInvites: () => api.get('/invites/vendor'),
  createToInvite: (data) => api.post('/invites/to', data),
  createVendorInvite: (data) => api.post('/invites/vendor', data),
  updateStatus: (id, status) => api.put(`/invites/${id}`, { status }),
  delete: (id) => api.delete(`/invites/${id}`),
  getRegisteredLCs: () => api.get('/registered-lcs'),
  getRegisteredVendors: () => api.get('/registered-vendors'),
};

export const serviceAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/services${query ? '?' + query : ''}`);
  },
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  updateStatus: (id, status) => api.patch(`/services/${id}/status`, { status }),
  delete: (id) => api.delete(`/services/${id}`),
};

export const documentAPI = {
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  getByEntity: (entityType, entityId) => api.get(`/documents/${entityType}/${entityId}`),
  upload: (file, documentType, entityType, entityId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    return api.post('/documents', formData);
  },
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => window.location.href = `${api.baseURL}/documents/${id}/download`,
};
```

### Step 2: Create .env File

Create `.env` in frontend root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## Phase 2: Update Individual Components

### Template: Before & After

**Before (localStorage):**
```javascript
import { useState, useEffect } from 'react';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    // Read from localStorage
    const storedVendors = JSON.parse(localStorage.getItem('vendors') || '[]');
    setVendors(storedVendors);
  }, []);

  const handleDelete = (index) => {
    const updatedVendors = vendors.filter((_, i) => i !== index);
    setVendors(updatedVendors);
    // Write to localStorage
    localStorage.setItem('vendors', JSON.stringify(updatedVendors));
  };

  return (
    // JSX
  );
}
```

**After (API):**
```javascript
import { useState, useEffect } from 'react';
import { vendorAPI } from '../services/api';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Read from API
      const { data } = await vendorAPI.getAll();
      setVendors(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Delete via API
      await vendorAPI.delete(id);
      // Refresh list
      await fetchVendors();
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete vendor:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // JSX
  );
}
```

---

## Common Migration Patterns

### Pattern 1: Simple Read (GET)

**localStorage:**
```javascript
const data = JSON.parse(localStorage.getItem('vendors') || '[]');
```

**API:**
```javascript
const { data } = await vendorAPI.getAll();
```

---

### Pattern 2: Create/Update (POST/PUT)

**localStorage:**
```javascript
const existing = JSON.parse(localStorage.getItem('vendors') || '[]');
const updated = [...existing, newVendor];
localStorage.setItem('vendors', JSON.stringify(updated));
```

**API:**
```javascript
const { data } = await vendorAPI.create(newVendor);
// Or update
const { data } = await vendorAPI.update(vendorId, updatedVendor);
```

---

### Pattern 3: Delete

**localStorage:**
```javascript
const existing = JSON.parse(localStorage.getItem('vendors') || '[]');
const updated = existing.filter(v => v.id !== vendorId);
localStorage.setItem('vendors', JSON.stringify(updated));
```

**API:**
```javascript
await vendorAPI.delete(vendorId);
```

---

### Pattern 4: Search/Filter

**localStorage:**
```javascript
const vendors = JSON.parse(localStorage.getItem('vendors') || '[]');
const filtered = vendors.filter(v => v.company.includes(search));
```

**API:**
```javascript
const { data } = await vendorAPI.getAll({ search });
// Or manually in component
const filtered = data.filter(v => v.company.includes(search));
```

---

## Component Migration Examples

### Example 1: Vendors Page

**File:** `src/views/pages/vendors/Vendor.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { CButton, CCard, CCardBody, CCardHeader, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { vendorAPI } from '../../../services/api';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await vendorAPI.getAll();
      setVendors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await vendorAPI.delete(id);
      await loadVendors();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <CCard>
      <CCardHeader>Vendors</CCardHeader>
      <CCardBody>
        <CTable striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Company</CTableHeaderCell>
              <CTableHeaderCell>Contact</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {vendors.map((vendor) => (
              <CTableRow key={vendor.id}>
                <CTableDataCell>{vendor.company}</CTableDataCell>
                <CTableDataCell>{vendor.contact_person}</CTableDataCell>
                <CTableDataCell>{vendor.status}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="danger" onClick={() => handleDelete(vendor.id)}>
                    Delete
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
}
```

---

### Example 2: Add Vendor Form

**File:** `src/views/pages/vendors/AddVendor.jsx`

```javascript
import React, { useState } from 'react';
import { CButton, CForm, CFormInput, CFormLabel } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI } from '../../../services/api';

export default function AddVendor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: '',
    contact_person: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create vendor via API
      await vendorAPI.create(formData);
      navigate('/logistics/vendors');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CForm onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      <CFormLabel>Company Name</CFormLabel>
      <CFormInput
        name="company"
        value={formData.company}
        onChange={handleChange}
        required
      />

      <CFormLabel>Contact Person</CFormLabel>
      <CFormInput
        name="contact_person"
        value={formData.contact_person}
        onChange={handleChange}
        required
      />

      <CFormLabel>Email</CFormLabel>
      <CFormInput
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <CFormLabel>Phone</CFormLabel>
      <CFormInput
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <CButton type="submit" color="primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Vendor'}
      </CButton>
    </CForm>
  );
}
```

---

## Phase 3: Testing

### Test Checklist

- [ ] GET operations return correct data
- [ ] POST operations create records
- [ ] PUT operations update records
- [ ] DELETE operations remove records
- [ ] Error handling displays messages
- [ ] Loading states show spinners
- [ ] Token authentication works
- [ ] Pagination works (if implemented)
- [ ] Search/filter works
- [ ] No localStorage data is used

### Sample Test Code

```javascript
// src/services/__tests__/api.test.js
import { vendorAPI } from '../api';

describe('vendorAPI', () => {
  test('getAll returns vendors', async () => {
    const result = await vendorAPI.getAll();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('create adds new vendor', async () => {
    const newVendor = {
      company: 'Test Co',
      contact_person: 'John',
      email: 'john@test.com',
      phone: '123456789',
    };
    const result = await vendorAPI.create(newVendor);
    expect(result.success).toBe(true);
    expect(result.data.id).toBeDefined();
  });

  test('delete removes vendor', async () => {
    const result = await vendorAPI.delete(1);
    expect(result.success).toBe(true);
  });
});
```

---

## Phase 4: Cleanup

### Remove localStorage References

Search for and remove these patterns:

```javascript
// Remove
localStorage.getItem()
localStorage.setItem()
localStorage.removeItem()
JSON.parse()
JSON.stringify()

// Keep only
localStorage.getItem('token')  // For JWT token
localStorage.getItem('role')   // For user role
```

---

## Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to XMLHttpRequest at 'http://localhost:5000/api/vendors' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:**
```javascript
// .env
REACT_APP_API_URL=http://localhost:5000/api

// Backend .env
CORS_ORIGIN=http://localhost:3000
```

---

### Issue 2: 401 Unauthorized

**Error:** `401 Unauthorized`

**Solution:**
```javascript
// Ensure token is saved after login
const { data } = await authAPI.login({ username, password, role });
localStorage.setItem('token', data.token);

// Check token is sent in headers
// (api.js automatically does this)
```

---

### Issue 3: Network Timeout

**Error:** `Request timeout`

**Solution:**
```javascript
// In api.js, increase timeout
this.timeout = 60000; // 60 seconds

// Or add retry logic
const retry = async (fn, attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

---

## Performance Optimization

### 1. Request Caching

```javascript
class CachedApiService extends ApiService {
  constructor() {
    super();
    this.cache = new Map();
    this.cacheTime = 5 * 60 * 1000; // 5 minutes
  }

  async get(endpoint) {
    const cached = this.cache.get(endpoint);
    if (cached && Date.now() - cached.time < this.cacheTime) {
      return cached.data;
    }

    const data = await super.get(endpoint);
    this.cache.set(endpoint, { data, time: Date.now() });
    return data;
  }

  clearCache(endpoint) {
    if (endpoint) {
      this.cache.delete(endpoint);
    } else {
      this.cache.clear();
    }
  }
}
```

### 2. Request Debouncing

```javascript
const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Usage
const handleSearch = debounce(async (query) => {
  const { data } = await vendorAPI.getAll({ search: query });
  setVendors(data);
}, 500);
```

---

## Deployment Checklist

- [ ] Update all component imports to use api service
- [ ] Remove localStorage usage (except token/role)
- [ ] Test all CRUD operations
- [ ] Setup backend server
- [ ] Configure .env variables
- [ ] Run both frontend and backend
- [ ] Test end-to-end flows
- [ ] Setup error tracking (Sentry)
- [ ] Configure CDN for static assets
- [ ] Deploy frontend and backend
- [ ] Monitor for errors

---

## Additional Resources

- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [React Hooks](https://react.dev/reference/react)
- [Express.js REST APIs](https://expressjs.com/en/starter/basic-routing.html)
- [JWT Authentication](https://jwt.io/introduction)

---

## Migration Completion Checklist

- [ ] API service layer created
- [ ] All components updated
- [ ] All tests passing
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] No localStorage CRUD operations
- [ ] Backend API deployed
- [ ] Frontend updated and tested
- [ ] Documentation updated
- [ ] Team trained on new system

---

**Document Version:** 1.0  
**Last Updated:** January 2024
