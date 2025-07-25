import { X, Calendar, Clock, User, DollarSign, FileText } from "lucide-react";
import { type Appointment } from "../types/appointment";

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
  selDate: Date | null;
  currentUser: string;
  editingAppointment: Appointment | null;
  confirmApt: () => Promise<void>;
  fmtCurr: (v: string) => string;
}

const AppointmentModal = ({
  showModal,
  closeModal,
  form,
  setForm,
  selTimes,
  selDate,
  currentUser,
  editingAppointment,
  confirmApt,
  fmtCurr
}: AppointmentModalProps) => {
  if (!showModal) return null;

  const handleInputChange = (field: keyof typeof form, value: string) => {
    if (field === 'value') {
      value = fmtCurr(value);
    }
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-blue-100/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
          {/* Data e Horários */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-purple-600" />
              <span className="font-medium text-gray-700">Data</span>
            </div>
            <p className="text-gray-800">{selDate?.toLocaleDateString('pt-BR')}</p>
            
            <div className="flex items-center gap-2 mt-3 mb-2">
              <Clock size={18} className="text-purple-600" />
              <span className="font-medium text-gray-700">Horários Selecionados</span>
            </div>
            <p className="text-gray-800">{selTimes.join(', ')}</p>
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
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={confirmApt}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            {editingAppointment ? 'Atualizar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;