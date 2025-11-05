import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Events
export const eventAPI = {
  getAll: () => api.get('/events'),
  getActive: () => api.get('/events/active'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getStats: (id) => api.get(`/events/${id}/stats`)
};

// Participants
export const participantAPI = {
  getByEvent: (eventId) => api.get(`/events/${eventId}/participants`),
  getById: (id) => api.get(`/participants/${id}`),
  create: (data) => api.post('/participants', data),
  import: (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    return api.post('/participants/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => api.put(`/participants/${id}`, data),
  delete: (id) => api.delete(`/participants/${id}`),
  downloadQRCodes: (eventId) => {
    return axios({
      url: `/api/events/${eventId}/qrcodes`,
      method: 'GET',
      responseType: 'blob'
    });
  }
};

// Attendance
export const attendanceAPI = {
  scan: (data) => api.post('/attendance/scan', data),
  getByEvent: (eventId) => api.get(`/events/${eventId}/attendance`),
  getRecent: (limit = 50) => api.get(`/attendance/recent?limit=${limit}`),
  delete: (id) => api.delete(`/attendance/${id}`)
};

// Devices
export const deviceAPI = {
  getAll: () => api.get('/devices'),
  getOnline: () => api.get('/devices/online'),
  register: (data) => api.post('/devices/register', data),
  updateActivity: (id) => api.put(`/devices/${id}/activity`),
  delete: (id) => api.delete(`/devices/${id}`)
};

export default api;
