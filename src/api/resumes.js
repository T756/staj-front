import client from './client';

export const listResumes = (params) => client.get('/resumes/', { params });

export const getResume = (id) => client.get(`/resumes/${id}/`);

export const createResume = (data) => client.post('/resumes/', data);

export const updateResume = (id, data) => client.patch(`/resumes/${id}/`, data);

export const deleteResume = (id) => client.delete(`/resumes/${id}/`);
