
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { mockUser } from '../data/mockData';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Simulação de autenticação
    if (email === 'admin@academia.com' && password === '1234') {
      login(mockUser);
      navigate('/dashboard');
    } else {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="bg-dark-card p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-brand-purple mb-2 text-center">Academia 12/08</h1>
        <p className="text-center text-medium-text mb-8">Bem-vindo de volta!</p>
        
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-medium-text mb-1">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-light-text focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-medium-text mb-1">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-light-text focus:ring-2 focus:ring-brand-purple focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-purple text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Entrar
          </button>
        </form>
        <p className="mt-8 text-xs text-center text-medium-text bg-gray-700 p-3 rounded-md">
          <strong>Senha de teste:</strong><br />
          Email: <code className="text-purple-400">admin@academia.com</code><br/>
          Senha: <code className="text-purple-400">1234</code>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
