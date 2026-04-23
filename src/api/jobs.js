import client from './client';

export const listVacancies = (params) => client.get('/vacancies/', { params });

export const getVacancy = (id) => client.get(`/vacancies/${id}/`);

export const createVacancy = (data) => client.post('/vacancies/', data);

export const updateVacancy = (id, data) => client.patch(`/vacancies/${id}/`, data);

export const deleteVacancy = (id) => client.delete(`/vacancies/${id}/`);

export const listMyVacancies = (params) => client.get('/vacancies/mine/', { params });

export const listVacancyApplicants = (id, params) =>
  client.get(`/vacancies/${id}/applicants/`, { params });

export const searchVacancies = (params) =>
  client.get('/search/vacancies/', { params });
