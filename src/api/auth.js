import client from './client';

export const register = (data) => client.post('/auth/register/', data);

export const login = (email, password) =>
  client.post('/auth/login/', { email, password });

export const refreshToken = (refresh) =>
  client.post('/auth/refresh/', { refresh });

export const getMe = () => client.get('/auth/profile/');

export const updateMe = (data) => client.patch('/auth/profile/', data);
