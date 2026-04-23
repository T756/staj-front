import client from './client';

export const listApplications = (params) =>
  client.get('/applications/me/', { params });

export const getApplication = (id) => client.get(`/applications/${id}/`);

export const applyToJob = (data) => client.post('/applications/', data);

export const updateApplicationStatus = (id, status) =>
  client.patch(`/applications/${id}/status/`, { status });
