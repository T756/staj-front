import client from './client';

export const listJobs = (params) => client.get('/vacancies/', { params });

export const listMyJobs = () => client.get('/vacancies/mine/');

export const getJobApplicants = (id) => client.get(`/vacancies/${id}/applicants/`);

export const getJob = (id) => client.get(`/vacancies/${id}/`);

export const createJob = (data) => client.post('/vacancies/', data);

export const updateJob = (id, data) => client.patch(`/vacancies/${id}/`, data);

export const deleteJob = (id) => client.delete(`/vacancies/${id}/`);
