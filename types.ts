
export interface User {
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface StatCardData {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactElement; // Changed from React.ReactNode
  details?: string;
}

export interface ScheduledClass {
  id: string;
  name: string;
  teacher: string;
  time: string;
  spotsFilled: number;
  totalSpots: number;
}

export interface Student {
  id: string;
  photoUrl: string;
  name: string;
  cpf: string;
  phone: string;
  paymentStatus: 'Em dia' | 'Atrasado' | 'Pendente';
  membershipType: string; // e.g. Mensal, Anual
}

export enum TrainingObjective {
  HIPERTROFIA = 'Hipertrofia',
  RESISTENCIA = 'Resistência',
  FORCA = 'Força',
  PERDA_PESO = 'Perda de Peso',
}

export interface Training {
  id: string;
  name: string;
  associatedStudents: number;
  objective: TrainingObjective;
  totalExercises: number;
  exampleExercise?: string;
}

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}
