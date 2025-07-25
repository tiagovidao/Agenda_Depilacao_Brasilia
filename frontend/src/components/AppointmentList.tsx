import { FileText, Edit, Trash2 } from "lucide-react";
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

  if (!appointments.length) return null;

  const filteredAppointments = appointments.filter(app => 
    filter === "Todos" || app.type === filter
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText size={24} />
          <h2 className="text-2xl font-bold">
            Agendamentos - {date ? date.toLocaleDateString('pt-BR') : ''}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filtrar:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(["Todos", "Cera", "Laser"] as const).map(option => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === option 
                    ? 'bg-gray-700 text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredAppointments.map(a => (
          <div key={a.id} className="border border-gray-200 rounded-lg p-4 shadow-sm relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => onEdit(a)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
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
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Cliente</label>
                <p className="font-semibold">{a.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo</label>
                <p className={`font-semibold ${a.type === 'Laser' ? 'text-pink-600' : 'text-purple-600'}`}>
                  {a.type}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Valor</label>
                <p className="font-semibold">R$ {a.value.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Horários</label>
                <p className="font-semibold">{a.times.join(', ')}</p>
              </div>
            </div>
            
            {a.observations && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-500">Observações</label>
                <p className="text-gray-700 mt-1">{a.observations}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredAppointments.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          Nenhum agendamento encontrado para o filtro selecionado
        </div>
      )}
    </div>
  );
};

export default AppointmentList;