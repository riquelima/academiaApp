
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { WorkoutSheet, Exercise as ExerciseType } from '../../types';
import { WORKOUT_GOALS, EXERCISE_LIST, MUSCLE_GROUPS } from '../../constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { PlusIcon, TrashIcon, SparklesIcon, TagIcon } from '@heroicons/react/24/outline';

interface AddWorkoutSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sheet: WorkoutSheet) => void;
  initialData?: WorkoutSheet | null;
}

const AddWorkoutSheetModal: React.FC<AddWorkoutSheetModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [sheetName, setSheetName] = useState('');
  const [goal, setGoal] = useState<string>(WORKOUT_GOALS[0] || '');
  const [exercises, setExercises] = useState<ExerciseType[]>([]);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing && initialData) {
      setSheetName(initialData.name);
      setGoal(initialData.goal || WORKOUT_GOALS[0] || '');
      setExercises(initialData.exercises.map(ex => ({...ex})));
    } else {
      setSheetName('');
      setGoal(WORKOUT_GOALS[0] || '');
      setExercises([]);
    }
  }, [isOpen, initialData, isEditing]);

  const handleAddExercise = () => {
    const defaultExercise = EXERCISE_LIST[0];
    if (!defaultExercise) {
        alert("Lista de exercícios não carregada.");
        return;
    }
    const newExercise: ExerciseType = {
      id: defaultExercise.id,
      name: defaultExercise.name,
      muscleGroup: defaultExercise.muscleGroup,
      sets: '3',
      reps: '10-12',
      load: '',
      observations: ''
    };
    setExercises(prevExercises => [...prevExercises, newExercise]);
  };

  const handleRemoveExercise = (exerciseIndex: number) => {
    setExercises(prevExercises => prevExercises.filter((_, index) => index !== exerciseIndex));
  };

  const handleExerciseChange = (exerciseIndex: number, field: keyof ExerciseType, value: string) => {
    const updatedExercises = [...exercises];
    const exerciseToUpdate = updatedExercises[exerciseIndex];
    
    if (field === 'id') { 
      const selectedExerciseFromList = EXERCISE_LIST.find(ex => ex.id === value);
      if (selectedExerciseFromList) {
        exerciseToUpdate.id = selectedExerciseFromList.id;
        exerciseToUpdate.name = selectedExerciseFromList.name;
        exerciseToUpdate.muscleGroup = selectedExerciseFromList.muscleGroup;
      }
    } else {
      (exerciseToUpdate[field] as any) = value;
    }
    setExercises(updatedExercises);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sheetName.trim()) {
        alert("O nome do treino é obrigatório.");
        return;
    }
    if (exercises.length === 0) {
        alert("O treino deve ter pelo menos um exercício.");
        return;
    }

    const sheetToSave: WorkoutSheet = {
      id: initialData?.id || `ws_temp_${Date.now()}`,
      name: sheetName,
      goal: goal,
      exercises: exercises,
      associatedStudentIds: initialData?.associatedStudentIds || [] // Preserva IDs associados se editando
    };
    onSave(sheetToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <Card title={isEditing ? "Editar Treino" : "Novo Treino"} className="w-full max-w-xl max-h-[95vh] flex flex-col bg-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
          <Input
            label="Nome do Treino"
            name="sheetName"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            required
            placeholder="Ex: Treino Hipertrofia Completo"
            icon={<TagIcon />}
          />
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-1">Objetivo do Treino</label>
             <div className="relative">
              <SparklesIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="goal"
                name="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 bg-slate-700 text-slate-100 focus:ring-primary-purple focus:border-primary-purple rounded-lg text-sm"
              >
                {WORKOUT_GOALS.map(g => (<option key={g} value={g}>{g}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-3">Exercícios do Treino</h3>
            
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {exercises.length === 0 && (
                <p className="text-slate-400 text-center py-4">Nenhum exercício adicionado ainda.</p>
              )}
              {exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="p-4 bg-slate-700/50 rounded-lg space-y-3 relative"> {/* Adicionado 'relative' aqui */}
                   <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveExercise(exIndex)} 
                      className="absolute top-2 right-2 text-red-400 hover:bg-red-500/20 !p-1 z-10" // z-10 para garantir que fique por cima
                      title="Remover Exercício"
                    >
                      <TrashIcon className="h-4 w-4"/>
                   </Button>
                  
                  <select
                    name={`exerciseId-${exIndex}`}
                    value={exercise.id}
                    onChange={(e) => handleExerciseChange(exIndex, 'id', e.target.value)}
                    className="block w-full mb-1 py-2 px-3 border border-slate-500 bg-slate-600 text-slate-100 focus:ring-primary-purple focus:border-primary-purple rounded-md text-sm"
                  >
                    <option value="" disabled>Selecione um exercício</option>
                    {MUSCLE_GROUPS.map(group => (
                      <optgroup label={group} key={group}>
                        {EXERCISE_LIST.filter(ex => ex.muscleGroup === group).map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Séries" name={`sets-${exIndex}`} value={exercise.sets || ''} onChange={(e) => handleExerciseChange(exIndex, 'sets', e.target.value)} placeholder="Ex: 3-4" />
                    <Input label="Repetições" name={`reps-${exIndex}`} value={exercise.reps} onChange={(e) => handleExerciseChange(exIndex, 'reps', e.target.value)} placeholder="Ex: 8-12" />
                  </div>
                  <Input label="Carga" name={`load-${exIndex}`} value={exercise.load || ''} onChange={(e) => handleExerciseChange(exIndex, 'load', e.target.value)} placeholder="Ex: 20kg ou Corporal" />
                  <textarea
                    name={`observations-${exIndex}`}
                    value={exercise.observations || ''}
                    onChange={(e) => handleExerciseChange(exIndex, 'observations', e.target.value)}
                    placeholder="Observações (opcional)"
                    rows={2}
                    className="block w-full mt-1 p-2 border border-slate-500 bg-slate-600 text-slate-100 focus:ring-primary-purple focus:border-primary-purple rounded-md text-sm resize-none"
                  />
                </div>
              ))}
            </div>
            
            <Button type="button" variant="secondary" onClick={handleAddExercise} leftIcon={<PlusIcon className="h-4 w-4" />}>
              Adicionar Exercício ao Treino
            </Button>
          </div>

          <div className="flex justify-end space-x-3 pt-5 border-t border-slate-700 mt-auto">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? "Salvar Alterações" : "Salvar Treino"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddWorkoutSheetModal;
