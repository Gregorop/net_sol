import { apiClient } from './client';
import { ServiceRequest , RequestCreate, RequestUpdate, PaginatedRequests, RequestFilters } from '../types';

export const requestsApi = {
  getRequests: async (filters: RequestFilters = {}): Promise<PaginatedRequests> => {
    const params = new URLSearchParams();
    
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await apiClient.getClient().get(`/requests/?${params.toString()}`);
    return response.data;
  },

  createRequest: async (data: RequestCreate): Promise<ServiceRequest > => {
    const response = await apiClient.getClient().post('/requests/', data);
    return response.data;
  },

  updateRequest: async (id: number, data: RequestUpdate): Promise<ServiceRequest > => {
    const response = await apiClient.getClient().put(`/requests/${id}/status`, data);
    return response.data;
  },

  deleteRequest: async (id: number): Promise<void> => {
    await apiClient.getClient().delete(`/requests/${id}`);
  },

  healthCheck: async () => {
    const response = await apiClient.getClient().get('/health');
    return response.data;
  }
};