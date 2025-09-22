import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import AppointmentList from './AppointmentList';
import RevenueReport from './RevenueReport';
import AppointmentModal from './AppointmentModal';
import FloatingActionButton from './ui/FloatingActionButton';
import LoadingDots from './ui/LoadingDots';
import { AlertModal, ConfirmModal } from './ui/Modal';
import { useAppointments } from '../hooks/useAppointments';
import { useAlert } from '../hooks/useAlert';
import { useConfirm } from '../hooks/useConfirm';
import { type Appointment } from '../types/appointment';
import { type User } from '../types/user';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selTimes, setSelTimes] = useState<string[]>([]);
  const [form, setForm] = useState({
    type: "",
    clientName: "",
    value: "",
    observations: "",
    phone: ""
  });
  const [revFilter, setRevFilter] = useState<{
    period: string;
    customStartDate?: string;
    customEndDate?: string;
  }>({
    period: "Dia",
    customStartDate: undefined,
    customEndDate: undefined
  });
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentView, setCurrentView] = useState<'appointments' | 'revenue'>('appointments');
  
  const { appointments, isLoading, loadAppointments } = useAppointments(currentUser);
  const { alertState, showAlert, closeAlert } = useAlert();
  const { confirmState, showConfirm, closeConfirm } = useConfirm();

  const fmtCurr = (v: string) => {
    if (!v) return '';
    const digits = v.replace(/\D/g, '');
    if (!digits) return '';
    const number = parseInt(digits) / 100;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const parseCurr = (v: string) => parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const h = Math.floor(i / 2) + 7;
    return `${h.toString().padStart(2, '0')}:${i % 2 ? '30' : '00'}`;
  });

  const fmtDateKey = (d: Date) => d.toISOString().split('T')[0];

  const createDateFromString = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const toggleTime = (t: string) => {
    if (selDate) {
      const key = fmtDateKey(selDate);
      const isBooked = appointments[key]?.some(app => app.times.includes(t));
      if (isBooked) return;
    }
    setSelTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t].sort());
  };

  const openNewApt = () => {
    if (!selDate) {
      showAlert('Atenção', 'Selecione uma data primeiro', 'warning');
      return;
    }
    if (selTimes.length === 0) {
      showAlert('Atenção', 'Selecione pelo menos um horário', 'warning');
      return;
    }
    setEditingAppointment(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setForm({ type: "", clientName: "", value: "", observations: "", phone: "" });
    setSelTimes([]);
    setEditingAppointment(null);
  };

  const confirmApt = async () => {
    if (!form.type || !form.clientName || !selDate || !currentUser) {
      showAlert('Campos obrigatórios', 'Preencha todos os campos obrigatórios (Tipo e Nome do Cliente)', 'warning');
      return;
    }

    setIsSaving(true);

    const newApt = {
      times: selTimes,
      type: form.type,
      client_name: form.clientName,
      value: form.value ? parseCurr(form.value) : 0,
      observations: form.observations,
      phone: form.phone,
      date: selDate.toISOString(),
      user_id: currentUser.id
    };

    try {
      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(newApt)
          .eq('id', editingAppointment.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        showAlert('Sucesso', 'Agendamento atualizado com sucesso!', 'success');
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert([newApt]);

        if (error) throw error;
        showAlert('Sucesso', 'Agendamento criado com sucesso!', 'success');
      }

      await loadAppointments();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      showAlert('Erro', 'Erro ao salvar agendamento. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const calcRev = () => {
    const refDate = selDate || new Date();
    const ref = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

    const allApts = Object.values(appointments).flat();
    const filtered = allApts.filter(a => {
      const aptDate = new Date(a.date);
      const apt = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());

      switch (revFilter.period) {
        case "Dia":
          return apt.getTime() === ref.getTime();
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
        case "Personalizado": {
          if (!revFilter.customStartDate || !revFilter.customEndDate) return false;

          const startDate = createDateFromString(revFilter.customStartDate);
          const endDate = createDateFromString(revFilter.customEndDate);

          return apt >= startDate && apt <= endDate;
        }
        default:
          return false;
      }
    });

    const laserAppointments = filtered.filter(a => a.type === "Laser");
    const ceraAppointments = filtered.filter(a => a.type === "Cera");

    return {
      total: filtered.reduce((s, a) => s + a.value, 0),
      laser: laserAppointments.reduce((s, a) => s + a.value, 0),
      cera: ceraAppointments.reduce((s, a) => s + a.value, 0),
      count: filtered.length,
      laserCount: laserAppointments.length,
      ceraCount: ceraAppointments.length
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
      value: appointment.value ? appointment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '',
      observations: appointment.observations,
      phone: appointment.phone || ''
    });
    setSelTimes([...appointment.times]);

    const appointmentDate = new Date(appointment.date);
    setSelDate(appointmentDate);

    setShowModal(true);
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    showConfirm(
      'Excluir Agendamento',
      'Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.',
      async () => {
        try {
          const { error } = await supabase
            .from('appointments')
            .delete()
            .eq('id', appointmentId)
            .eq('user_id', currentUser.id);

          if (error) throw error;

          await loadAppointments();
          showAlert('Sucesso', 'Agendamento excluído com sucesso!', 'success');
        } catch (error) {
          console.error('Erro ao excluir agendamento:', error);
          showAlert('Erro', 'Erro ao excluir agendamento. Tente novamente.', 'error');
        }
      },
      'danger'
    );
  };

  const selDateAppts = selDate ? appointments[fmtDateKey(selDate)] || [] : [];
  const rev = calcRev();


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 animate-slideDown">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Minha Agenda
              </h1>
              <p className="text-gray-600 mt-2">Bem-vindo(a), {currentUser?.name}</p>
            </div>
            <button
              onClick={() => {
                showConfirm(
                  'Sair do Sistema',
                  'Você tem certeza que deseja sair?',
                  onLogout,
                  'info'
                );
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingDots size="large" text="Carregando agendamentos..." />
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <Calendar
                currentMonth={currentMonth}
                onPrevMonth={() => navMonth(-1)}
                onNextMonth={() => navMonth(1)}
                selectedDate={selDate}
                onDateSelect={setSelDate}
                appointments={appointments}
              />

              {selDate && (
                <>
                  <TimeSlots
                    date={selDate}
                    timeSlots={timeSlots}
                    selectedTimes={selTimes}
                    appointments={appointments}
                    onTimeToggle={toggleTime}
                  />

                  <div className="flex justify-center">
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white shadow-soft overflow-hidden">
                      <button
                        onClick={() => setCurrentView('appointments')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                          currentView === 'appointments'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Agendamentos
                      </button>
                      <button
                        onClick={() => setCurrentView('revenue')}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${
                          currentView === 'revenue'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Receitas
                      </button>
                    </div>
                  </div>

                  {/* Content Views */}
                  <div className="animate-fadeIn">
                    {currentView === 'appointments' ? (
                      <AppointmentList
                        date={selDate}
                        appointments={selDateAppts}
                        onEdit={handleEditAppointment}
                        onDelete={handleDeleteAppointment}
                      />
                    ) : (
                      <RevenueReport
                        revenueFilter={revFilter}
                        onFilterChange={setRevFilter}
                        revenueData={rev}
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Floating Action Button - só aparece quando há horários selecionados */}
            <FloatingActionButton
              onClick={openNewApt}
              disabled={false}
              show={selTimes.length > 0}
            />

            {/* Appointment Modal */}
            <AppointmentModal
              showModal={showModal}
              closeModal={closeModal}
              form={form}
              setForm={setForm}
              selTimes={selTimes}
              setSelTimes={setSelTimes}
              selDate={selDate}
              currentUser={currentUser?.name || ''}
              editingAppointment={editingAppointment}
              confirmApt={confirmApt}
              fmtCurr={fmtCurr}
              appointments={appointments}
              timeSlots={timeSlots}
              isSaving={isSaving}
            />

            {/* Alert Modal */}
            <AlertModal
              isOpen={alertState.isOpen}
              onClose={closeAlert}
              onConfirm={alertState.onConfirm}
              title={alertState.title}
              message={alertState.message}
              type={alertState.type}
            />

            {/* Confirm Modal */}
            <ConfirmModal
              isOpen={confirmState.isOpen}
              onClose={closeConfirm}
              onConfirm={confirmState.onConfirm}
              title={confirmState.title}
              message={confirmState.message}
              variant={confirmState.variant}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;