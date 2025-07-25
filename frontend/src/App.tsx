import { useState, useEffect } from "react";
import { DollarSign, X } from "lucide-react";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import AppointmentList from "./components/AppointmentList";
import RevenueReport from "./components/RevenueReport";
import { type Appointment } from "./types/appointment";
import Login from "./components/Login";
import { supabase } from "./lib/supabase";

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [apts, setApts] = useState<Record<string, Appointment[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [showRev, setShowRev] = useState(false);
  const [selTimes, setSelTimes] = useState<string[]>([]);
  const [form, setForm] = useState({ type: "", clientName: "", value: "", observations: "" });
  const [revFilter, setRevFilter] = useState({ period: "Dia" });
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Função para formatar valor em moeda
  const fmtCurr = (v: string) => {
    if (!v) return '';
    const digits = v.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits) / 100;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // Função para converter de moeda para número
  const parseCurr = (v: string) => parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

  // Gerar slots de horários
  const timeSlots = Array.from({length: 28}, (_, i) => {
    const h = Math.floor(i/2) + 7;
    return `${h.toString().padStart(2,'0')}:${i % 2 ? '30' : '00'}`;
  });

  // Formatar chave de data
  const fmtDateKey = (d: Date) => d.toISOString().split('T')[0];

  // Alternar seleção de horário
  const toggleTime = (t: string) => {
    if (selDate) {
      const key = fmtDateKey(selDate);
      const isBooked = apts[key]?.some(app => app.times.includes(t));
      if (isBooked) return;
    }
    setSelTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t].sort());
  };

  // Abrir modal para novo agendamento
  const openNewApt = () => {
    if (!selDate) return alert('Selecione uma data primeiro');
    if (selTimes.length === 0) return alert('Selecione pelo menos um horário');
    setEditingAppointment(null);
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setForm({ type: "", clientName: "", value: "", observations: "" });
    setSelTimes([]);
    setEditingAppointment(null);
  };

  // Carregar agendamentos do Supabase
  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;

      // Organizar por data
      const aptsByDate: Record<string, Appointment[]> = {};
      data.forEach(appointment => {
        const dateKey = appointment.date.split('T')[0];
        if (!aptsByDate[dateKey]) {
          aptsByDate[dateKey] = [];
        }
        aptsByDate[dateKey].push(appointment);
      });
      
      setApts(aptsByDate);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      alert('Erro ao carregar agendamentos');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar agendamento (criação ou edição)
  const confirmApt = async () => {
    if (!form.type || !form.clientName || !form.value || !selDate) 
      return alert('Preencha todos os campos obrigatórios');

    const newApt: Appointment = {
      id: editingAppointment?.id || Date.now(),
      times: selTimes,
      type: form.type,
      client_name: form.clientName,   // Map form field to snake_case
      value: parseCurr(form.value),
      observations: form.observations,
      date: selDate.toISOString(),
      created_by: currentUser         // Map to snake_case
    };


    try {
      if (editingAppointment) {
        // Atualizar no Supabase
        const { error } = await supabase
          .from('appointments')
          .update(newApt)
          .eq('id', newApt.id);
        
        if (error) throw error;
      } else {
        // Inserir no Supabase
        const { error } = await supabase
          .from('appointments')
          .insert([newApt]);
        
        if (error) throw error;
      }
      
      // Recarregar dados
      await loadAppointments();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento');
    }
  };

  // Calcular receitas
  const calcRev = () => {
    const refDate = selDate || new Date();
    const ref = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
    
    const allApts = Object.values(apts).flat();
    const filtered = allApts.filter(a => {
      const aptDate = new Date(a.date);
      const apt = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
      
      switch(revFilter.period) {
        case "Dia": return apt.getTime() === ref.getTime();
        case "Semana": {
          const start = new Date(ref);
          start.setDate(ref.getDate() - ref.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return apt >= start && apt <= end;
        }
        case "Mês": 
          return aptDate.getMonth() === refDate.getMonth() && 
                 aptDate.getFullYear() === refDate.getFullYear();
        default: return false;
      }
    });
    
    return {
      total: filtered.reduce((s, a) => s + a.value, 0),
      laser: filtered.filter(a => a.type === "Laser").reduce((s, a) => s + a.value, 0),
      cera: filtered.filter(a => a.type === "Cera").reduce((s, a) => s + a.value, 0),
      count: filtered.length
    };
  };

  // Navegar entre meses
  const navMonth = (dir: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
    setSelDate(null);
    setSelTimes([]);
  };

  // Editar agendamento
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setForm({
      type: appointment.type,
      clientName: appointment.client_name,  // Map snake_case to form field
      value: appointment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      observations: appointment.observations
    });
    setSelTimes([...appointment.times]);
    setShowModal(true);
  };

  // Excluir agendamento
  const handleDeleteAppointment = async (appointmentId: number) => {
    if (!selDate || !window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      // Recarregar dados
      await loadAppointments();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  // Efeito para carregar agendamentos quando autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated]);

  // Agendamentos da data selecionada
  const selDateAppts = selDate ? apts[fmtDateKey(selDate)] || [] : [];
  const rev = calcRev();

  if (!isAuthenticated) {
    return <Login onLogin={(username) => {
      setIsAuthenticated(true);
      setCurrentUser(username);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Clínica de Depilação</h1>
            <p className="text-gray-600">Sistema de Agendamento</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-right">
            <span className="text-gray-700 font-medium mb-2 sm:mb-0">Usuário: {currentUser}</span>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>


        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando agendamentos...</p>
          </div>
        )}

        {!isLoading && (
          <>
            <Calendar 
              currentMonth={currentMonth}
              onPrevMonth={() => navMonth(-1)}
              onNextMonth={() => navMonth(1)}
              selectedDate={selDate}
              onDateSelect={setSelDate}
              appointments={apts}
            />

            <div className="flex justify-center mb-4">
              <button onClick={() => setShowRev(!showRev)} 
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold shadow-md transition-colors">
                <DollarSign size={20} />
                {showRev ? 'Ocultar Receitas' : 'Ver Receitas'}
              </button>
            </div>

            <RevenueReport 
              show={showRev}
              revenueFilter={revFilter}
              onFilterChange={setRevFilter}
              revenueData={rev}
            />

            {selDate && (
              <TimeSlots 
                date={selDate}
                timeSlots={timeSlots}
                selectedTimes={selTimes}
                appointments={apts}
                onTimeToggle={toggleTime}
                onNewAppointment={openNewApt}
              />
            )}

            {selDate && selDateAppts.length > 0 && (
              <AppointmentList 
                date={selDate}
                appointments={selDateAppts}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
              />
            )}
          </>
        )}

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-opacity-30 backdrop-blur-md">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
                </h3>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm(p => ({...p, type: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500" 
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Laser">Laser</option>
                    <option value="Cera">Cera</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Cliente *</label>
                  <input 
                    type="text" 
                    value={form.clientName} 
                    onChange={e => setForm(p => ({...p, clientName: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Digite o nome do cliente" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                  <input 
                    type="text" 
                    value={form.value}
                    onChange={e => setForm(p => ({...p, value: fmtCurr(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="R$ 0,00" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                  <textarea 
                    value={form.observations} 
                    rows={3}
                    onChange={e => setForm(p => ({...p, observations: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="Observações adicionais (opcional)" 
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Horários:</strong> {selTimes.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Data:</strong> {selDate?.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Agendado por:</strong> {currentUser}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmApt}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors"
                >
                  {editingAppointment ? "Atualizar" : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;