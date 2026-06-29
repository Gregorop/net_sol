import React from 'react';
import { Request } from '../types';

interface Props {
  requests: Request[];
  loading: boolean;
  onStatusChange: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

const statusColors = {
  new: '#2196F3',
  in_progress: '#FF9800',
  done: '#4CAF50'
};

const priorityLabels = {
  low: 'Низкий',
  normal: 'Обычный',
  high: 'Высокий'
};

const statusLabels = {
  new: 'Новая',
  in_progress: 'В работе',
  done: 'Готова'
};

const RequestList: React.FC<Props> = ({ requests, loading, onStatusChange, onDelete, isAdmin }) => {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;
  }

  if (requests.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Нет заявок</div>;
  }

  return (
    <div>
      {requests.map(req => (
        <div
          key={req.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            background: '#f9f9f9'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{req.title}</h3>
              {req.description && (
                <p style={{ margin: '5px 0', color: '#555' }}>{req.description}</p>
              )}
              <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '14px' }}>
                <span>
                  Приоритет: <strong>{priorityLabels[req.priority]}</strong>
                </span>
                <span>
                  Создана: {new Date(req.created_at).toLocaleString()}
                </span>
                <span>
                  Обновлена: {new Date(req.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
              <span
                style={{
                  background: statusColors[req.status],
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px'
                }}
              >
                {statusLabels[req.status]}
              </span>
              
              {req.status !== 'done' && (
                <select
                  value={req.status}
                  onChange={(e) => onStatusChange(req.id, e.target.value)}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  <option value="new">Новая</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Готова</option>
                </select>
              )}
              
              {isAdmin && req.status !== 'done' && (
                <button
                  onClick={() => onDelete(req.id)}
                  style={{
                    padding: '4px 12px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestList;