import React from 'react';
import { ServiceRequest , RequestStatus, RequestPriority } from '../types';
import { RequestCard } from './RequestCard';

interface RequestListProps {
  requests: ServiceRequest [];
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  onStatusChange: (id: number, status: RequestStatus) => Promise<ServiceRequest >;
  onPriorityChange: (id: number, priority: RequestPriority) => Promise<ServiceRequest >;
  onDelete: (id: number) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  loading,
  error,
  isAdmin,
  onStatusChange,
  onPriorityChange,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (loading && requests.length === 0) {
    return <div>Загрузка запроса...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (requests.length === 0) {
    return <div>0 карт по условиям</div>;
  }

  return (
    <div>
      {requests.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          isAdmin={isAdmin}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onDelete={onDelete}
          loading={loading}
        />
      ))}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
          >
            Предыдущая
          </button>
          <span>Страница {currentPage} из {totalPages}</span>
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
          >
            Средующая
          </button>
        </div>
      )}
    </div>
  );
};