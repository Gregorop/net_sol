import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../types';

interface RequestFormProps {
  onSubmit: (title: string, description: string, status: RequestStatus, priority: RequestPriority) => Promise<ServiceRequest >;
  loading: boolean;
}

export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.NEW);
  const [priority, setPriority] = useState<RequestPriority>(RequestPriority.MEDIUM);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError('Заголовок нужен');
      return;
    }

    try {
      await onSubmit(title, description, status, priority);
      setTitle('');
      setDescription('');
      setStatus(RequestStatus.NEW);
      setPriority(RequestPriority.MEDIUM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания');
    }
  };

  return (
    <div>
      <h3>Создать новую заявку</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <textarea
            placeholder="Описание..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value as RequestStatus)}
            disabled={loading}
          >
            <option value={RequestStatus.NEW}>Новая</option>
            <option value={RequestStatus.IN_PROGRESS}>В работе</option>
            <option value={RequestStatus.DONE}>Завершена</option>
          </select>
        </div>
        <div>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value as RequestPriority)}
            disabled={loading}
          >
            <option value={RequestPriority.LOW}>Низкий</option>
            <option value={RequestPriority.MEDIUM}>Средний</option>
            <option value={RequestPriority.HIGH}>Высокий</option>
          </select>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Create Request'}
        </button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
};