import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for Remember Me support
    const token = localStorage.getItem('sf-token') || sessionStorage.getItem('sf-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s and token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If we receive a 401 and we aren't already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      // Clear tokens
      localStorage.removeItem('sf-token');
      sessionStorage.removeItem('sf-token');
      
      // Optionally handle refresh token logic here if we were using a more advanced refresh flow.
      // For now, redirect to login.
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
