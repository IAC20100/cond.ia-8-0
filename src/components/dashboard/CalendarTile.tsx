import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { safeFormatDate } from '../../utils/dateUtils';
import { Appointment } from '../../types';

interface CalendarTileProps {
  isEditMode: boolean;
  nextAppointments: Appointment[];
}

export function CalendarTile({ isEditMode, nextAppointments }: CalendarTileProps) {
  return (
    <Link 
      to={isEditMode ? '#' : "/calendar"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all p-3 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2">
          <CalendarIcon className="w-5 h-5 text-white/70" />
          <p className="text-[0.625rem] font-display font-black uppercase text-white/50 tracking-[0.2em] truncate">Agenda</p>
        </div>
        
        <div className="flex-1 space-y-2 overflow-hidden">
          {nextAppointments.length > 0 ? (
            nextAppointments.map((apt) => (
              <div key={apt.id} className="border-l-2 border-white/20 pl-2 py-1 hover:bg-white/5 transition-colors rounded-r-lg">
                <p className="text-[0.6875rem] font-bold truncate leading-tight text-white/90">{apt.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2 h-2 text-white/40" />
                  <p className="text-[0.5625rem] text-white/50 font-medium">
                    {apt.start ? (
                      `${safeFormatDate(apt.start, { day: '2-digit', month: 'short' })} • ${new Date(apt.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace('Invalid Date', 'Data inválida')}`
                    ) : (
                      'Horário não definido'
                    )}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
              <CalendarIcon className="w-8 h-8 mb-1" />
              <p className="text-[0.625rem] font-bold uppercase tracking-widest">Sem compromissos</p>
            </div>
          )}
        </div>
      </div>
      <span className="text-[0.6875rem] font-display font-black uppercase tracking-[0.2em] relative z-10 text-white/70 italic">Próximos Eventos</span>
    </Link>
  );
}
