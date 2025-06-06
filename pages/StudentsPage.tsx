
import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Student, PaymentStatus, PlanTier } from '../types';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Input from '../components/common/Input';
import { DEFAULT_STUDENT_PHOTO, AVAILABLE_PLANS } from '../constants';
import AddStudentModal from '../components/students/AddStudentModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import StudentDetailsModal from '../components/students/StudentDetailsModal'; // Import StudentDetailsModal
import { useStudent } from '../contexts/StudentContext';

const getPaymentStatusClass = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID: return 'bg-green-500/20 text-green-400';
    case PaymentStatus.WARNING: return 'bg-yellow-500/20 text-yellow-400';
    case PaymentStatus.DUE: return 'bg-red-500/20 text-red-400';
    default: return 'bg-slate-500/20 text-slate-400';
  }
};

const getPlanNameById = (planId?: string): PlanTier | string => {
  if (!planId) return 'N/A';
  const plan = AVAILABLE_PLANS.find(p => p.id === planId);
  return plan ? plan.name : 'Desconhecido';
}

const StudentsPage: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, isLoading: studentsLoading } = useStudent();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false); 
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<Student | null>(null); 

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.cpf && student.cpf.includes(searchTerm))
  );
  
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setShowStudentModal(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setShowStudentModal(true);
  };

  const handleOpenDeleteConfirm = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      const result = await deleteStudent(studentToDelete.id);
      if (!result.success && result.error) {
        alert(`Falha ao excluir aluno: ${result.error.message}`);
      }
    }
    setShowDeleteConfirmModal(false);
    setStudentToDelete(null);
  };
  
  const handleSaveStudent = async (studentData: Partial<Student> & { email?: string; password?: string; photoFile?: File | null }) => {
    let result: { success: boolean; error?: any } | undefined;

    if (editingStudent) { 
      result = await updateStudent({ ...studentData, id: editingStudent.id }); 
    } else { 
      if (!studentData.email) {
          alert("Erro: Email é obrigatório para novos alunos.");
          return;
      }
      const { 
        id, paymentStatus, planExpiryDate, photoUrl, 
        email, password, photoFile,                 
        ...otherStudentProps                      
      } = studentData;

      const payloadForAdd: Partial<Omit<Student, 'id' | 'paymentStatus' | 'planExpiryDate' | 'photoUrl'>> & { email: string; password?: string; photoFile?: File | null } = {
          ...otherStudentProps, 
          email: email as string, 
          password: password,
          photoFile: photoFile
      };
      result = await addStudent(payloadForAdd);
    }

    if (result && result.success) {
      setShowStudentModal(false);
      setEditingStudent(null);
    } else if (result && result.error) {
      alert(`Falha ao salvar aluno: ${result.error.message}`);
      // Optionally, do not close the modal on error, or handle error display within the modal.
      // For now, the modal will close before the alert.
    } else {
        alert("Ocorreu um erro desconhecido ao salvar o aluno.");
    }
  };

  const handleOpenDetailsModal = (student: Student) => {
    setSelectedStudentForDetails(student);
    setShowDetailsModal(true);
  };


  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-300 text-lg">Carregando alunos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Gerenciamento de Alunos</h1>
        <Button 
          onClick={handleOpenAddModal}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Novo Aluno
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-700">
          <Input 
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon />}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Foto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">CPF</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Telefone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status Pag.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card-dark divide-y divide-slate-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-700/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl || DEFAULT_STUDENT_PHOTO(student.id)} alt={student.name} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div 
                      className="text-sm font-medium text-primary-purple hover:underline cursor-pointer"
                      onClick={() => handleOpenDetailsModal(student)} 
                      title="Ver detalhes do aluno"
                    >
                      {student.name}
                    </div>
                    <div className="text-xs text-slate-400">{getPlanNameById(student.currentPlanId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.cpf}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{student.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusClass(student.paymentStatus)}`}>
                      {student.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenEditModal(student)}
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenDeleteConfirm(student)}
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        title="Excluir"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 && (
          <p className="text-center py-8 text-slate-400">Nenhum aluno encontrado.</p>
        )}
      </Card>
      
      {showStudentModal && (
        <AddStudentModal 
          isOpen={showStudentModal}
          onClose={() => { setShowStudentModal(false); setEditingStudent(null);}}
          onSave={handleSaveStudent}
          initialData={editingStudent}
        />
      )}

      {showDeleteConfirmModal && studentToDelete && (
        <ConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza de que deseja excluir o aluno ${studentToDelete.name}? Esta ação não poderá ser desfeita.`}
          confirmButtonText="Excluir"
          cancelButtonText="Cancelar"
          confirmButtonVariant="danger"
        />
      )}

      {showDetailsModal && selectedStudentForDetails && ( 
        <StudentDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {setShowDetailsModal(false); setSelectedStudentForDetails(null);}}
          student={selectedStudentForDetails}
        />
      )}
    </div>
  );
};

export default StudentsPage;
