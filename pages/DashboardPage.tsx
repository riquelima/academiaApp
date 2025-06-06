

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import { UserGroupIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, UserPlusIcon, UserMinusIcon, MegaphoneIcon, CurrencyDollarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
// Removed Recharts imports as charts are removed
import { StatCardData } from '../types';

// Mock data for charts removed as charts are removed

const StatCard: React.FC<StatCardData> = ({ title, value, icon, trend }) => (
  <Card className="hover:shadow-primary-purple/30 transform hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-primary-purple/20 text-primary-purple mr-4">
        {icon && React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { ...((icon as React.ReactElement<any>).props || {}), className: `h-7 w-7 ${((icon as React.ReactElement<any>).props?.className || '')}`.trim() }) : null}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 truncate">{title}</p>
        <p className="text-3xl font-semibold text-slate-100">{value}</p>
      </div>
    </div>
    {trend && (
      <div className={`mt-2 text-xs flex items-center ${trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
        {trend.startsWith('+') ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
        {trend}
      </div>
    )}
  </Card>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCardData[]>([]);

  useEffect(() => {
    // Simulate fetching stats
    setTimeout(() => {
      setStats([
        { title: 'Alunos Ativos', value: 152, icon: <UserGroupIcon />, trend: '+5 desde mês passado' },
        { title: 'Novos Alunos (Mês)', value: 18, icon: <UserPlusIcon />, trend: '+12% vs mês anterior' },
        { title: 'Cancelamentos (Mês)', value: 4, icon: <UserMinusIcon />, trend: '-2 vs mês anterior' },
        { title: 'Eventos da Semana', value: 3, icon: <MegaphoneIcon />, trend: 'Zumba, Funcional, Yoga' },
        { title: 'Presenças Hoje', value: 78, icon: <CheckBadgeIcon />, trend: '+8% vs ontem' },
        { title: 'Resumo Financeiro (Mês)', value: "R$ 12.3k", icon: <CurrencyDollarIcon />, trend: "+7% vs mês anterior" },
      ]);
    }, 500);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-100">
        Bem-vindo(a) de volta, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.length === 0 ? (
          Array(6).fill(0).map((_, idx) => (
            <Card key={idx} className="animate-pulse">
              <div className="h-24 bg-slate-700 rounded"></div>
            </Card>
          ))
        ) : (
          stats.map((stat) => <StatCard key={stat.title} {...stat} />)
        )}
      </div>

      {/* Charts section removed */}
      
      <Card title="Próximas Aulas Agendadas">
        <p className="text-slate-400">Funcionalidade de agendamento de aulas em desenvolvimento.</p>
        {/* Example upcoming class items - can be made dynamic later */}
        <div className="mt-4 space-y-3">
            <div className="p-3 bg-slate-700/50 rounded-md flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-primary-purple">Aula de Spinning</h4>
                    <p className="text-sm text-slate-300">Prof. João - Amanhã às 18:00</p>
                </div>
                <span className="text-xs text-slate-400">15/20 vagas</span>
            </div>
             <div className="p-3 bg-slate-700/50 rounded-md flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-primary-purple">Yoga Restaurativa</h4>
                    <p className="text-sm text-slate-300">Prof. Maria - Quarta-feira às 09:00</p>
                </div>
                <span className="text-xs text-slate-400">8/12 vagas</span>
            </div>
             <div className="p-3 bg-slate-700/50 rounded-md flex justify-between items-center">
                <div>
                    <h4 className="font-semibold text-primary-purple">Treinamento Funcional</h4>
                    <p className="text-sm text-slate-300">Prof. Lucas - Sexta-feira às 07:00</p>
                </div>
                <span className="text-xs text-slate-400">10/15 vagas</span>
            </div>
        </div>
      </Card>

    </div>
  );
};

export default DashboardPage;