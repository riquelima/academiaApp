
import React, { useState, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import TrainingsPage from './pages/TrainingsPage';
import SchedulePage from './pages/SchedulePage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { User } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const login = (loggedInUser: User) => {
    setIsAuthenticated(true);
    setUser(loggedInUser);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };
  
  const authContextValue = useMemo(() => ({ isAuthenticated, user, login, logout }), [isAuthenticated, user]);


  if (!isAuthenticated) {
    return (
      <AuthContext.Provider value={authContextValue}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="flex h-screen bg-dark-bg text-light-text">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg p-6 md:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/alunos" element={<StudentsPage />} />
              <Route path="/treinos" element={<TrainingsPage />} />
              <Route path="/agenda" element={<SchedulePage />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
