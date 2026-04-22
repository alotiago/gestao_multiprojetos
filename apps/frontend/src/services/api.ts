import axios from 'axios';
import { getStoredAuthToken, isLocalDevBypassSession } from '@/services/localDev';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (isLocalDevBypassSession()) {
        return Promise.reject(error);
      }

      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
