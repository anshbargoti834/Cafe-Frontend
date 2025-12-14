import axios from 'axios';

// 1. DEFINE THE SERVER URL (For Images)
// This logic checks if the env var exists (Vercel). If not, it uses localhost.
// NOTE: We remove any trailing slash to avoid double slashes later.
export const SERVER_URL = (import.meta.env.VITE_API_BASE_URL ).replace(/\/$/, '');

// 2. DEFINE THE API URL (For Axios Data Fetching)
const API_URL = `${SERVER_URL}/api`;

// 3. Create the Axios Instance
const api = axios.create({
  baseURL: API_URL, 
});

// --- INTERCEPTORS ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      if (!window.location.pathname.includes('/admin/login')) {
         window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- ENDPOINTS ---
export const endpoints = {
  menu: {
    getAll: () => api.get('/menu'),
    create: (data: any) => {
      if (data instanceof FormData) {
        return api.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return api.post('/menu', data);
    },
    delete: (id: string) => api.delete(`/menu/${id}`),
    update: (id: string, data: any) => api.put(`/menu/${id}`, data),
  },
  reservations: {
    create: (data: any) => api.post('/reservations', data),
    checkAvailability: (date: string, timeSlot: string) => api.get(`/reservations/availability?date=${date}&timeSlot=${timeSlot}`),
    getAll: () => api.get('/reservations'), 
    delete: (id: string) => api.delete(`/reservations/${id}`),
  },
  contact: {
    submit: (data: any) => api.post('/contact', data),
    getAll: () => api.get('/contact'),
    delete: (id: string) => api.delete(`/contact/${id}`),
    reply: (id: string, message: string) => api.post(`/contact/${id}/reply`, { replyMessage: message }),
  },
  auth: {
    login: (credentials: any) => api.post('/auth/login', credentials),
  }
};

export default api;