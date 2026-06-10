/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Define a URL base da API
// Se a variável VITE_API_URL estiver definida (produção), usa ela
// Caso contrário, usa '/api' (desenvolvimento com proxy do Vite)
const env = (import.meta as any).env;
const baseURL = env.VITE_API_URL
  ? `${env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;