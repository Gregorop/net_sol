import React, { useState } from 'react';

interface AdminLoginProps {
  isAdmin: boolean;
  onLogin: (username: string, password: string) => boolean;
  onLogout: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isAdmin, onLogin, onLogout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = onLogin(username, password);
    if (!success) {
      setError('Неправильный логин или пароль');
    }
  };

  if (isAdmin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#f0f0f0' }}>
        <span>🔒 АДМИН Mode</span>
        <button onClick={onLogout}>Выйти</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', background: '#f9f9f9' }}>
      <h4>Вход админа</h4>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Зайти как админ</button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
};