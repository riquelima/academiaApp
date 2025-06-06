
import { StatCardData, ScheduledClass, Student, Training, TrainingObjective } from '../types';
import { IconUsers, IconTrendingUp, IconTrendingDown, IconSparkles, IconCheckCircle, IconDollar, IconActivity } from '../constants';
import React from 'react';

export const mockUser = {
  email: 'admin@academia.com',
  name: 'Administrador Academia 12/08',
  avatarUrl: 'https://picsum.photos/seed/admin/40/40'
};

export const dashboardStats: StatCardData[] = [
  {
    title: 'Alunos Ativos',
    value: '152',
    change: '+5 desde mês passado',
    changeType: 'positive',
    icon: React.createElement(IconUsers, { className: 'w-8 h-8' }),
  },
  {
    title: 'Novos Alunos (Mês)',
    value: '18',
    change: '+12% vs mês anterior',
    changeType: 'positive',
    icon: React.createElement(IconTrendingUp, { className: 'w-8 h-8' }),
  },
  {
    title: 'Cancelamentos (Mês)',
    value: '4',
    change: '-2 vs mês anterior',
    changeType: 'negative',
    icon: React.createElement(IconTrendingDown, { className: 'w-8 h-8' }),
  },
  {
    title: 'Eventos da Semana',
    value: '3',
    details: 'Zumba, Funcional, Yoga',
    icon: React.createElement(IconSparkles, { className: 'w-8 h-8' }),
  },
  {
    title: 'Presenças Hoje',
    value: '78',
    change: '+8% vs ontem',
    changeType: 'positive',
    icon: React.createElement(IconCheckCircle, { className: 'w-8 h-8' }),
  },
  {
    title: 'Resumo Financeiro (Mês)',
    value: 'R$ 12.3k', // Original: R$ 12.300
    change: '+7% vs mês anterior',
    changeType: 'positive',
    icon: React.createElement(IconDollar, { className: 'w-8 h-8' }),
  },
];

export const scheduledClassesData: ScheduledClass[] = [
  { id: '1', name: 'Aula de Spinning', teacher: 'Prof. João', time: 'Amanhã às 18:00', spotsFilled: 15, totalSpots: 20 },
  { id: '2', name: 'Yoga Restaurativa', teacher: 'Prof. Maria', time: 'Quarta-feira às 09:00', spotsFilled: 8, totalSpots: 12 },
  { id: '3', name: 'Treinamento Funcional', teacher: 'Prof. Lucas', time: 'Sexta-feira às 07:00', spotsFilled: 10, totalSpots: 15 },
];

export const studentsData: Student[] = [
  { id: 's1', photoUrl: 'https://picsum.photos/seed/andromeda/40/40', name: 'Andromeda Ximenes', cpf: '04868906854', phone: '858544', paymentStatus: 'Em dia', membershipType: 'Mensal' },
  { id: 's2', photoUrl: 'https://picsum.photos/seed/azvdo/40/40', name: 'Azvdo Pereira', cpf: '4547545454', phone: '454754547', paymentStatus: 'Em dia', membershipType: 'Mensal' },
  { id: 's3', photoUrl: 'https://picsum.photos/seed/henrique/40/40', name: 'Henrique Lima', cpf: '123456', phone: '98764894', paymentStatus: 'Em dia', membershipType: 'Mensal' },
  { id: 's4', photoUrl: 'https://picsum.photos/seed/carla/40/40', name: 'Carla Souza', cpf: '11122233344', phone: '998877665', paymentStatus: 'Atrasado', membershipType: 'Anual' },
  { id: 's5', photoUrl: 'https://picsum.photos/seed/bruno/40/40', name: 'Bruno Alves', cpf: '55566677788', phone: '912345678', paymentStatus: 'Pendente', membershipType: 'Trimestral' },
];

export const trainingsData: Training[] = [
  { id: 't1', name: 'ABC', associatedStudents: 0, objective: TrainingObjective.RESISTENCIA, totalExercises: 0, exampleExercise: 'Nenhum exercício cadastrado.' },
  { id: 't2', name: 'Treino A', associatedStudents: 0, objective: TrainingObjective.HIPERTROFIA, totalExercises: 0, exampleExercise: 'Nenhum exercício cadastrado.' },
  { id: 't3', name: 'Treino Teste', associatedStudents: 0, objective: TrainingObjective.HIPERTROFIA, totalExercises: 0, exampleExercise: 'Nenhum exercício cadastrado.' },
  { id: 't4', name: 'Cardio Intenso', associatedStudents: 15, objective: TrainingObjective.PERDA_PESO, totalExercises: 5, exampleExercise: 'Corrida na esteira, Burpees' },
  { id: 't5', name: 'Força Total', associatedStudents: 8, objective: TrainingObjective.FORCA, totalExercises: 6, exampleExercise: 'Supino, Agachamento Livre' },
];
