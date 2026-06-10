/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Forçar o tipo para evitar erro do TypeScript
const env = (import.meta as any).env;
const API_URL = env.VITE_API_URL;
const baseURL = API_URL ? `${API_URL}/api` : '/api';

console.log('[API] baseURL:', baseURL); // Para debug

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;