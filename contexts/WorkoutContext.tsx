import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { WorkoutSheet, Exercise } from '../types';
import { supabase } from '../supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

interface WorkoutContextType {
  workoutSheets: WorkoutSheet[];
  addWorkoutSheet: (sheetData: Pick<WorkoutSheet, 'name' | 'goal' | 'exercises'>) => Promise<{success: boolean, error?: PostgrestError | Error | null}>;
  updateWorkoutSheet: (sheetData: WorkoutSheet) => Promise<{success: boolean, error?: PostgrestError | Error | null}>;
  deleteWorkoutSheet: (sheetId: string) => Promise<{success: boolean, error?: PostgrestError | null}>;
  getWorkoutSheetById: (sheetId: string) => WorkoutSheet | undefined;
  getWorkoutSheetsByStudentId: (studentId: string) => WorkoutSheet[];
  associateStudentsToSheet: (sheetId: string, studentIds: string[]) => Promise<{success: boolean, error?: PostgrestError | null}>;
  isLoading: boolean;
  fetchWorkoutSheets: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workoutSheets, setWorkoutSheets] = useState<WorkoutSheet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWorkoutSheets = useCallback(async () => {
    setIsLoading(true);
    const { data: sheetsData, error: sheetsError } = await supabase
      .from('workout_sheets')
      .select(`
        id,
        name,
        goal,
        created_at,
        updated_at,
        workout_sheet_exercises (
          exercise_id,
          sets,
          reps,
          load_details,
          observations,
          exercise_order,
          exercises (id, name, muscle_group) 
        ),
        student_workout_sheets (student_id)
      `);

    if (sheetsError) {
      console.error('Error fetching workout sheets:', sheetsError);
      setWorkoutSheets([]);
    } else if (sheetsData) {
      const formattedSheets = sheetsData.map((sheet: any) => ({
        id: sheet.id,
        name: sheet.name,
        goal: sheet.goal,
        created_at: sheet.created_at,
        updated_at: sheet.updated_at,
        exercises: sheet.workout_sheet_exercises
          .map((wse: any) => ({
            id: wse.exercises.id, // Actual exercise ID from the 'exercises' table
            name: wse.exercises.name,
            muscleGroup: wse.exercises.muscle_group,
            sets: wse.sets,
            reps: wse.reps,
            load: wse.load_details,
            observations: wse.observations,
            exercise_order: wse.exercise_order,
            workout_sheet_id: sheet.id, // For reference if needed
          }))
          .sort((a: Exercise, b: Exercise) => (a.exercise_order || 0) - (b.exercise_order || 0)),
        associatedStudentIds: sheet.student_workout_sheets.map((sws: any) => sws.student_id),
      }));
      setWorkoutSheets(formattedSheets.sort((a,b) => a.name.localeCompare(b.name)));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkoutSheets();
  }, [fetchWorkoutSheets]);

  const addWorkoutSheet = async (
    sheetData: Pick<WorkoutSheet, 'name' | 'goal' | 'exercises'>
  ): Promise<{success: boolean, error?: PostgrestError | Error | null}> => {
    setIsLoading(true);
    const { exercises, ...coreSheetData } = sheetData; // exercises is Exercise[], coreSheetData is {name, goal}

    const { data: insertedSheet, error: insertSheetError } = await supabase
      .from('workout_sheets')
      .insert(coreSheetData)
      .select()
      .single();

    if (insertSheetError || !insertedSheet) {
      console.error('Error inserting workout sheet:', insertSheetError);
      setIsLoading(false);
      return { success: false, error: insertSheetError || new Error("Failed to insert sheet and get ID")};
    }

    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises.map((ex, index) => ({
        workout_sheet_id: insertedSheet.id,
        exercise_id: ex.id, // ex is of type Exercise, so ex.id is available
        sets: ex.sets,
        reps: ex.reps,
        load_details: ex.load,
        observations: ex.observations,
        exercise_order: index,
      }));
      const { error: insertExercisesError } = await supabase
        .from('workout_sheet_exercises')
        .insert(exercisesToInsert);
      
      if (insertExercisesError) {
        console.error('Error inserting exercises for sheet:', insertExercisesError);
        // Potentially rollback sheet insertion or mark as incomplete
        // For now, just log and proceed
      }
    }
    setIsLoading(false);
    await fetchWorkoutSheets();
    return { success: true };
  };

  const updateWorkoutSheet = async (sheetData: WorkoutSheet): Promise<{success: boolean, error?: PostgrestError | Error | null}> => {
    setIsLoading(true);
    const { id, exercises, associatedStudentIds, ...sheetUpdateData } = sheetData;

    const { error: updateSheetError } = await supabase
      .from('workout_sheets')
      .update(sheetUpdateData)
      .eq('id', id);

    if (updateSheetError) {
      console.error('Error updating workout sheet:', updateSheetError);
      setIsLoading(false);
      return { success: false, error: updateSheetError };
    }

    // Update exercises: delete old ones, insert new ones
    const { error: deleteExercisesError } = await supabase
      .from('workout_sheet_exercises')
      .delete()
      .eq('workout_sheet_id', id);

    if (deleteExercisesError) {
      console.error('Error deleting old exercises for update:', deleteExercisesError);
      // Handle error, maybe don't proceed with inserting new ones
    }

    if (exercises && exercises.length > 0) {
      const exercisesToInsert = exercises.map((ex, index) => ({
        workout_sheet_id: id,
        exercise_id: ex.id, // This is the ID from the main 'exercises' table
        sets: ex.sets,
        reps: ex.reps,
        load_details: ex.load,
        observations: ex.observations,
        exercise_order: index,
      }));
      const { error: insertExercisesError } = await supabase
        .from('workout_sheet_exercises')
        .insert(exercisesToInsert);
      if (insertExercisesError) {
        console.error('Error inserting updated exercises:', insertExercisesError);
      }
    }
    // Student associations are handled by associateStudentsToSheet
    setIsLoading(false);
    await fetchWorkoutSheets();
    return { success: true };
  };
  
  const associateStudentsToSheet = async (sheetId: string, studentIds: string[]): Promise<{success: boolean, error?: PostgrestError | null}> => {
    setIsLoading(true);
    // Delete existing associations for this sheet
    const { error: deleteError } = await supabase
        .from('student_workout_sheets')
        .delete()
        .eq('workout_sheet_id', sheetId);

    if (deleteError) {
        console.error('Error deleting old student associations:', deleteError);
        setIsLoading(false);
        return { success: false, error: deleteError };
    }

    // Insert new associations if any studentIds are provided
    if (studentIds.length > 0) {
        const associationsToInsert = studentIds.map(studentId => ({
            workout_sheet_id: sheetId,
            student_id: studentId,
        }));
        const { error: insertError } = await supabase
            .from('student_workout_sheets')
            .insert(associationsToInsert);

        if (insertError) {
            console.error('Error inserting new student associations:', insertError);
            setIsLoading(false);
            return { success: false, error: insertError };
        }
    }
    setIsLoading(false);
    await fetchWorkoutSheets(); // Refresh to show updated associations
    return { success: true };
  };

  const deleteWorkoutSheet = async (sheetId: string): Promise<{success: boolean, error?: PostgrestError | null}> => {
    setIsLoading(true);
    // Deleting from 'workout_sheets' should cascade delete related 'workout_sheet_exercises'
    // and 'student_workout_sheets' due to ON DELETE CASCADE in DB schema.
    const { error } = await supabase.from('workout_sheets').delete().eq('id', sheetId);
    setIsLoading(false);
    if (error) {
      console.error('Error deleting workout sheet:', error);
      return {success: false, error };
    }
    await fetchWorkoutSheets();
    return { success: true };
  };

  const getWorkoutSheetById = useCallback((sheetId: string): WorkoutSheet | undefined => {
    return workoutSheets.find(s => s.id === sheetId);
  }, [workoutSheets]);
  
  const getWorkoutSheetsByStudentId = useCallback((studentId: string): WorkoutSheet[] => {
    return workoutSheets.filter(sheet => sheet.associatedStudentIds?.includes(studentId));
  }, [workoutSheets]);

  return (
    <WorkoutContext.Provider value={{ 
        workoutSheets, 
        addWorkoutSheet, 
        updateWorkoutSheet, 
        deleteWorkoutSheet, 
        getWorkoutSheetById, 
        getWorkoutSheetsByStudentId,
        associateStudentsToSheet, 
        isLoading,
        fetchWorkoutSheets
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};