import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/fleet',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Interceptor: Her isteğe Token Ekleme ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor: 401 durumunda çıkış yapma ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('company_id')
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Vehicle API ──
export const vehicleApi = {
  list: () => api.get('/vehicles/'),
  create: (data) => api.post('/vehicles/', data),
  get: (id) => api.get(`/vehicles/${id}/`),
  update: (id, data) => api.put(`/vehicles/${id}/`, data),
  delete: (id) => api.delete(`/vehicles/${id}/`),
}

// ── Student API ──
export const studentApi = {
  list: () => api.get('/students/'),
  create: (data) => api.post('/students/', data),
  get: (id) => api.get(`/students/${id}/`),
  update: (id, data) => api.put(`/students/${id}/`, data),
  delete: (id) => api.delete(`/students/${id}/`),
  assignVehicle: (id, vehicleId) =>
    api.patch(`/students/${id}/assign-vehicle/`, { vehicle_id: vehicleId }),
  aiImport: (formData) => api.post('/students/ai-import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  aiConfirmImport: (data) => api.post('/students/ai-confirm-import/', data),
}

// ── Payment API ──
export const paymentApi = {
  list: () => api.get('/payments/'),
  create: (data) => api.post('/payments/', data),
  approveInstallment: (id, paymentMethod = 'cash') => api.post(`/payments/${id}/approve/`, { payment_method: paymentMethod }),
}

// ── Notification API ──
export const notificationApi = {
  sendReminder: (data) => api.post('/notifications/send-payment-reminder/', data),
}

// ── Auth API ──
export const authApi = {
  registerCompany: (data) => api.post('/auth/register-company/', data),
  companyLogin: (data) => api.post('/auth/company-login/', data),
  driverLogin: (data) => api.post('/auth/driver-login/', data),
  deleteCompany: () => api.delete('/auth/delete-company/'),
}

// ── Driver API ──
export const driverApi = {
  login: (phone) => api.post('/auth/driver-login/', { phone }),
}

// ── Attendance API ──
export const attendanceApi = {
  log: (data) => api.post('/attendance/log/', data),
}

export default api
