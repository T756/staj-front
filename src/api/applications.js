import client from './client';

export const listApplications = (params) =>
  client.get('/applications/me/', { params });

export const applyToJob = (data) => client.post('/applications/', data);

export const updateApplicationStatus = (id, status) =>
  client.patch(`/applications/${id}/status/`, { status });

export const listInterviews = (params) =>
  client.get('/applications/interviews/', { params });

export const createInterview = (data) =>
  client.post('/applications/interviews/', data);

export const listMessages = (params) =>
  client.get('/applications/messages/', { params });

export const sendMessage = (data) =>
  client.post('/applications/messages/', data);
