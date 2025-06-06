import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { Student, PlanTier } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import { UserCircleIcon, CakeIcon, PhoneIcon, IdentificationIcon, DocumentTextIcon, PhotoIcon, CalendarDaysIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { AVAILABLE_PLANS, DEFAULT_STUDENT_PHOTO } from '../../constants';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student> & { email?: string; password?: string; photoFile?: File | null }) => void;
  initialData?: Student | null;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Student> & { email?: string; password?: string }>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && initialData) {
        setFormData({
          name: initialData.name || '',
          cpf: initialData.cpf || '',
          phone: initialData.phone || '',
          birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : '',
          currentPlanId: initialData.currentPlanId || AVAILABLE_PLANS[0]?.id || '',
          observations: initialData.observations || '',
          email: initialData.email || '', // Assuming student might have email associated for editing (though not typical for student record itself)
          // password typically not pre-filled for editing
        });
        setPhotoPreview(initialData.photoUrl || null);
      } else {
        setFormData({
          name: '',
          email: '', // For new user signup
          password: '', // For new user signup
          cpf: '',
          phone: '',
          birthDate: '',
          currentPlanId: AVAILABLE_PLANS[0]?.id || '',
          observations: '',
        });
        setPhotoPreview(null);
      }
      setPhotoFile(null); // Clear any previous file selection
    }
  }, [isOpen, initialData, isEditing]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(initialData?.photoUrl || null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEditing && (!formData.email || !formData.password)) {
        alert("Email e Senha são obrigatórios para novos alunos.");
        return;
    }
    if (!formData.name || !formData.cpf) {
        alert("Nome e CPF são obrigatórios.");
        return;
    }
    
    const dataToSave: Partial<Student> & { email?: string; password?: string; photoFile?: File | null } = {
        ...formData,
        photoFile,
    };

    if(isEditing && initialData) {
        dataToSave.id = initialData.id;
    }
    
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out">
      <Card title={isEditing ? "Editar Aluno" : "Adicionar Novo Aluno"} className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden bg-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar">
          
          {!isEditing && (
            <>
              <Input
                label="Email (para login)"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                required={!isEditing}
                icon={<EnvelopeIcon />}
                placeholder="Ex: aluno@email.com"
              />
              <Input
                label="Senha (para login)"
                name="password"
                type="password"
                value={formData.password || ''}
                onChange={handleChange}
                required={!isEditing}
                icon={<LockClosedIcon />}
                placeholder="Mínimo 6 caracteres"
              />
               <hr className="border-slate-700 my-3"/>
            </>
          )}

          <Input
            label="Nome Completo"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            icon={<UserCircleIcon />}
            placeholder="Ex: João da Silva"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CPF"
              name="cpf"
              value={formData.cpf || ''}
              onChange={handleChange}
              required
              icon={<IdentificationIcon />}
              placeholder="Ex: 000.000.000-00"
            />
            <Input
              label="Telefone"
              name="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={handleChange}
              icon={<PhoneIcon />}
              placeholder="Ex: (00) 90000-0000"
            />
          </div>
          <Input
            label="Data de Nascimento"
            name="birthDate"
            type="date"
            value={formData.birthDate || ''} 
            onChange={handleChange}
            icon={<CakeIcon />}
          />
          
          <div>
            <label htmlFor="currentPlanId" className="block text-sm font-medium text-slate-300 mb-1">Plano Atual</label>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
                 </div>
                <select
                    id="currentPlanId"
                    name="currentPlanId"
                    value={formData.currentPlanId || AVAILABLE_PLANS[0]?.id}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-primary-purple focus:border-primary-purple rounded-lg text-sm focus:outline-none transition-colors duration-150 ease-in-out"
                >
                    {AVAILABLE_PLANS.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-slate-300 mb-1">Foto do Aluno (Avatar)</label>
            <div className="mt-1 flex items-center space-x-4">
              <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-slate-700 ring-2 ring-primary-purple/50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <PhotoIcon className="h-full w-full text-slate-500 p-4" />
                )}
              </span>
              <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                {photoPreview ? "Alterar Foto" : "Selecionar Foto"}
              </Button>
              <input
                type="file"
                name="photo"
                id="photo"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
             {isEditing && initialData?.photoUrl && !photoFile && ( // Show if editing, has an old photo, and no new file selected
                 <p className="text-xs text-slate-400 mt-1">Foto atual será mantida se nenhuma nova for selecionada.</p>
             )}
          </div>

          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
            <div className="relative">
                <DocumentTextIcon className="h-5 w-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <textarea
                    id="observations"
                    name="observations"
                    rows={3}
                    value={formData.observations || ''}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-primary-purple focus:border-primary-purple rounded-lg text-sm focus:outline-none transition-colors duration-150 ease-in-out"
                    placeholder="Ex: Alergias, objetivos específicos, etc."
                />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700 mt-auto">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? "Salvar Alterações" : "Salvar Aluno"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddStudentModal;
