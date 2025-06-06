
import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { PlusIcon, SparklesIcon, TrashIcon, PencilIcon, UsersIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { WorkoutSheet } from '../types'; 
import AddWorkoutSheetModal from '../components/workouts/AddWorkoutSheetModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import AssociateStudentsModal from '../components/workouts/AssociateStudentsModal';
import { useStudent } from '../contexts/StudentContext'; 
import { useWorkout } from '../contexts/WorkoutContext'; // Import useWorkout

// MOCK_WORKOUT_SHEETS foi movido para constants.ts e será gerenciado pelo WorkoutContext

const WorkoutsPage: React.FC = () => {
  const { students: allStudentsFromContext, isLoading: studentsLoading } = useStudent();
  const { 
    workoutSheets, 
    addWorkoutSheet, 
    updateWorkoutSheet, 
    deleteWorkoutSheet, 
    isLoading: workoutsLoading 
  } = useWorkout();

  const [showWorkoutSheetModal, setShowWorkoutSheetModal] = useState(false);
  const [editingWorkoutSheet, setEditingWorkoutSheet] = useState<WorkoutSheet | null>(null);
  const [sheetToDelete, setSheetToDelete] = useState<WorkoutSheet | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [currentSheetForAssociation, setCurrentSheetForAssociation] = useState<WorkoutSheet | null>(null);

  const handleSaveWorkoutSheet = (sheetData: WorkoutSheet) => { // sheetData from modal already includes ID if editing
    if (editingWorkoutSheet) {
      updateWorkoutSheet(sheetData); // Context handles update
    } else {
      // For addWorkoutSheet, context handles ID generation and default associatedStudentIds
      const { id, associatedStudentIds, ...newSheetData } = sheetData;
      addWorkoutSheet(newSheetData);
    }
    setShowWorkoutSheetModal(false);
    setEditingWorkoutSheet(null);
  };

  const handleOpenAddModal = () => {
    setEditingWorkoutSheet(null);
    setShowWorkoutSheetModal(true);
  };

  const handleOpenEditModal = (sheet: WorkoutSheet) => {
    setEditingWorkoutSheet(sheet);
    setShowWorkoutSheetModal(true);
  };
  
  const handleOpenDeleteConfirm = (sheet: WorkoutSheet) => {
    setSheetToDelete(sheet);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (sheetToDelete) {
      deleteWorkoutSheet(sheetToDelete.id); // Use context delete function
    }
    setShowDeleteConfirmModal(false);
    setSheetToDelete(null);
  };

  const handleOpenAssociateModal = (sheet: WorkoutSheet) => {
    setCurrentSheetForAssociation(sheet);
    setShowAssociateModal(true);
  };

  const handleSaveAssociations = (sheetId: string, studentIds: string[]) => {
    const sheetToUpdate = workoutSheets.find(s => s.id === sheetId);
    if (sheetToUpdate) {
      updateWorkoutSheet({ ...sheetToUpdate, associatedStudentIds: studentIds }); // Use context update
    }
    setShowAssociateModal(false);
    setCurrentSheetForAssociation(null);
  };

  if (studentsLoading || workoutsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-300 text-lg">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center">
          <SparklesIcon className="h-8 w-8 mr-3 text-primary-purple" />
          Gerenciamento de Treinos
        </h1>
        <Button 
          onClick={handleOpenAddModal}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Novo Treino
        </Button>
      </div>

      <Card title="Treinos Cadastrados">
        {workoutSheets.length === 0 ? (
          <p className="text-slate-400 p-4 text-center">Nenhum treino cadastrado ainda. Clique em "Novo Treino" para começar.</p>
        ) : (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workoutSheets.map(sheet => (
              <Card key={sheet.id} className="bg-slate-700/70 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-purple truncate" title={sheet.name}>{sheet.name}</h3>
                  <p className="text-sm text-slate-300 mt-1 flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1.5 text-slate-400" /> Alunos Associados: {sheet.associatedStudentIds?.length || 0}
                  </p>
                  {sheet.goal && (
                    <p className="text-sm text-slate-300 mt-1 flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-1.5 text-slate-400" /> Objetivo: {sheet.goal}
                    </p>
                  )}
                  <p className="text-sm text-slate-300 mt-1 flex items-center">
                    <ListBulletIcon className="h-4 w-4 mr-1.5 text-slate-400" /> Total de Exercícios: {sheet.exercises.length}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-600">
                    <h4 className="text-xs font-semibold text-slate-400 mb-1">Exemplo de Exercício:</h4>
                    {sheet.exercises[0] ? (
                        <p className="text-xs text-slate-300 truncate" title={sheet.exercises[0].name}>
                            - {sheet.exercises[0].name} ({sheet.exercises[0].sets}x{sheet.exercises[0].reps})
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500">Nenhum exercício cadastrado.</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2 pt-2 border-t border-slate-600">
                  <Button size="sm" variant="ghost" onClick={() => handleOpenEditModal(sheet)} title="Editar Treino">
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleOpenDeleteConfirm(sheet)} 
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    title="Excluir Treino"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => handleOpenAssociateModal(sheet)}
                    title="Associar Alunos"
                  >
                    Associar Alunos
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {showWorkoutSheetModal && (
        <AddWorkoutSheetModal
          isOpen={showWorkoutSheetModal}
          onClose={() => { setShowWorkoutSheetModal(false); setEditingWorkoutSheet(null); }}
          onSave={handleSaveWorkoutSheet}
          initialData={editingWorkoutSheet}
        />
      )}
      
      {showDeleteConfirmModal && sheetToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão do Treino"
          message={`Tem certeza de que deseja excluir o treino "${sheetToDelete.name}"? Esta ação não poderá ser desfeita.`}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          confirmButtonVariant="danger"
        />
      )}

      {showAssociateModal && currentSheetForAssociation && (
        <AssociateStudentsModal
          isOpen={showAssociateModal}
          onClose={() => { setShowAssociateModal(false); setCurrentSheetForAssociation(null); }}
          onSave={handleSaveAssociations}
          students={allStudentsFromContext} 
          workoutSheet={currentSheetForAssociation}
        />
      )}
    </div>
  );
};

export default WorkoutsPage;