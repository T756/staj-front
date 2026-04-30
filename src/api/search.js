import client from './client';

export const searchVacancies = (params) =>
  client.get('/search/vacancies/', { params });
