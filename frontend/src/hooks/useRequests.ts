import { useState, useEffect, useCallback } from 'react';
import { requestsApi } from '../api/requests';
import { RequestFilters, PaginatedRequests, RequestStatus, RequestPriority } from '../types';

export const useRequests = (initialFilters: RequestFilters = {}) => {
  const [data, setData] = useState<PaginatedRequests | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RequestFilters>({
    limit: 20,
    sort: '-created_at,+priority',
    ...initialFilters
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await requestsApi.getRequests(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<RequestFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, skip: 0 }));
  }, []);

  const changePage = useCallback((page: number) => {
    const skip = (page - 1) * (filters.limit || 20);
    setFilters(prev => ({ ...prev, skip }));
  }, [filters.limit]);

  const changeStatus = useCallback(async (id: number, status: RequestStatus) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await requestsApi.updateRequest(id, { status });
      if (data) {
        const updatedData = data.data.map(item => 
          item.id === id ? updated : item
        );
        setData({ ...data, data: updatedData });
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Статус не обновлен, ошибка');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const changePriority = useCallback(async (id: number, priority: RequestPriority) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await requestsApi.updateRequest(id, { priority });
      if (data) {
        const updatedData = data.data.map(item => 
          item.id === id ? updated : item
        );
        setData({ ...data, data: updatedData });
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Приоритет не обновлен, ошибка');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const deleteRequest = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await requestsApi.deleteRequest(id);
      if (data) {
        const updatedData = data.data.filter(item => item.id !== id);
        setData({ ...data, data: updatedData, total_items: data.total_items - 1 });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  const createRequest = useCallback(async (title: string, description: string, status: RequestStatus, priority: RequestPriority) => {
    setLoading(true);
    setError(null);
    try {
      const newRequest = await requestsApi.createRequest({ title, description, status, priority });
      if (data) {
        setData({ 
          ...data, 
          data: [newRequest, ...data.data],
          total_items: data.total_items + 1
        });
      }
      return newRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    data,
    loading,
    error,
    filters,
    updateFilters,
    changePage,
    changeStatus,
    changePriority,
    deleteRequest,
    createRequest,
    refetch: fetchRequests
  };
};