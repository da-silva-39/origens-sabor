/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const env = (import.meta as any).env;
const API_URL = env.VITE_API_URL;
const baseURL = API_URL ? `${API_URL}/api` : '/api';

const api = axios.create({ baseURL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    return Promise.reject(error);
  }
);

export default api;
