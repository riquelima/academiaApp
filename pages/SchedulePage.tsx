
import React, { useState } from 'react';
import ScheduledClassItem from '../components/ScheduledClassItem';
import { scheduledClassesData as initialScheduledClassesData } from '../data/mockData';
import { ScheduledClass } from '../types';
import { IconCalendar, IconPlus } from '../constants.tsx'; // Explicitly use .tsx
import Modal from '../components/Modal';

const SchedulePage: React.FC = () => {
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>(initialScheduledClassesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Form state for new class
  const [formData, setFormData] = useState<Partial<ScheduledClass>>({
    name: '', teacher: '', time: '', spotsFilled: 0, totalSpots: 10
  });

  const handleOpenModal = () => {
     setFormData({ name: '', teacher: '', time: '', spotsFilled: 0, totalSpots: 10 });
     setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = (name === 'spotsFilled' || name === 'totalSpots') ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClass: ScheduledClass = {
      id: `c${Date.now()}`,
      ...formData
    } as ScheduledClass;
    setScheduledClasses(prev => [newClass, ...prev]);
    handleCloseModal();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-light-text flex items-center">
          <IconCalendar className="w-8 h-8 mr-3 text-brand-purple" />
          Agendamento de Aulas
        </h2>
        <button 
          onClick={handleOpenModal}
          className="bg-brand-purple hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <IconPlus className="w-5 h-5" />
          <span>Nova Aula</span>
        </button>
      </div>
      
      <div className="bg-dark-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-light-text mb-2">Agenda - {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
        <p className="text-medium-text mb-6">
          A funcionalidade de calendário visual para agendamento de aulas está em desenvolvimento. 
          Aqui você poderá marcar aulas, escolher professor, horário, alunos inscritos, confirmar presenças e enviar lembretes.
        </p>
        <div className="bg-gray-700/50 p-8 rounded-md text-center text-medium-text">
          Visualização de Calendário (Em Breve)
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-light-text mb-4">Próximas Aulas Agendadas</h3>
         <div className="bg-dark-card p-1 md:p-2 rounded-lg shadow">
            {scheduledClasses.length > 0 ? (
            scheduledClasses.map((sClass) => (
                <ScheduledClassItem key={sClass.id} sClass={sClass} />
            ))
            ) : (
            <p className="text-medium-text p-4">Nenhuma aula agendada no momento.</p>
            )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Adicionar Nova Aula">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-medium-text">Nome da Aula</label>
            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div>
            <label htmlFor="teacher" className="block text-sm font-medium text-medium-text">Professor(a)</label>
            <input type="text" name="teacher" id="teacher" value={formData.teacher || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-medium-text">Horário (Ex: Segunda às 10:00)</label>
            <input type="text" name="time" id="time" value={formData.time || ''} onChange={handleFormChange} required className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="spotsFilled" className="block text-sm font-medium text-medium-text">Vagas Preenchidas</label>
              <input type="number" name="spotsFilled" id="spotsFilled" value={formData.spotsFilled || 0} onChange={handleFormChange} min="0" className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
            </div>
            <div>
              <label htmlFor="totalSpots" className="block text-sm font-medium text-medium-text">Total de Vagas</label>
              <input type="number" name="totalSpots" id="totalSpots" value={formData.totalSpots || 10} onChange={handleFormChange} min="1" className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-light-text focus:ring-brand-purple focus:border-brand-purple"/>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={handleCloseModal} className="py-2 px-4 border border-gray-600 rounded-md text-medium-text hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-brand-purple hover:bg-purple-700 text-white rounded-md transition">Salvar Aula</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default SchedulePage;
