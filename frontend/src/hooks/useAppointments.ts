import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { type Appointment } from '../types/appointment';
import { type User } from '../types/user';

type AppointmentsByDate = Record<string, Appointment[]>;

export function useAppointments(currentUser: User | null) {
  const [appointments, setAppointments] = useState<AppointmentsByDate>({});
  const [isLoading, setIsLoading] = useState(false);

  const loadAppointments = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', currentUser.id);

      if (error) throw error;

      const grouped: AppointmentsByDate = {};
      (data || []).forEach((apt: Appointment) => {
        const dateKey = apt.date.split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(apt);
      });

      setAppointments(grouped);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAppointments();
    }
  }, [currentUser]);

  return { appointments, isLoading, loadAppointments };
}
