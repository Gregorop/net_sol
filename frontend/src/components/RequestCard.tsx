import React, { useState } from 'react';
import { ServiceRequest , RequestStatus, RequestPriority } from '../types';

interface RequestCardProps {
  request: ServiceRequest ;
  isAdmin: boolean;
  onStatusChange: (id: number, status: RequestStatus) => Promise<ServiceRequest >;
  onPriorityChange: (id: number, priority: RequestPriority) => Promise<ServiceRequest >;
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  isAdmin,
  onStatusChange,
  onPriorityChange,
  onDelete,
  loading
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as RequestStatus;
    if (newStatus === request.status) return;
    
    if (request.status === RequestStatus.DONE) {
      setError('Заявку в статусе done нельзя редактировать или удалять.');
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      await onStatusChange(request.id, newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления статуса');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as RequestPriority;
    if (newPriority === request.priority) return;

    if (request.status === RequestStatus.DONE) {
      setError('Заявку в статусе done нельзя редактировать');
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      await onPriorityChange(request.id, newPriority);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Реально хочешь удалить "${request.title}"?`)) {
      return;
    }

    setIsUpdating(true);
    setError(null);
    try {
      await onDelete(request.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case RequestPriority.HIGH: return '🔴';
      case RequestPriority.MEDIUM: return '🟡';
      case RequestPriority.LOW: return '🟢';
      default: return '';
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.NEW: return '📌';
      case RequestStatus.IN_PROGRESS: return '🔄';
      case RequestStatus.DONE: return '✅';
      default: return '';
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div>
          <h4>{request.title}</h4>
          <p style={{ color: '#666' }}>{request.description}</p>
        </div>
        <div>
          {isAdmin && request.status !== RequestStatus.DONE && (
            <button 
              onClick={handleDelete} 
              disabled={loading || isUpdating}
              style={{ color: 'red' }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '10px', alignItems: 'center' }}>
        <div>
          <span>Status: </span>
          <select 
            value={request.status} 
            onChange={handleStatusChange}
            disabled={loading || isUpdating || request.status === RequestStatus.DONE}
          >
            <option value={RequestStatus.NEW}>{getStatusColor(RequestStatus.NEW)} Новая</option>
            <option value={RequestStatus.IN_PROGRESS}>{getStatusColor(RequestStatus.IN_PROGRESS)} В работе</option>
            <option value={RequestStatus.DONE}>{getStatusColor(RequestStatus.DONE)} Готова</option>
          </select>
        </div>

        <div>
          <span>Priority: </span>
          <select 
            value={request.priority} 
            onChange={handlePriorityChange}
            disabled={loading || isUpdating || request.status === RequestStatus.DONE}
          >
            <option value={RequestPriority.LOW}>{getPriorityColor(RequestPriority.LOW)} Низкий</option>
            <option value={RequestPriority.MEDIUM}>{getPriorityColor(RequestPriority.MEDIUM)} Средний</option>
            <option value={RequestPriority.HIGH}>{getPriorityColor(RequestPriority.HIGH)} Высокий</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#999' }}>
          Created: {new Date(request.created_at).toLocaleString()}
        </div>

        {isUpdating && <span>Обновление...</span>}
      </div>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
    </div>
  );
};