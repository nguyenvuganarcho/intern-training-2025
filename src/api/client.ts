import axios from 'axios';
import { getToken, removeToken } from '../utils/auth';

// Tạo axios instance
const client = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Tự động gắn token vào mỗi request
client.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    
    // Handle other errors
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    
    return Promise.reject(error);
  }
);

export default client;