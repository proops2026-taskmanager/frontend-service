import axios from 'axios';
import { getToken, getCurrentUser, clearAuth } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
});

// Attach JWT and user role from localStorage to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const user = getCurrentUser();
  if (user) {
    config.headers['x-user-role'] = user.role;
  }
  return config;
});

// On 401: only redirect if a token existed (session expired), not on login failures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
