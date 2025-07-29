// frontend/src/types/appointment.ts
export interface Appointment {
  id: number;
  times: string[];
  type: string;
  client_name: string;
  value: number;
  observations: string;
  date: string;
  user_id: string; 
}