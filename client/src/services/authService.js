import api from './api';

const authService = {
  register: (data) => api.post('/auth/register', data).then((res) => res.data),
  login: (data) => api.post('/auth/login', data).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
  refresh: () => api.post('/auth/refresh').then((res) => res.data),
  getMe: () => api.get('/auth/me').then((res) => res.data),
};

export default authService;
