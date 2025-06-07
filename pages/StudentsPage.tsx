
import React, { useState, useMemo } from 'react';
import { studentsData as initialStudentsData } from '../data/mockData';
import { Student } from '../types';
import { IconSearch, IconPlus, IconEdit, IconTrash } from '../constants.tsx'; // Explicitly use .tsx
import Modal from '../components/Modal';

const StudentRow: React.FC<{ student: Student; onEdit: (student: Student) => void; onDelete: (id: string) => void }> = ({ student, onEdit, onDelete }) => {
  const paymentStatusColor = 
    student.paymentStatus === 'Em dia' ? 'bg-green-500/20 text-green-400' :
    student.paymentStatus === 'Atrasado' ? 'bg-red-500/20 text-red-400' :
    'bg-yellow-500/20 text-yellow-400';

  return (
    <tr className="border-b border-dark-border hover:bg-gray-700/50 transition-colors">
      <td className="p-3 whitespace-nowrap">
        <img src={student.photoUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
      </td>
      <td className="p-3 whitespace-nowrap">
        <div className="font-medium text-light-text">{student.name}</div>
        <div className="text-xs text-medium-text">{student.membershipType}</div>
      </td>
      <td className="p-3 whitespace-nowrap text-medium-text">{student.cpf}</td>
      <td className="p-3 whitespace-nowrap text-medium-text">{student.phone}</td>
      <td className="p-3 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColor}`}>
          {student.paymentStatus}
        </span>
      </td>
      <td className="p-3 whitespace-nowrap space-x-2">
        <button onClick={() => onEdit(student)} className="text-blue-400 hover:text-blue-300 p-1" title="Editar Aluno">
          <IconEdit className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(student.id)} className="text-red-400 hover:text-red-300 p-1" title="Excluir Aluno">
          <IconTrash className="w-5 h-5" />
        </button>
      </td>
    </tr>
  );
};

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(initialStudentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form state for new/edit student
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '', cpf: '', phone: '', paymentStatus: 'Pendente', membershipType: 'Mensal', photoUrl: 'https://picsum.photos/seed/newstudent/40/40'
  });

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm)
    );
  }, [students, searchTerm]);

  const handleOpenModal = (student: Student | null = null) => {
    setEditingStudent(student);
    if (student) {
      setFormData(student);
    } else {
      setFormData({ name: '', cpf: '', phone: '', paymentStatus: 'Pendente', membershipType: 'Mensal', photoUrl: `https://picsum.photos/seed/${Date.now()}/40/40` });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', cpf: '', phone: '', paymentStatus: 'Pendente', membershipType: 'Mensal', photoUrl: 'https://picsum.photos/seed/newstudent/40/40' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...formData } as Student : s));
    } else {
      const newStudent: Student = {
        id: `s${Date.now()}`,
        ...formData,
      } as Student;
      setStudents([newStudent, ...students]);
    }
    handleCloseModal();
  };

  const handleDeleteStudent = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-light-text">Gerenciamento de Alunos</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <IconPlus className="w-5 h-5" />
          <span>Novo Aluno</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconSearch className="w-5 h-5 text-medium-text" />
        </div>
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 bg-dark-card border border-dark-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-purple outline-none"
        />
      </div>

      <div className="bg-dark-card shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-700/30">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-medium-text uppercase tracking-wider">Foto</th>
              <th className="p-3 text-left text-xs font-semibold text-medium-text uppercase tracking-wider">Nome</th>
              <th className="p-3 text-left text-xs font-semibold text-medium-text uppercase tracking-wider">CPF</th>
              <th className="p-3 text-left text-xs font-semibold text-medium-text uppercase tracking-wider">Telefone</th>
              <th className="p-3 text-left text-xs font-semibold text-medium-text uppercase tracking-wider">Status Pag.</th>
              <th className="p-3 text-left text-xs font-semibold text-medium-text uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <StudentRow key={student.id} student={student} onEdit={handleOpenModal} onDelete={handleDeleteStudent} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-6 text-medium-text">Nenhum aluno encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStudent ? 'Editar Aluno' : 'Adicionar Novo Aluno'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-medium-text">Nome Completo</label>
            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-medium-text">CPF</label>
            <input type="text" name="cpf" id="cpf" value={formData.cpf || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-medium-text">Telefone</label>
            <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
           <div>
            <label htmlFor="membershipType" className="block text-sm font-medium text-medium-text">Tipo de Plano</label>
            <select name="membershipType" id="membershipType" value={formData.membershipType || 'Mensal'} onChange={handleFormChange} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple">
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-medium-text">Status do Pagamento</label>
            <select name="paymentStatus" id="paymentStatus" value={formData.paymentStatus || 'Pendente'} onChange={handleFormChange} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple">
              <option value="Em dia">Em dia</option>
              <option value="Atrasado">Atrasado</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="py-2 px-4 border border-gray-600 rounded-md text-medium-text hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-brand-purple hover:bg-purple-700 text-white rounded-md transition">Salvar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsPage;
