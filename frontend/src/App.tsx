import { useState, useEffect, useCallback } from "react";
import Calendar from "./components/Calendar";
import TimeSlots from "./components/TimeSlots";
import AppointmentList from "./components/AppointmentList";
import RevenueReport from "./components/RevenueReport";
import AppointmentModal from "./components/AppointmentModal";
import { type Appointment } from "./types/appointment";
import Login from "./components/Login";
import { supabase } from "./lib/supabase";
import Register from "./components/Register";
import type { User } from "./types/user";

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [apts, setApts] = useState<Record<string, Appointment[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [selTimes, setSelTimes] = useState<string[]>([]);
  const [form, setForm] = useState({ type: "", clientName: "", value: "", observations: "" });
  const [revFilter, setRevFilter] = useState({ period: "Dia" });
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const[isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentView, setCurrentView] = useState<'appointments' | 'revenue'>('appointments');

  const fmtCurr = (v: string) => {
    if (!v) return '';
    const digits = v.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits) / 100;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  const parseCurr = (v: string) => parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

  const timeSlots = Array.from({length: 28}, (_, i) => {
    const h = Math.floor(i/2) + 7;
    return `${h.toString().padStart(2,'0')}:${i % 2 ? '30' : '00'}`;
  });

  const fmtDateKey = (d: Date) => d.toISOString().split('T')[0];

  const toggleTime = (t: string) => {
    if (selDate) {
      const key = fmtDateKey(selDate);
      const isBooked = apts[key]?.some(app => app.times.includes(t));
      if (isBooked) return;
    }
    setSelTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t].sort());
  };

  const openNewApt = () => {
    if (!selDate) return alert('Selecione uma data primeiro');
    if (selTimes.length === 0) return alert('Selecione pelo menos um horário');
    setEditingAppointment(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return; // Previne fechar durante o salvamento
    setShowModal(false);
    setForm({ type: "", clientName: "", value: "", observations: "" });
    setSelTimes([]);
    setEditingAppointment(null);
  };

  const loadAppointments = useCallback(async () => {
  if (!currentUser) return;
  
  setIsLoading(true);
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('date', { ascending: true });
    
    if (error) throw error;

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
}, [currentUser]);

  const confirmApt = async () => {
    if (!form.type || !form.clientName || !form.value || !selDate || !currentUser)
      return alert('Preencha todos os campos obrigatórios');

    setIsSaving(true);

    const newApt = {
      times: selTimes,
      type: form.type,
      client_name: form.clientName,
      value: parseCurr(form.value),
      observations: form.observations,
      date: selDate.toISOString(),
      user_id: currentUser.id // SEMPRE VINCULAR AO USUÁRIO LOGADO
    };

    try {
      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(newApt)
          .eq('id', editingAppointment.id)
          .eq('user_id', currentUser.id); // SEGURANÇA: só editar se for do usuário

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([newApt]);

        if (error) throw error;
      }

      await loadAppointments();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento');
    } finally {
      setIsSaving(false);
    }
  };

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

  const navMonth = (dir: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
    setSelDate(null);
    setSelTimes([]);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setForm({
      type: appointment.type,
      clientName: appointment.client_name,
      value: appointment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      observations: appointment.observations
    });
    setSelTimes([...appointment.times]);
    
    // Definir a data selecionada baseada no agendamento
    const appointmentDate = new Date(appointment.date);
    setSelDate(appointmentDate);
    
    setShowModal(true);
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
  if (!selDate || !currentUser || !window.confirm('Tem certeza que deseja excluir este agendamento?')) return;
  
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('user_id', currentUser.id); // SEGURANÇA: só deletar se for do usuário
    
    if (error) throw error;
    
    await loadAppointments();
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    alert('Erro ao excluir agendamento');
  }
};

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadAppointments();
    }
  }, [isAuthenticated, currentUser, loadAppointments]); 

  const selDateAppts = selDate ? apts[fmtDateKey(selDate)] || [] : [];
  const rev = calcRev();

  if (!isAuthenticated) {
  if (showRegister) {
    return (
      <Register 
        onRegisterSuccess={() => {
          setShowRegister(false);
          alert('Conta criada com sucesso! Faça login para continuar.');
        }}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login 
      onLogin={(user) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }} 
      onGoToRegister={() => setShowRegister(true)}
    />
  );
}

   return (
    <div className="min-h-screen bg-gray-50 p-4">
       <div className="max-w-6xl mx-auto">
         <div className="text-center sm:text-left">
           <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
             Minha Agenda - {currentUser?.name}
           </h1>
           <p className="text-gray-600">Sistema de Agendamento Pessoal</p>
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

            {selDate && (
              <div className="flex justify-center mb-4">
                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setCurrentView('appointments')}
                    className={`px-4 py-2 text-sm font-medium ${
                      currentView === 'appointments'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Agendamentos
                  </button>
                  <button
                    onClick={() => setCurrentView('revenue')}
                    className={`px-4 py-2 text-sm font-medium ${
                      currentView === 'revenue'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Receitas
                  </button>
                </div>
              </div>
            )}

            {selDate && currentView === 'appointments' && (
              <AppointmentList 
                date={selDate}
                appointments={selDateAppts}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
              />
            )}

            {selDate && currentView === 'revenue' && (
              <RevenueReport 
                revenueFilter={revFilter}
                onFilterChange={setRevFilter}
                revenueData={rev}
              />
            )}
          </>
        )}

         <AppointmentModal
           showModal={showModal}
           closeModal={closeModal}
           form={form}
           setForm={setForm}
           selTimes={selTimes}
           setSelTimes={setSelTimes}
           selDate={selDate}
           currentUser={currentUser?.name || ''} // MUDANÇA: usar currentUser.name
           editingAppointment={editingAppointment}
           confirmApt={confirmApt}
           fmtCurr={fmtCurr}
           appointments={apts}
           timeSlots={timeSlots}
           isSaving={isSaving}
         />

         <div className="flex justify-center mt-12">
           <button
             onClick={() => {
               setIsAuthenticated(false);
               setCurrentUser(null);
             }}
             className="w-full sm:w-auto px-8 py-4 text-lg bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-bold max-w-xs sm:max-w-none"
           >
             Sair
           </button>
         </div>

      </div>
    </div>
  );
};

export default App;