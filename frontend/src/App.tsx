import { useState } from 'react';
import { useRequests } from './hooks/useRequests';
import { RequestList } from './components/RequestList';
import { RequestFiltersComponent } from './components/RequestFilters';
import { RequestForm } from './components/RequestForm';
import { AdminLogin } from './components/AdminLogin';
import { apiClient } from './api/client';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const {
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
  } = useRequests();

  const handleLogin = (username: string, password: string): boolean => {
    try {
      apiClient.setAuth(username, password);
      setIsAdmin(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    apiClient.clearAuth();
    setIsAdmin(false);
  };

  const currentPage = data?.current_page || 1;
  const totalPages = data?.total_pages || 1;
  const requests = data?.data || [];

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Система трекинга заявок:</h1>
      
      <AdminLogin 
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <hr />

      <RequestForm 
        onSubmit={createRequest}
        loading={loading}
      />

      <hr />

      <RequestFiltersComponent 
        filters={filters}
        onFilterChange={updateFilters}
      />

      <hr />

      <RequestList 
        requests={requests}
        loading={loading}
        error={error}
        isAdmin={isAdmin}
        onStatusChange={changeStatus}
        onPriorityChange={changePriority}
        onDelete={deleteRequest}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={changePage}
      />
    </div>
  );
}

export default App;