import React from 'react';
import { Filters } from '../types';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const FiltersComponent: React.FC<Props> = ({ filters, onChange }) => {
  const handleChange = (key: keyof Filters, value: any) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      padding: '15px',
      marginBottom: '20px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <input
        type="text"
        placeholder="Поиск по заголовку/описанию"
        value={filters.search}
        onChange={(e) => handleChange('search', e.target.value)}
        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 2, minWidth: '200px' }}
      />
      
      <select
        value={filters.status}
        onChange={(e) => handleChange('status', e.target.value)}
        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
      >
        <option value="">Все статусы</option>
        <option value="new">Новая</option>
        <option value="in_progress">В работе</option>
        <option value="done">Готова</option>
      </select>
      
      <select
        value={filters.priority}
        onChange={(e) => handleChange('priority', e.target.value)}
        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
      >
        <option value="">Все приоритеты</option>
        <option value="low">Низкий</option>
        <option value="normal">Обычный</option>
        <option value="high">Высокий</option>
      </select>
      
      <select
        value={filters.sort_by}
        onChange={(e) => handleChange('sort_by', e.target.value)}
        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
      >
        <option value="created_at">По дате создания</option>
        <option value="priority">По приоритету</option>
      </select>
      
      <button
        onClick={() => handleChange('sort_desc', !filters.sort_desc)}
        style={{
          padding: '8px 12px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {filters.sort_desc ? '▼' : '▲'}
      </button>
    </div>
  );
};

export default FiltersComponent;