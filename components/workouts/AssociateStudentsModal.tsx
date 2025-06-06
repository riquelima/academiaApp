
import React, { useState, useEffect, ChangeEvent } from 'react';
import { WorkoutSheet, Student } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { DEFAULT_STUDENT_PHOTO } from '../../constants';

interface AssociateStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workoutSheetId: string, associatedStudentIds: string[]) => void;
  students: Student[];
  workoutSheet: WorkoutSheet;
}

const AssociateStudentsModal: React.FC<AssociateStudentsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  students,
  workoutSheet,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (workoutSheet && workoutSheet.associatedStudentIds) {
      setSelectedStudentIds(new Set(workoutSheet.associatedStudentIds));
    } else {
      setSelectedStudentIds(new Set());
    }
  }, [isOpen, workoutSheet]);

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(workoutSheet.id, Array.from(selectedStudentIds));
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <Card 
        title={`Associar Alunos ao Treino: ${workoutSheet.name}`} 
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-800 shadow-2xl"
      >
        <div className="p-4 border-b border-slate-700">
          <Input
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon />}
          />
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-150
                            ${selectedStudentIds.has(student.id) ? 'bg-primary-purple/20 ring-1 ring-primary-purple' : 'bg-slate-700 hover:bg-slate-600/70'}`}
                onClick={() => handleToggleStudent(student.id)}
              >
                <div className="flex items-center">
                  <img src={student.photoUrl || DEFAULT_STUDENT_PHOTO(student.id)} alt={student.name} className="h-10 w-10 rounded-full object-cover mr-3"/>
                  <div>
                    <p className={`font-medium ${selectedStudentIds.has(student.id) ? 'text-primary-purple' : 'text-slate-100'}`}>{student.name}</p>
                    <p className="text-xs text-slate-400">{student.cpf}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedStudentIds.has(student.id)}
                  onChange={() => handleToggleStudent(student.id)}
                  className="form-checkbox h-5 w-5 text-primary-purple bg-slate-600 border-slate-500 rounded focus:ring-primary-purple focus:ring-offset-slate-800"
                />
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">Nenhum aluno encontrado ou todos os alunos já foram filtrados.</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t border-slate-700 bg-slate-800/80 mt-auto">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" onClick={handleSave}>
            Salvar Associações ({selectedStudentIds.size})
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AssociateStudentsModal;
