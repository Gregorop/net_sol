import React, { useState, useEffect } from 'react';
import { api } from './api/requests';
import { Request, Filters } from './types';
import RequestList from './components/RequestList';
import CreateRequest from './components/CreateRequest';
import FiltersComponent from './components/Filters';
import AdminLogin from './components/AdminLogin';

function App() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    search: '',
    sort_by: 'created_at',
    sort_desc: true,
    page: 1,
    limit: 10
  });
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRequests(filters);
      setRequests(data.data);
      setTotalItems(data.total_items);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const handleCreate = async (data: any) => {
    try {
      await api.createRequest(data);
      await loadRequests();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка создания');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.updateStatus(id, status);
      await loadRequests();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка изменения статуса');
    }
  };

  const handleDelete = async (id: number) => {
    if (!adminToken) {
      alert('Требуется вход как админ');
      return;
    }
    if (!confirm('Удалить заявку?')) return;
    try {
      await api.deleteRequest(id, adminToken);
      await loadRequests();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Учёт заявок</h1>
      
      <AdminLogin onLogin={setAdminToken} onLogout={() => setAdminToken(null)} isAdmin={!!adminToken} />
      
      <CreateRequest onCreate={handleCreate} />
      
      <FiltersComponent filters={filters} onChange={setFilters} />
      
      {error && <div style={{ color: 'red', padding: '10px', background: '#ffebee' }}>{error}</div>}
      
      <RequestList
        requests={requests}
        loading={loading}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isAdmin={!!adminToken}
      />
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setFilters(f => ({ ...f, page: Math.max(1, f.page - 1) }))}
          disabled={filters.page === 1}
        >
          Предыдущая
        </button>
        <span>Страница {filters.page} из {totalPages || 1}</span>
        <button
          onClick={() => setFilters(f => ({ ...f, page: Math.min(totalPages || 1, f.page + 1) }))}
          disabled={filters.page >= totalPages}
        >
          Следующая
        </button>
      </div>
      
      <div style={{ marginTop: '10px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Всего: {totalItems} заявок
      </div>
    </div>
  );
}

export default App;