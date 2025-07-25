import { X, Calendar, Clock, User, DollarSign, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { type Appointment } from "../types/appointment";
import { useState } from "react";

interface AppointmentModalProps {
  showModal: boolean;
  closeModal: () => void;
  form: {
    type: string;
    clientName: string;
    value: string;
    observations: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    type: string;
    clientName: string;
    value: string;
    observations: string;
  }>>;
  selTimes: string[];
  setSelTimes: React.Dispatch<React.SetStateAction<string[]>>;
  selDate: Date | null;
  currentUser: string;
  editingAppointment: Appointment | null;
  confirmApt: () => Promise<void>;
  fmtCurr: (v: string) => string;
  appointments: Record<string, Appointment[]>;
  timeSlots: string[];
  isSaving?: boolean;
}

const AppointmentModal = ({
  showModal,
  closeModal,
  form,
  setForm,
  selTimes,
  setSelTimes,
  selDate,
  currentUser,
  editingAppointment,
  confirmApt,
  fmtCurr,
  appointments,
  timeSlots,
  isSaving = false
}: AppointmentModalProps) => {
  const [showTimeEditor, setShowTimeEditor] = useState(false);

  if (!showModal) return null;

  const handleInputChange = (field: keyof typeof form, value: string) => {
    if (field === 'value') {
      value = fmtCurr(value);
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const fmtDateKey = (d: Date) => d.toISOString().split('T')[0];
  
  // Verifica se um horário está ocupado por OUTRO agendamento
  const isBookedByOther = (time: string) => {
    if (!selDate) return false;
    const dateAppts = appointments[fmtDateKey(selDate)] || [];
    return dateAppts.some(apt => 
      apt.times.includes(time) && apt.id !== editingAppointment?.id
    );
  };

  const toggleTime = (time: string) => {
    if (isBookedByOther(time)) return; // Não permite selecionar horários ocupados por outros
    
    setSelTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time].sort()
    );
  };

  const getTimeStatus = (time: string) => {
    if (isBookedByOther(time)) return 'occupied';
    if (selTimes.includes(time)) return 'selected';
    return 'available';
  };

  const getTimeStyles = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500 text-white cursor-not-allowed opacity-60';
      case 'selected':
        return 'bg-purple-600 text-white shadow-lg scale-105 border-2 border-purple-700';
      case 'available':
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 hover:border-gray-400';
    }
  };

  // Informações do agendamento que ocupa o horário
  const getOccupiedInfo = (time: string) => {
    if (!selDate) return null;
    const dateAppts = appointments[fmtDateKey(selDate)] || [];
    return dateAppts.find(apt => 
      apt.times.includes(time) && apt.id !== editingAppointment?.id
    );
  };

  return (
    <div className="fixed inset-0 bg-blue-100/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={24} className="text-purple-600" />
            {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button
            onClick={closeModal}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Data */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-purple-600" />
              <span className="font-medium text-gray-700">Data</span>
            </div>
            <p className="text-gray-800">{selDate?.toLocaleDateString('pt-BR')}</p>
          </div>

          {/* Seção de Horários */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-purple-600" />
                <span className="font-medium text-gray-700">Horários</span>
              </div>
              <button
                onClick={() => setShowTimeEditor(!showTimeEditor)}
                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showTimeEditor ? 'Ocultar' : 'Editar horários'}
                {showTimeEditor ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Horários selecionados (sempre visível) */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Horários selecionados:</p>
              <div className="flex flex-wrap gap-2">
                {selTimes.length > 0 ? (
                  selTimes.map(time => (
                    <span key={time} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                      {time}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">Nenhum horário selecionado</span>
                )}
              </div>
            </div>

            {/* Editor de horários (expansível) */}
            {showTimeEditor && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                  {timeSlots.map(time => {
                    const status = getTimeStatus(time);
                    const occupiedInfo = getOccupiedInfo(time);
                    
                    return (
                      <div key={time} className="relative">
                        <button
                          onClick={() => toggleTime(time)}
                          disabled={status === 'occupied'}
                          className={`w-full p-2 rounded-lg font-medium text-xs transition-all duration-200 ${getTimeStyles(status)}`}
                        >
                          {time}
                        </button>
                        {occupiedInfo && (
                          <div className="mt-1 text-xs text-center text-red-600 font-medium truncate">
                            {occupiedInfo.client_name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                    <span>Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span>Selecionado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Ocupado</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Serviço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Serviço *
            </label>
            <select
              value={form.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecione o tipo</option>
              <option value="Laser">Laser</option>
              <option value="Cera">Cera</option>
            </select>
          </div>

          {/* Nome do Cliente */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-purple-600" />
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Digite o nome do cliente"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-purple-600" />
              Valor *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.value}
              onChange={(e) => handleInputChange('value', e.target.value)}
              placeholder="R$ 0,00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-purple-600" />
              Observações
            </label>
            <textarea
              value={form.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
              placeholder="Observações opcionais..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Usuário */}
          <div className="bg-gray-50 rounded-lg p-3">
            <span className="text-sm text-gray-600">
              Agendado por: <span className="font-medium text-gray-800">{currentUser}</span>
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={closeModal}
            disabled={isSaving}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
              isSaving 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={confirmApt}
            disabled={selTimes.length === 0 || isSaving}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
              selTimes.length === 0 || isSaving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {editingAppointment ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              editingAppointment ? 'Atualizar' : 'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;