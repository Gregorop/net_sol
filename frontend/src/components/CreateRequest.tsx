import React, { useState } from 'react';
import { RequestCreate } from '../types';

interface Props {
  onCreate: (data: RequestCreate) => void;
}

const CreateRequest: React.FC<Props> = ({ onCreate }) => {
  const [form, setForm] = useState<RequestCreate>({
    title: '',
    description: '',
    status: 'new',
    priority: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Заголовок обязателен');
      return;
    }
    onCreate(form);
    setForm({ title: '', description: '', status: 'new', priority: 'normal' });
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      background: '#f5f5f5'
    }}>
      <h3>Создать заявку</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Заголовок (3-120 символов)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <textarea
          placeholder="Описание (до 1000 символов)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          maxLength={1000}
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
          >
            <option value="low">Низкий приоритет</option>
            <option value="normal">Обычный приоритет</option>
            <option value="high">Высокий приоритет</option>
          </select>
          <button
            type="submit"
            style={{
              padding: '8px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;