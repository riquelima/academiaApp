import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

const SchedulePage: React.FC = () => {
  // Mock data and state for classes and calendar would go here
  // const [selectedDate, setSelectedDate] = useState(new Date());
  // const [classes, setClasses] = useState<GymClass[]>([]);
  // const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center">
          <CalendarDaysIcon className="h-8 w-8 mr-3 text-primary-purple" />
          Agendamento de Aulas
        </h1>
        <Button 
          onClick={() => alert("Funcionalidade de agendar nova aula em desenvolvimento.")}
          leftIcon={<PlusIcon className="h-5 w-5" />}
        >
          Nova Aula
        </Button>
      </div>

      <Card title={`Agenda - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`}>
        <p className="text-slate-400 p-4">
          A funcionalidade de calendário visual para agendamento de aulas está em desenvolvimento.
          Aqui você poderá marcar aulas, escolher professor, horário, alunos inscritos, confirmar presenças e enviar lembretes.
        </p>
        {/* Placeholder for Calendar View */}
        <div className="p-4 h-96 bg-slate-700/30 rounded-lg flex items-center justify-center">
          <p className="text-slate-500 text-lg">Visualização de Calendário (Em Breve)</p>
        </div>
      </Card>
      
      <Card title="Próximas Aulas Agendadas">
        {/* Placeholder for list of upcoming classes */}
         <div className="p-4 space-y-3">
            <div className="p-3 bg-slate-700 rounded-md">
                <h4 className="font-semibold text-primary-purple">Aula de Spinning</h4>
                <p className="text-sm text-slate-300">Prof. João - Amanhã às 18:00 (15/20 vagas)</p>
            </div>
             <div className="p-3 bg-slate-700 rounded-md">
                <h4 className="font-semibold text-primary-purple">Yoga Restaurativa</h4>
                <p className="text-sm text-slate-300">Prof. Maria - Quarta-feira às 09:00 (8/12 vagas)</p>
            </div>
         </div>
      </Card>

      {/* TODO: Add ClassBookingModal */}
      {/* {showBookingModal && <ClassBookingModal onClose={() => setShowBookingModal(false)} onConfirm={handleConfirmBooking} />} */}
    </div>
  );
};

export default SchedulePage;
