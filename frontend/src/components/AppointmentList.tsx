import { FileText, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { type Appointment } from "../types/appointment";
import { useState } from "react";

interface AppointmentListProps {
  date: Date | null;
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: number) => void;
}

const AppointmentList = ({ 
  date, 
  appointments,
  onEdit,
  onDelete
}: AppointmentListProps) => {
  const [filter, setFilter] = useState<"Todos" | "Cera" | "Laser">("Todos");
  const [isVisible, setIsVisible] = useState(true); // Estado para controlar a visibilidade

  if (!appointments.length) return null;

  const filteredAppointments = appointments.filter(app => 
    filter === "Todos" || app.type === filter
  );

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleVisibility}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
            title={isVisible ? "Ocultar agendamentos" : "Mostrar agendamentos"}
          >
            {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          <FileText size={24} className="text-purple-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Agendamentos - {date ? date.toLocaleDateString('pt-BR') : ''}
          </h2>
        </div>
        
        {isVisible && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(["Todos", "Cera", "Laser"] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    filter === option 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isVisible && (
        <>
          <div className="space-y-4">
            {filteredAppointments.map(a => (
              <div key={a.id} className="border border-gray-200 rounded-lg p-4 shadow-sm relative transition-all hover:shadow-md">
                <div className="absolute top-3 right-3 flex gap-1">
                  <button 
                    onClick={() => onEdit(a)}
                    className="p-1.5 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
                        onDelete(a.id);
                      }
                    }}
                    className="p-1.5 sm:p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Cliente</label>
                    <p className="font-semibold text-gray-800 truncate">{a.client_name}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Tipo</label>
                    <p className={`font-semibold ${a.type === 'Laser' ? 'text-pink-600' : 'text-purple-600'}`}>
                      {a.type}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Valor</label>
                    <p className="font-semibold text-gray-800">R$ {a.value.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Horários</label>
                    <p className="font-semibold text-gray-800">{a.times.join(', ')}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Agendado por</label>
                  <p className="font-semibold text-gray-800">{a.created_by}</p>
                </div>

                {a.observations && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Observações</label>
                    <p className="text-gray-700 mt-1 text-sm">{a.observations}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              Nenhum agendamento encontrado para o filtro selecionado
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentList;