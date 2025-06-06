
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StudentProvider } from './contexts/StudentContext';
import { WorkoutProvider } from './contexts/WorkoutContext'; // Import WorkoutProvider
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import WorkoutsPage from './pages/WorkoutsPage';
import SchedulePage from './pages/SchedulePage';
// Removed: import PlansPage from './pages/PlansPage';
// Removed: import ChatbotPage from './pages/ChatbotPage';
import MainLayout from './layouts/MainLayout';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <MainLayout><Outlet /></MainLayout>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <StudentProvider>
        <WorkoutProvider> {/* Wrap with WorkoutProvider */}
          <HashRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/workouts" element={<WorkoutsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                {/* Removed: <Route path="/plans" element={<PlansPage />} /> */}
                {/* Removed: <Route path="/chatbot" element={<ChatbotPage />} /> */}
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} /> {}
            </Routes>
          </HashRouter>
        </WorkoutProvider>
      </StudentProvider>
    </AuthProvider>
  );
};

export default App;