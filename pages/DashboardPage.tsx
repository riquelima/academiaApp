
import React from 'react';
import StatCard from '../components/StatCard';
import ScheduledClassItem from '../components/ScheduledClassItem';
import { dashboardStats, scheduledClassesData } from '../data/mockData';
import { useAuth } from '../App';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-6">
        Bem-vindo(a) de volta, <span className="text-brand-purple">{user?.name?.split(' ')[0] || 'Administrador'}</span>! 👋
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-light-text mb-4">Próximas Aulas Agendadas</h3>
        <div className="bg-dark-card p-1 md:p-2 rounded-lg shadow">
            {scheduledClassesData.length > 0 ? (
            scheduledClassesData.map((sClass) => (
                <ScheduledClassItem key={sClass.id} sClass={sClass} />
            ))
            ) : (
            <p className="text-medium-text p-4">Nenhuma aula agendada no momento.</p>
            )}
        </div>
        <p className="text-sm text-medium-text mt-4 p-4 bg-dark-card rounded-lg">
          Funcionalidade de agendamento de aulas em desenvolvimento.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
