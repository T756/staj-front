import client from './client';

export const listCompanies = (params) => client.get('/auth/companies/', { params });

export const createCompany = (data) => client.post('/auth/companies/', data);

export const getCompany = (id) => client.get(`/auth/companies/${id}/`);

export const updateCompany = (id, data) => client.patch(`/auth/companies/${id}/`, data);

export const deleteCompany = (id) => client.delete(`/auth/companies/${id}/`);

export const listCompanyFollowers = (params) =>
  client.get('/auth/company-followers/', { params });

export const followCompany = (company) =>
  client.post('/auth/company-followers/', { company });

export const unfollowCompany = (id) =>
  client.delete(`/auth/company-followers/${id}/`);

export const listCompanyReviews = (params) =>
  client.get('/auth/company-reviews/', { params });

export const reviewCompany = (data) =>
  client.post('/auth/company-reviews/', data);
