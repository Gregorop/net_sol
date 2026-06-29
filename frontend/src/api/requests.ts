import axios from 'axios';
import { Request, RequestCreate, RequestUpdate, PaginatedResponse, Filters } from '../types';

const API_BASE = '/api/requests';

export const api = {
  getRequests: async (filters: Filters): Promise<PaginatedResponse> => {
    const params = new URLSearchParams({
      skip: String((filters.page - 1) * filters.limit),
      limit: String(filters.limit),
      sort_by: filters.sort_by,
      sort_desc: String(filters.sort_desc),
    });

    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);

    const response = await axios.get(`${API_BASE}/?${params}`);
    return response.data;
  },

  createRequest: async (data: RequestCreate): Promise<Request> => {
    const response = await axios.post(API_BASE + '/', data);
    return response.data;
  },

  updateStatus: async (id: number, status: string): Promise<Request> => {
    const response = await axios.put(`${API_BASE}/${id}/status`, { status });
    return response.data;
  },

  deleteRequest: async (id: number, adminToken: string): Promise<void> => {
    await axios.delete(`${API_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
  }
};