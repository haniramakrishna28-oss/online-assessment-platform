import axios from 'axios';

// Clean and normalize base URL (strip trailing slashes, ensure /api suffix)
let rawBaseURL = (import.meta.env.VITE_API_BASE_URL || '').trim();

// If not provided or mistakenly configured as a github repository link, fallback to live Render backend
if (!rawBaseURL || rawBaseURL.includes('github.com')) {
  rawBaseURL = import.meta.env.PROD 
    ? 'https://exam-sphere-backend.onrender.com/api' 
    : 'http://localhost:8000/api';
}

rawBaseURL = rawBaseURL.replace(/\/+$/, '');
if (!rawBaseURL.endsWith('/api')) {
  rawBaseURL += '/api';
}

// Create configured Axios instance for the examination platform
const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Request interceptor to attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Authentication expired or unauthorized access.');
    }
    return Promise.reject(error);
  }
);

export default api;
