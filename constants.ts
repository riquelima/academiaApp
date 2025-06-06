import { ChartBarIcon, UsersIcon, SparklesIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { PlanTier, Student, PaymentStatus, Exercise, WorkoutSheet } from './types'; 

export const APP_NAME = "Academia 12/08";

export const SIDEBAR_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
  { name: "Alunos", href: "/students", icon: UsersIcon },
  { name: "Treinos", href: "/workouts", icon: SparklesIcon },
  { name: "Agenda", href: "/schedule", icon: CalendarIcon },
];

export const MOCK_API_LATENCY = 500; // ms (Still used in authService for mock, can be removed after full Supabase auth)

export const DEFAULT_USER_PHOTO = "https://picsum.photos/seed/defaultuser/100/100"; // Fallback
export const DEFAULT_STUDENT_PHOTO = (seed: string = "student") => `https://picsum.photos/seed/${seed}/100/100`; // Fallback

export const MUSCLE_GROUPS = ["Peito", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Cardio", "Outro"];
export const DAYS_OF_WEEK = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

// These plan details should ideally match what's in your Supabase 'plans' table
export const AVAILABLE_PLANS = [
  { id: 'p1', name: PlanTier.MONTHLY, durationDays: 30, price: 79.90 },
  { id: 'p2', name: PlanTier.QUARTERLY, durationDays: 90, price: 219.90 },
  { id: 'p3', name: PlanTier.ANNUAL, durationDays: 365, price: 799.90 },
];

// Initial mock data, primarily for fallback or if Supabase fetch fails during development.
// Contexts will fetch from Supabase primarily.
export const MOCK_STUDENTS_INITIAL_DATA: Student[] = [
  { id: 's1', name: 'Ana Silva', cpf: '111.222.333-44', phone: '(11) 98765-4321', birthDate: '1990-05-15', currentPlanId: 'p1', planExpiryDate: '2024-12-31', paymentStatus: PaymentStatus.PAID, photoUrl: DEFAULT_STUDENT_PHOTO('anasilva'), observations: 'Foco em perda de peso.' },
  { id: 's2', name: 'Bruno Costa', cpf: '222.333.444-55', phone: '(21) 91234-5678', birthDate: '1985-11-20', currentPlanId: 'p2', planExpiryDate: '2024-08-15', paymentStatus: PaymentStatus.WARNING, photoUrl: DEFAULT_STUDENT_PHOTO('brunocosta') },
];

export const WORKOUT_GOALS = ["Hipertrofia", "Emagrecimento", "Resistência", "Força", "Condicionamento", "Manutenção"];

// This list should ideally match the 'exercises' table in Supabase
export const EXERCISE_LIST: Array<{id: string, name: string, muscleGroup: string}> = [
  { id: 'ex001', name: 'Supino Reto com Barra', muscleGroup: 'Peito' },
  { id: 'ex020', name: 'Agachamento Livre com Barra', muscleGroup: 'Pernas' },
  { id: 'ex047', name: 'Tríceps Pulley com Barra', muscleGroup: 'Tríceps' },
  // Add more if needed for dropdowns, but primary source is DB
];

export const MOCK_WORKOUT_SHEETS_INITIAL_DATA: WorkoutSheet[] = [
    {
        id: 'ws1',
        name: 'Treino A - Hipertrofia Completo',
        goal: 'Hipertrofia',
        associatedStudentIds: ['s3'], 
        exercises: [
            { id: 'ex001', name: 'Supino Reto com Barra', muscleGroup: 'Peito', sets: '4', reps: '8-12', load: '70kg' },
            { id: 'ex047', name: 'Tríceps Pulley com Barra', muscleGroup: 'Tríceps', sets: '3', reps: '10-15', load: '25kg' },
            { id: 'ex020', name: 'Agachamento Livre com Barra', muscleGroup: 'Pernas', sets: '4', reps: '8-10', load: '80kg' },
        ]
    },
];

// Supabase specific constants
export const SUPABASE_AVATARS_BUCKET = 'avatars';
