
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { IconUserCircle } from '../constants.tsx'; // Explicitly use .tsx

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/alunos')) return 'Alunos';
    if (path.includes('/treinos')) return 'Treinos';
    if (path.includes('/agenda')) return 'Agenda';
    return 'Academia 12/08';
  };

  return (
    <header className="h-16 bg-dark-card shadow-md flex items-center justify-between px-6 border-b border-dark-border">
      <h1 className="text-xl font-semibold text-light-text">{getPageTitle()}</h1>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-medium-text">Olá, {user?.name || 'Administrador'}</span>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
        ) : (
          <IconUserCircle className="w-8 h-8 text-medium-text" />
        )}
      </div>
    </header>
  );
};

export default Header;
