import { type Appointment } from '../types/appointment';

export const groupAppointmentsByDate = (
  appointments: Appointment[]
): Record<string, Appointment[]> => {
  const grouped: Record<string, Appointment[]> = {};
  
  appointments.forEach(appointment => {
    const dateKey = appointment.date.split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(appointment);
  });
  
  return grouped;
};