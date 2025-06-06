

export interface User {
  id: string; // from supabase.auth.user.id
  email: string | undefined; // from supabase.auth.user.email
  name?: string; // from profiles.full_name
  avatar_url?: string; // from profiles.avatar_url (Supabase Storage)
  role_name?: 'admin' | 'student' | string; // from profiles joined with user_roles
}

export enum PlanTier {
  MONTHLY = "Mensal",
  QUARTERLY = "Trimestral",
  ANNUAL = "Anual",
}

export interface Plan {
  id: string; // Corresponds to plans.id (TEXT)
  name: PlanTier | string; // Corresponds to plans.name
  price: number;
  duration_days: number; 
  created_at?: string;
  updated_at?: string;
}

export enum PaymentStatus {
  PAID = "Em dia",
  DUE = "Vencido",
  WARNING = "Aviso de Renovação",
}

export interface Student {
  id: string; // Corresponds to students.id (UUID, same as profiles.id and auth.users.id)
  name: string; // This will come from profiles.full_name after join
  email?: string; // For signup flow, not stored in students table
  password?: string; // For signup flow, not stored in students table
  cpf: string;
  phone: string;
  birthDate: string; // ISO string
  currentPlanId?: string; // FK to plans.id
  planExpiryDate?: string; // ISO string
  paymentStatus: PaymentStatus;
  observations?: string;
  photoUrl?: string; // This will be profiles.avatar_url after join
  // Supabase timestamps
  created_at?: string;
  updated_at?: string;
  // Optional fields from original mock, not in DB schema yet but can be added if needed
  weightHistory?: { date: string; weight: number; imc?: number }[];
  attendance?: { date: string; present: boolean }[];
}

export interface Exercise {
  id: string; // Corresponds to exercises.id (TEXT)
  name: string;
  muscleGroup: string; // muscle_group in DB
  sets?: string;
  reps: string;
  load?: string; // load_details in DB
  observations?: string;
  // Supabase timestamps
  created_at?: string;
  updated_at?: string;
  // For workout_sheet_exercises
  exercise_order?: number;
  workout_sheet_id?: string; // when part of a workout sheet context
}

export interface WorkoutSheet {
  id: string; // Corresponds to workout_sheets.id (UUID)
  name: string;
  goal?: string;
  exercises: Exercise[]; // These will be fetched from workout_sheet_exercises
  associatedStudentIds?: string[]; // Managed via student_workout_sheets table
  // Supabase timestamps
  created_at?: string;
  updated_at?: string;

  // studentId and studentName are not direct fields in workout_sheets table
  // They are for local UI convenience if needed, but data comes from associatedStudentIds
  studentId?: string; 
  studentName?: string; 
}

export interface GymClass {
  id: string; // Corresponds to gym_classes.id (UUID)
  name: string;
  description?: string;
  instructor_id?: string; // FK to profiles.id
  instructor_name?: string; // For display, after join
  class_datetime: string; // ISO string
  duration_minutes: number;
  max_capacity: number;
  enrolledStudentIds?: string[]; // Managed via class_enrollments table
  // Supabase timestamps
  created_at?: string;
  updated_at?: string;
}


export interface StatCardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string; 
}

// ChatMessage is no longer needed as Chatbot was removed.
// If you re-add Chatbot, uncomment this:
/*
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
  metadata?: Record<string, any>; 
}
*/
