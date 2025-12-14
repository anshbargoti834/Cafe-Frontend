import axios from 'axios';

// 1. Create the Axios Instance
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Make sure this matches your backend
});

// 2. REQUEST INTERCEPTOR (The "Auto-Attach" Logic)
// Before sending any request, check if we have a token and attach it.
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

// 3. RESPONSE INTERCEPTOR (The "Auto-Logout" Logic)
// If the backend replies with an error, check if it's a 401 (Unauthorized).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Logic: If 401, it means Token Expired or Invalid.
      // Action: Clear storage and kick user to Login.
      localStorage.removeItem('adminToken');
      
      // We use window.location because we are outside a React Component
      // checking prevents infinite loop if we are already on login
      if (!window.location.pathname.includes('/admin/login')) {
         window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  menu: {
    getAll: () => api.get('/menu'),
    // Now we don't need to pass headers manually!
    create: (data: any) => {
      if (data instanceof FormData) {
        return api.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return api.post('/menu', data);
    },
    // Add these for Admin
    delete: (id: string) => api.delete(`/menu/${id}`),
    update: (id: string, data: any) => api.put(`/menu/${id}`, data),
  },
  reservations: {
    create: (data: any) => api.post('/reservations', data),
    checkAvailability: (date: string, timeSlot: string) => api.get(`/reservations/availability?date=${date}&timeSlot=${timeSlot}`),
    // Admin only
    getAll: () => api.get('/reservations'), 
    delete: (id: string) => api.delete(`/reservations/${id}`),
  },
  contact: {
    submit: (data: any) => api.post('/contact', data),
    // Admin functions
    getAll: () => api.get('/contact'),
    delete: (id: string) => api.delete(`/contact/${id}`),
    // ✅ CORRECT: This injects the real ID
reply: (id: string, message: string) => api.post(`/contact/${id}/reply`, { replyMessage: message }),
  },
  auth: {
    login: (credentials: any) => api.post('/auth/login', credentials),
  }
};

export default api;