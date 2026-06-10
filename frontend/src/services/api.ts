import axios from 'axios';

// Em desenvolvimento: VITE_API_URL pode ser 'http://localhost:5000' ou vazio
// Em produção: VITE_API_URL será 'https://origens-sabor-backend.onrender.com'
const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;