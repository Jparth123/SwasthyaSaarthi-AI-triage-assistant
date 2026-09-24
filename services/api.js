import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Cases
export const createCase = (data) => api.post('/cases', data)
export const analyzeCase = (id) => api.post(`/cases/${id}/analyze`)
export const listCases = (urgency) => api.get('/cases', { params: urgency ? { urgency } : {} })
export const getCase = (id) => api.get(`/cases/${id}`)

// Dashboard
export const getDashboard = () => api.get('/dashboard')

// Alerts
export const listAlerts = () => api.get('/alerts')
export const acknowledgeAlert = (id) => api.post(`/alerts/${id}/acknowledge`)
export const syncAlert = (id) => api.post(`/alerts/${id}/sync`)
export const queueAlert = (id) => api.post(`/alerts/${id}/queue`)

// Demo
export const runDemoCase = (type) => api.post(`/demo/${type}`)

export default api
