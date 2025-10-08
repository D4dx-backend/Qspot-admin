import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from localStorage
      localStorage.removeItem('adminToken');
      // Redirect to login page
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin API functions
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  
  // Add other admin endpoints as needed
  // getDashboard: () => api.get('/admin/dashboard'),
  // getUsers: () => api.get('/admin/users'),
  // etc.
};

export default api;
