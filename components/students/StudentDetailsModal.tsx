
import React, { useEffect, useState } from 'react';
import { Student, WorkoutSheet, PlanTier, PaymentStatus } from '../../types'; // Added PaymentStatus
import Card from '../common/Card';
import Button from '../common/Button';
import { DEFAULT_STUDENT_PHOTO, AVAILABLE_PLANS } from '../../constants';
import { useWorkout } from '../../contexts/WorkoutContext'; // Import useWorkout
import { IdentificationIcon, PhoneIcon, CakeIcon, CalendarDaysIcon, DocumentTextIcon, UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const getPlanName = (planId?: string): string => {
  if (!planId) return 'N/A';
  const plan = AVAILABLE_PLANS.find(p => p.id === planId);
  return plan ? plan.name : 'Desconhecido';
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // UTC to avoid timezone shifts from ISO string
  } catch (e) {
    return 'Data inválida';
  }
};

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ isOpen, onClose, student }) => {
  const { workoutSheets, isLoading: workoutsLoading } = useWorkout();
  const [associatedWorkouts, setAssociatedWorkouts] = useState<WorkoutSheet[]>([]);

  useEffect(() => {
    if (student && !workoutsLoading) {
      const filteredWorkouts = workoutSheets.filter(sheet => 
        sheet.associatedStudentIds?.includes(student.id)
      );
      setAssociatedWorkouts(filteredWorkouts);
    } else {
      setAssociatedWorkouts([]);
    }
  }, [student, workoutSheets, workoutsLoading]);

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <Card 
        title={`Detalhes de ${student.name}`}
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-800 shadow-2xl"
      >
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Student Info Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img 
              src={student.photoUrl || DEFAULT_STUDENT_PHOTO(student.id)} 
              alt={student.name}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover ring-2 ring-primary-purple"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-primary-purple">{student.name}</h2>
              <p className="text-sm text-slate-400">ID do Aluno: {student.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-2">Informações Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p className="flex items-center"><IdentificationIcon className="h-5 w-5 mr-2 text-slate-400" /> <strong className="text-slate-300 mr-1">CPF:</strong> {student.cpf}</p>
              <p className="flex items-center"><PhoneIcon className="h-5 w-5 mr-2 text-slate-400" /> <strong className="text-slate-300 mr-1">Telefone:</strong> {student.phone}</p>
              <p className="flex items-center"><CakeIcon className="h-5 w-5 mr-2 text-slate-400" /> <strong className="text-slate-300 mr-1">Nascimento:</strong> {formatDate(student.birthDate)}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-2">Plano e Pagamento</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p className="flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-slate-400" /> <strong className="text-slate-300 mr-1">Plano:</strong> {getPlanName(student.currentPlanId)}</p>
                <p className="flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-slate-400" /> <strong className="text-slate-300 mr-1">Expira em:</strong> {formatDate(student.planExpiryDate)}</p>
                <p className="flex items-center col-span-full"><SparklesIcon className="h-5 w-5 mr-2 text-slate-400" /> <strong className="text-slate-300 mr-1">Status:</strong> <span className={`font-semibold ${student.paymentStatus === PaymentStatus.PAID ? 'text-green-400' : student.paymentStatus === PaymentStatus.WARNING ? 'text-yellow-400' : 'text-red-400'}`}>{student.paymentStatus}</span></p>
            </div>
          </div>

          {student.observations && (
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-2">Observações</h3>
              <p className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-md whitespace-pre-wrap flex items-start">
                <DocumentTextIcon className="h-5 w-5 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                {student.observations}
              </p>
            </div>
          )}

          {/* Associated Workouts Section */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-2">Treinos Associados</h3>
            {workoutsLoading ? (
              <p className="text-slate-400">Carregando treinos...</p>
            ) : associatedWorkouts.length > 0 ? (
              <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {associatedWorkouts.map(sheet => (
                  <li key={sheet.id} className="text-sm text-slate-300 bg-slate-700/50 p-2.5 rounded-md flex items-center">
                    <SparklesIcon className="h-4 w-4 mr-2 text-primary-purple flex-shrink-0" />
                    {sheet.name} <em className="ml-1 text-xs text-slate-400">({sheet.goal})</em>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Nenhum treino associado a este aluno.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-slate-700 bg-slate-800/80 mt-auto">
          <Button variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentDetailsModal;
