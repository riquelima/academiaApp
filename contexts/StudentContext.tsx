
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Student, PaymentStatus } from '../types';
import { supabase, getStoragePublicUrl } from '../supabaseClient';
import { AVAILABLE_PLANS, DEFAULT_STUDENT_PHOTO, SUPABASE_AVATARS_BUCKET } from '../constants';
import { PostgrestError, AuthError } from '@supabase/supabase-js';

interface StudentContextType {
  students: Student[];
  addStudent: (studentData: Partial<Omit<Student, 'id' | 'paymentStatus' | 'planExpiryDate' | 'photoUrl'>> & { email: string; password?: string; photoFile?: File | null }) => Promise<{ success: boolean, error?: PostgrestError | AuthError | Error | null}>;
  updateStudent: (studentData: Partial<Student> & { photoFile?: File | null }) => Promise<{ success: boolean, error?: PostgrestError | Error | null}>;
  deleteStudent: (studentId: string) => Promise<{ success: boolean, error?: PostgrestError | Error | null}>;
  getStudentById: (studentId: string) => Student | undefined;
  isLoading: boolean;
  fetchStudents: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        cpf,
        phone,
        birth_date,
        current_plan_id,
        plan_expiry_date,
        payment_status,
        observations,
        created_at,
        updated_at,
        profiles (
          full_name,
          avatar_url
        )
      `);

    if (error) {
      console.error('Error fetching students:', error.message || JSON.stringify(error));
      setStudents([]);
    } else if (data) {
      const formattedStudents = data.map((s: any) => ({
        id: s.id,
        name: s.profiles?.full_name || 'Nome não encontrado',
        photoUrl: s.profiles?.avatar_url ? getStoragePublicUrl(SUPABASE_AVATARS_BUCKET, s.profiles.avatar_url) : DEFAULT_STUDENT_PHOTO(s.id),
        cpf: s.cpf,
        phone: s.phone,
        birthDate: s.birth_date,
        currentPlanId: s.current_plan_id,
        planExpiryDate: s.plan_expiry_date,
        paymentStatus: s.payment_status as PaymentStatus,
        observations: s.observations,
        created_at: s.created_at,
        updated_at: s.updated_at,
      }));
      setStudents(formattedStudents.sort((a,b) => a.name.localeCompare(b.name)));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const addStudent = async (
    studentData: Partial<Omit<Student, 'id' | 'paymentStatus' | 'planExpiryDate' | 'photoUrl'>> & { email: string; password?: string; photoFile?: File | null }
  ): Promise<{ success: boolean, error?: PostgrestError | AuthError | Error | null}> => {
    if (!studentData.email || !studentData.password) {
        return { success: false, error: new Error("Email e senha são obrigatórios para criar um novo aluno/usuário.") };
    }
    if (!studentData.name) {
      return { success: false, error: new Error("Nome do aluno é obrigatório.") };
    }

    setIsLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.password,
    });

    if (authError) {
        if (authError.message && (
            authError.message.toLowerCase().includes("user already registered") || 
            authError.message.toLowerCase().includes("user already exists") || 
            authError.message.toLowerCase().includes("already been registered")
          )) {
            setIsLoading(false);
            return { success: false, error: new Error("Este email já está cadastrado no sistema. Não é possível adicionar um novo aluno com este email.") };
        }
        console.error('Error signing up user:', authError.message || JSON.stringify(authError));
        setIsLoading(false);
        return { success: false, error: authError };
    }
    
    if (!authData.user) {
        console.error('Error signing up user: No user data returned despite no authError.');
        setIsLoading(false);
        return { success: false, error: new Error("Falha ao criar usuário no Supabase Auth: dados do usuário não retornados.") };
    }

    const userId = authData.user.id;

    // Fetch the role_id for 'student'
    const { data: studentRole, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_name', 'student')
      .single();

    if (roleError || !studentRole) {
      console.error('Error fetching student role_id:', roleError?.message || 'Student role not found.');
      setIsLoading(false);
      return { success: false, error: roleError || new Error('Não foi possível encontrar o "role_id" para "student". Verifique a configuração de roles no banco de dados.') };
    }
    const studentRoleId = studentRole.id;

    let avatarStoragePath: string | undefined = undefined;
    if (studentData.photoFile) {
      const fileExt = studentData.photoFile.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`; 
      avatarStoragePath = `public/${fileName}`; 

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_AVATARS_BUCKET)
        .upload(avatarStoragePath, studentData.photoFile, { upsert: true });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError.message || JSON.stringify(uploadError));
      }
    }
    
    const { data: upsertedProfile, error: profileUpsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: studentData.name, 
        avatar_url: avatarStoragePath || null, 
        role_id: studentRoleId, 
      })
      .select('id') 
      .single();

    if (profileUpsertError || !upsertedProfile) {
      if (profileUpsertError) {
        console.error(
            `Error upserting profile. Message: ${profileUpsertError.message}, Code: ${profileUpsertError.code}, Details: ${profileUpsertError.details}, Hint: ${profileUpsertError.hint}`
        );
      } else {
        console.error(
            'Error upserting profile: No profile data was returned from upsert, and no specific error object was provided.'
        );
      }
      setIsLoading(false);
      return { success: false, error: profileUpsertError || new Error('Falha ao criar/atualizar o perfil do usuário. Nenhum dado de perfil retornado.') };
    }

    const selectedPlanInfo = AVAILABLE_PLANS.find(p => p.id === (studentData.currentPlanId || AVAILABLE_PLANS[0]?.id));
    const planDurationDays = selectedPlanInfo?.durationDays || 30; // Default to 30 if plan not found or not specified
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planDurationDays);

    const planIdToInsert = studentData.currentPlanId || AVAILABLE_PLANS[0]?.id;
    console.log('[StudentContext] Attempting to insert student with current_plan_id:', planIdToInsert);

    if (!planIdToInsert || !AVAILABLE_PLANS.some(p => p.id === planIdToInsert)) {
        console.error('[StudentContext] Invalid current_plan_id derived or AVAILABLE_PLANS misconfiguration. Plan ID to insert was:', planIdToInsert);
        setIsLoading(false);
        return { success: false, error: new Error("ID do plano inválido ou não encontrado na configuração local. Verifique AVAILABLE_PLANS em constants.ts e o plano selecionado.") };
    }

    const { error: studentInsertError } = await supabase
      .from('students')
      .insert([{
        id: userId, 
        cpf: studentData.cpf || '',
        phone: studentData.phone || '',
        birth_date: studentData.birthDate || new Date().toISOString().split('T')[0],
        current_plan_id: planIdToInsert,
        observations: studentData.observations,
        payment_status: PaymentStatus.PAID, 
        plan_expiry_date: expiryDate.toISOString(),
      }]);
    
    if (studentInsertError) {
      console.error('Error inserting student:', studentInsertError.message || JSON.stringify(studentInsertError));
      setIsLoading(false);
      return { success: false, error: studentInsertError };
    }
    
    await fetchStudents();
    setIsLoading(false);
    return { success: true };
  };

  const updateStudent = async (
    studentData: Partial<Student> & { photoFile?: File | null }
  ): Promise<{ success: boolean, error?: PostgrestError | Error | null}> => {
    if (!studentData.id) {
      return { success: false, error: new Error("Student ID is required for update.") };
    }
    setIsLoading(true);
    const { id, photoFile, ...studentUpdates } = studentData;

    let newAvatarStoragePath: string | undefined = undefined;
    if (photoFile) {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${id}.${fileExt}`;
      newAvatarStoragePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(SUPABASE_AVATARS_BUCKET)
        .upload(newAvatarStoragePath, photoFile, { upsert: true });

      if (uploadError) {
        console.error('Error uploading photo for update:', uploadError);
      }
    }

    const profileDataToUpdate: { full_name?: string; avatar_url?: string } = {};
    if (studentUpdates.name) profileDataToUpdate.full_name = studentUpdates.name;
    if (newAvatarStoragePath) {
      profileDataToUpdate.avatar_url = newAvatarStoragePath;
    } else if (studentUpdates.photoUrl === null) { 
      profileDataToUpdate.avatar_url = null;
    }


    if (Object.keys(profileDataToUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileDataToUpdate)
        .eq('id', id);
      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
    }

    const studentTableUpdates: any = {};
    if (studentUpdates.cpf) studentTableUpdates.cpf = studentUpdates.cpf;
    if (studentUpdates.phone) studentTableUpdates.phone = studentUpdates.phone;
    if (studentUpdates.birthDate) studentTableUpdates.birth_date = studentUpdates.birthDate;
    if (studentUpdates.observations) studentTableUpdates.observations = studentUpdates.observations;
    if (studentUpdates.paymentStatus) studentTableUpdates.payment_status = studentUpdates.paymentStatus;
    
    if (studentUpdates.currentPlanId) {
      studentTableUpdates.current_plan_id = studentUpdates.currentPlanId;
      const currentStudent = students.find(s => s.id === id); 
      if (currentStudent && currentStudent.currentPlanId !== studentUpdates.currentPlanId) {
        const selectedPlan = AVAILABLE_PLANS.find(p => p.id === studentUpdates.currentPlanId);
        const planDurationDays = selectedPlan?.durationDays || 30;
        const expiryDate = new Date(); 
        expiryDate.setDate(expiryDate.getDate() + planDurationDays);
        studentTableUpdates.plan_expiry_date = expiryDate.toISOString();
      }
    } else if (studentUpdates.planExpiryDate) { 
        studentTableUpdates.plan_expiry_date = studentUpdates.planExpiryDate;
    }


    if (Object.keys(studentTableUpdates).length > 0) {
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update(studentTableUpdates)
        .eq('id', id);

      if (studentUpdateError) {
        console.error('Error updating student table:', studentUpdateError);
        setIsLoading(false);
        return { success: false, error: studentUpdateError };
      }
    }
    
    await fetchStudents(); 
    setIsLoading(false);
    return { success: true };
  };

  const deleteStudent = async (studentId: string): Promise<{ success: boolean, error?: PostgrestError | Error | null}> => {
    setIsLoading(true);

    const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', studentId).single();
    if (profile?.avatar_url) {
      const avatarPathToRemove = profile.avatar_url.startsWith('public/') ? profile.avatar_url.substring('public/'.length) : profile.avatar_url;
      if (avatarPathToRemove) { 
        const { error: storageError } = await supabase.storage.from(SUPABASE_AVATARS_BUCKET).remove([avatarPathToRemove]);
        if (storageError) console.error('Error deleting avatar from storage:', storageError.message);
      }
    }

    const { error: assocDeleteError } = await supabase.from('student_workout_sheets').delete().eq('student_id', studentId);
    if (assocDeleteError) console.warn('Error deleting student workout associations:', assocDeleteError.message);

    const { error: studentDeleteError } = await supabase.from('students').delete().eq('id', studentId);
    if (studentDeleteError) {
      console.error('Error deleting student record:', studentDeleteError.message);
      setIsLoading(false);
      return { success: false, error: studentDeleteError };
    }

    const { error: profileDeleteError } = await supabase.from('profiles').delete().eq('id', studentId);
    if (profileDeleteError) {
      console.error('Error deleting profile record:', profileDeleteError.message);
    }
    
    await fetchStudents();
    setIsLoading(false);
    return { success: true };
  };

  const getStudentById = useCallback((studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
  }, [students]);

  return (
    <StudentContext.Provider value={{ 
        students, 
        addStudent, 
        updateStudent, 
        deleteStudent, 
        getStudentById, 
        isLoading, 
        fetchStudents 
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
