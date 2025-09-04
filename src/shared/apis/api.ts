import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    console.log('🔗 Request Interceptor:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
