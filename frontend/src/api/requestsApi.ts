# --- 5. Frontend Scaffold (React/TypeScript) ---

mkdir -p frontend/src/components
mkdir -p frontend/src/hooks
mkdir -p frontend/src/pages

// File: frontend/src/api/requestsApi.ts
/** Service layer for all API interactions */

import axios from 'axios';
import { Request, StatusFilter, PriorityFilter } from '../types/requestTypes';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Matches the container hostname if using docker-compose
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor for adding Auth headers (e.g., Admin token)
api.interceptors.request.use(config => {
    const isAdmin = localStorage.getItem('adminToken'); // Simple local storage check
    if (isAdmin) {
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('adminToken')}`;
    }
    return config;
}, error => Promise.reject(error));

// 1. Create Request
export const createRequest = async (data: Request): Promise<Request> => {
    return api.post<Request>('/requests/', data);
};

// 2. List/Filter Requests (Includes search, pagination)
export const fetchRequests = async (params: {
    status?: StatusFilter;
    priority?: PriorityFilter;
    search?: string;
    sortBy?: 'created_at' | 'priority';
    sortDesc?: boolean;
    page: number;
    limit: number;
}): Promise<{ data: Request[]; total_items: number }> => {
    const queryParams = new URLSearchParams({
        status: params.status || undefined,
        priority: params.priority || undefined,
        search: params.search || undefined,
        sort_by: params.sortBy || 'created_at',
        sort_desc: params.sortDesc?.toString() || 'true',
        page: params.page.toString(),
        limit: params.limit.toString()
    });

    const response = await api.get<any>(`/requests/?${queryParams.toString()}`);
    return { 
        data: response.data.data, 
        total_items: response.data.total_items 
    };
};

// 3. Update Status
export const updateRequestStatus = async (requestId: number, updates: Partial<Omit<Request, 'id' | 'created_at'>>): Promise<Request> => {
    return api.put<Request>(`/requests/${requestId}/status`, updates);
};

// 4. Delete Request (Requires Admin)
export const deleteRequest = async (requestId: number): Promise<void> => {
    try {
        await api.delete(`/requests/${requestId}`);
    } catch(e) {
        // Re-throw to be handled by component/user feedback
        throw e; 
    }
};

// Types definitions (For type safety)
export type StatusFilter = 'new' | 'in_progress' | 'done';
export type PriorityFilter = 'low' | 'normal' | 'high';