# Frontend Development Guide - AI for CV and Interview

This guide is designed to prevent recurring bugs and ensure a consistent implementation pattern across the frontend codebase. Every frontend developer MUST adhere to these standards.

## 1. API Data Handling: The 'Double Wrapping' Trap

The backend wraps all responses in a standard `ApiResponse` object. When using Axios, this creates a double layer of wrapping.

**The Structure:**
- `response`: The Axios response object.
- `response.data`: The actual body returned by the server (the `ApiResponse` object).
- `response.data.result`: The actual data/payload you are looking for.

### ❌ WRONG
```javascript
const response = await apiClient.get('/api/payment/services');
setServices(response.data); // BUG: This sets the state to { success: true, message: '...', result: [...] }
```

### ✅ RIGHT
```javascript
const response = await apiClient.get('/api/payment/services');
if (response.data.success) {
  setServices(response.data.result); // CORRECT: Access the .result property
}
```

---

## 2. UUID & ID Matching

IDs coming from URL parameters (`useParams`) are always **Strings**. IDs coming from the database might be **Numbers** or **UUIDs**. Comparing them directly with `===` often fails.

### ❌ WRONG
```javascript
const { id } = useParams();
const currentItem = items.find(item => item.id === id); // BUG: 123 === "123" is false
```

### ✅ RIGHT
```javascript
const { id } = useParams();
const currentItem = items.find(item => String(item.id) === String(id)); // CORRECT: Normalize both to strings
```

---

## 3. React Lifecycle & Infinite Loops

Incorrect `useEffect` dependency arrays are the primary cause of infinite API calls and performance degradation.

### ❌ WRONG
```javascript
useEffect(() => {
  fetchData();
}, [data]); // BUG: fetchData updates 'data', which triggers useEffect again -> Infinite Loop
```

### ✅ RIGHT
```javascript
useEffect(() => {
  fetchData();
}, []); // CORRECT: Only run on mount, or use a specific trigger variable
```

---

## 4. Security & Authentication

**Never** use raw `axios` for API calls. Always use the configured `apiClient`. The `apiClient` automatically handles:
- Base URL configuration.
- Attaching JWT tokens from localStorage to the `Authorization` header.
- Global error interception.

### ❌ WRONG
```javascript
import axios from 'axios';
const res = await axios.get('/api/user/profile'); // BUG: No auth token attached
```

### ✅ RIGHT
```javascript
import apiClient from '../services/apiClient';
const res = await apiClient.get('/user/profile'); // CORRECT: Token attached automatically
```

---

## 5. URL Parameter Handling

Parameters extracted from the URL can be `null` or `undefined` during the first render or if the URL is malformed. Always use guard clauses.

### ❌ WRONG
```javascript
const { serviceId } = useParams();
useEffect(() => {
  apiClient.get(`/api/payment/services/${serviceId}`); // BUG: May call /api/payment/services/undefined
}, [serviceId]);
```

### ✅ RIGHT
```javascript
const { serviceId } = useParams();
useEffect(() => {
  if (!serviceId) return; // CORRECT: Guard clause
  apiClient.get(`/api/payment/services/${serviceId}`);
}, [serviceId]);
```

---

## 6. User Experience & Error Handling

Avoid "silent failures" or app crashes. Every async operation must have a loading state and an error state.

### ✅ BEST PRACTICE PATTERN
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    await apiClient.post('/api/action', data);
    toast.success('Success!');
  } catch (err) {
    setError(err.response?.data?.message || 'An unexpected error occurred');
    toast.error(setError);
  } finally {
    setLoading(false);
  }
};

// In JSX:
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```
