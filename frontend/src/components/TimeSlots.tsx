import { Clock } from "lucide-react";
import type { Appointment } from "../types/appointment";

interface TimeSlotsProps {
  date: Date | null;
  timeSlots: string[];
  selectedTimes: string[];
  appointments: Record<string, Appointment[]>;
  onTimeToggle: (time: string) => void;
  onNewAppointment: () => void;
}

const TimeSlots = ({ 
  date, 
  timeSlots, 
  selectedTimes, 
  appointments, 
  onTimeToggle,
  onNewAppointment
}: TimeSlotsProps) => {
  
  const fmtDateKey = (d: Date) => d.toISOString().split('T')[0];
  
  const isBooked = (t: string) => date ? 
    !!appointments[fmtDateKey(date)]?.some(a => a.times.includes(t)) : false;

  const getAptInfo = (t: string) => date ? 
    appointments[fmtDateKey(date)]?.find(a => a.times.includes(t)) || null : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-center mb-6">
        <button onClick={onNewAppointment} disabled={!selectedTimes.length}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md ${
            !selectedTimes.length ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 
            'bg-purple-600 text-white hover:bg-purple-700'
          }`}>
          Novo Agendamento
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Clock size={24} />
        <h2 className="text-2xl font-bold">
          Horários - {date ? date.toLocaleDateString('pt-BR') : ''}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map(time => {
          const booked = isBooked(time);
          const selected = selectedTimes.includes(time);
          const aptInfo = getAptInfo(time);
          
          return (
            <div key={time} className="relative">
              <button onClick={() => onTimeToggle(time)} disabled={booked}
                className={`w-full p-3 rounded-lg font-medium text-sm shadow-sm transition-all duration-200 ${
                  booked ? 'bg-red-500 text-white cursor-not-allowed' :
                  selected ? 'bg-gray-700 text-white shadow-lg scale-105' : 
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}>
                {time}
              </button>
              {booked && aptInfo && (
                <div className="mt-1 text-xs text-center text-gray-600 font-medium">
                  {aptInfo.client_name}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedTimes.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <p className="text-gray-700 font-medium">
            Horários selecionados: {selectedTimes.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimeSlots;