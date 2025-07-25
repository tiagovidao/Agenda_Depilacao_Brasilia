import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Appointment } from "../types/appointment";

interface CalendarProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  appointments: Record<string, Appointment[]>;
}

const Calendar = ({ 
  currentMonth, 
  onPrevMonth, 
  onNextMonth, 
  selectedDate, 
  onDateSelect, 
  appointments 
}: CalendarProps) => {
  
  const fmtDateKey = (d: Date) => d.toISOString().split('T')[0];
  
  const genCalDays = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const start = new Date(y, m, 1);
    start.setDate(start.getDate() - start.getDay());
    
    return Array.from({length: 42}, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const calDays = genCalDays();

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">
          {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['D','S','T','Q','Q','S','S'].map((d,i) => (
          <div key={i} className="text-center text-sm font-medium text-gray-500 p-2">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calDays.map((d,i) => {
          const sameMonth = d.getMonth() === currentMonth.getMonth();
          const selected = selectedDate && d.toDateString() === selectedDate.toDateString();
          const today = d.toDateString() === new Date().toDateString();
          const hasApt = !!appointments[fmtDateKey(d)]?.length;
          
          return (
            <button key={i} onClick={() => onDateSelect(d)}
              className={`relative p-2 text-sm rounded-lg transition-colors ${
                !sameMonth ? 'text-gray-300' : 
                selected ? 'bg-gray-700 text-white' :
                today ? 'bg-blue-500 text-white' : 
                'text-gray-700 hover:bg-gray-100'
              }`}>
              {d.getDate()}
              {hasApt && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;