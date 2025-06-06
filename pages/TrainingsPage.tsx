
import React, { useState } from 'react';
import { trainingsData as initialTrainingsData } from '../data/mockData';
import { Training, TrainingObjective } from '../types';
import { IconPlus, IconEdit, IconTrash, IconUsers, IconActivity, IconDumbbell } from '../constants'; // Added IconDumbbell
import Modal from '../components/Modal';

const TrainingCard: React.FC<{ training: Training; onEdit: (training: Training) => void; onDelete: (id: string) => void; onAssociate: (id: string) => void; }> = 
  ({ training, onEdit, onDelete, onAssociate }) => {
  return (
    <div className="bg-dark-card p-5 rounded-lg shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-semibold text-brand-purple mb-2">{training.name}</h3>
        <p className="text-sm text-medium-text mb-1 flex items-center">
          <IconUsers className="w-4 h-4 mr-2" /> Alunos Associados: {training.associatedStudents}
        </p>
        <p className="text-sm text-medium-text mb-1 flex items-center">
          <IconActivity className="w-4 h-4 mr-2" /> Objetivo: {training.objective}
        </p>
        <p className="text-sm text-medium-text mb-1">Total de Exercícios: {training.totalExercises}</p>
        <p className="text-xs text-medium-text italic mt-2">Exemplo: {training.exampleExercise || 'N/A'}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-dark-border flex flex-wrap gap-2">
        <button onClick={() => onEdit(training)} className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center space-x-1 transition-colors">
          <IconEdit className="w-3 h-3" /> <span>Editar</span>
        </button>
        <button onClick={() => onDelete(training.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded flex items-center space-x-1 transition-colors">
          <IconTrash className="w-3 h-3" /> <span>Excluir</span>
        </button>
        <button onClick={() => onAssociate(training.id)} className="text-xs bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded flex items-center space-x-1 transition-colors">
          <IconUsers className="w-3 h-3" /> <span>Associar Alunos</span>
        </button>
      </div>
    </div>
  );
};


const TrainingsPage: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>(initialTrainingsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  
  const [formData, setFormData] = useState<Partial<Training>>({
    name: '', objective: TrainingObjective.HIPERTROFIA, associatedStudents: 0, totalExercises: 0, exampleExercise: ''
  });

  const handleOpenModal = (training: Training | null = null) => {
    setEditingTraining(training);
    if (training) {
      setFormData(training);
    } else {
      setFormData({ name: '', objective: TrainingObjective.HIPERTROFIA, associatedStudents: 0, totalExercises: 0, exampleExercise: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTraining(null);
    setFormData({ name: '', objective: TrainingObjective.HIPERTROFIA, associatedStudents: 0, totalExercises: 0, exampleExercise: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const val = name === 'associatedStudents' || name === 'totalExercises' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTraining) {
      setTrainings(trainings.map(t => t.id === editingTraining.id ? { ...t, ...formData } as Training : t));
    } else {
      const newTraining: Training = {
        id: `t${Date.now()}`,
        ...formData,
      } as Training; // Cast to Training
      setTrainings([newTraining, ...trainings]);
    }
    handleCloseModal();
  };

  const handleDeleteTraining = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setTrainings(trainings.filter(t => t.id !== id));
    }
  };

  const handleAssociateStudents = (id: string) => {
    // Placeholder for actual association logic
    alert(`Funcionalidade "Associar Alunos" para o treino ID: ${id} em desenvolvimento.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-light-text flex items-center">
          <IconDumbbell className="w-8 h-8 mr-3 text-brand-purple" />
          Gerenciamento de Treinos
        </h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <IconPlus className="w-5 h-5" />
          <span>Novo Treino</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.length > 0 ? (
          trainings.map(training => (
            <TrainingCard 
              key={training.id} 
              training={training} 
              onEdit={handleOpenModal} 
              onDelete={handleDeleteTraining}
              onAssociate={handleAssociateStudents}
            />
          ))
        ) : (
          <p className="text-medium-text col-span-full text-center p-6">Nenhum treino cadastrado.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTraining ? 'Editar Treino' : 'Adicionar Novo Treino'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-medium-text">Nome do Treino</label>
            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div>
            <label htmlFor="objective" className="block text-sm font-medium text-medium-text">Objetivo</label>
            <select name="objective" id="objective" value={formData.objective || TrainingObjective.HIPERTROFIA} onChange={handleFormChange} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple">
              {Object.values(TrainingObjective).map(obj => <option key={obj} value={obj}>{obj}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="totalExercises" className="block text-sm font-medium text-medium-text">Total de Exercícios</label>
            <input type="number" name="totalExercises" id="totalExercises" value={formData.totalExercises || 0} onChange={handleFormChange} min="0" className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div>
            <label htmlFor="exampleExercise" className="block text-sm font-medium text-medium-text">Exemplo de Exercício</label>
            <textarea name="exampleExercise" id="exampleExercise" value={formData.exampleExercise || ''} onChange={handleFormChange} rows={2} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"></textarea>
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

export default TrainingsPage;
