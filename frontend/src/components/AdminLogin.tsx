import React, { useState } from 'react';

interface Props {
  onLogin: (token: string) => void;
  onLogout: () => void;
  isAdmin: boolean;
}

const AdminLogin: React.FC<Props> = ({ onLogin, onLogout, isAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Простая проверка для демонстрации
    if (username === 'admin' && password === 'admin') {
      onLogin('correct_password');
    } else {
      alert('Неверные логин или пароль');
    }
  };

  if (isAdmin) {
    return (
      <div style={{
        padding: '10px',
        marginBottom: '20px',
        background: '#e8f5e9',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>✅ Вы вошли как администратор</span>
        <button
          onClick={onLogout}
          style={{
            padding: '4px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '15px',
      marginBottom: '20px',
      background: '#f5f5f5',
      borderRadius: '4px',
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <span style={{ fontWeight: 'bold' }}>Вход для админа:</span>
      <input
        type="text"
        placeholder="Логин"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', width: '120px' }}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', width: '120px' }}
      />
      <button
        onClick={handleLogin}
        style={{
          padding: '6px 16px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Войти
      </button>
    </div>
  );
};

export default AdminLogin;