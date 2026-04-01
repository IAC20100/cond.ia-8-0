import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';

interface ApprovalsTileProps {
  isEditMode: boolean;
  tickets: any[];
  safeFormatDate: (date: string, options?: any) => string;
}

export const ApprovalsTile: React.FC<ApprovalsTileProps> = ({ isEditMode, tickets, safeFormatDate }) => {
  const recentTickets = tickets
    .filter(t => t.type !== 'TAREFA')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-2xl p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95">
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl border border-white/20">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[0.625rem] font-display font-black uppercase tracking-[0.2em] text-white/90">Reservatório de OS</h3>
            <p className="text-[0.5rem] font-display text-white/40 font-bold uppercase tracking-widest">Últimas Realizadas</p>
          </div>
        </div>
        <Link 
          to={isEditMode ? '#' : "/tickets"} 
          onClick={(e) => isEditMode && e.preventDefault()}
          className="text-[0.5625rem] font-display font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Ver Tudo
        </Link>
      </div>

      <div className="flex-1 space-y-1.5 relative z-10 overflow-hidden">
        {recentTickets.map((ticket) => (
          <Link
            key={ticket.id}
            to={isEditMode ? '#' : `/tickets/${ticket.id}`}
            onClick={(e) => isEditMode && e.preventDefault()}
            className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/item"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                <span className="text-[0.4375rem] font-display font-black text-white/30 uppercase">
                  {safeFormatDate(ticket.date, { weekday: 'short' }).toUpperCase().replace('.', '')}
                </span>
              </div>
              <p className="text-[0.625rem] font-display font-bold text-white/80 truncate group-hover/item:text-white transition-colors">
                {ticket.title || 'Sem título'}
              </p>
            </div>
            <div className={`px-2 py-0.5 rounded-md text-[0.375rem] font-display font-black uppercase tracking-wider shrink-0 bg-white/5 ${
              ticket.status === 'CONCLUIDO' ? 'text-emerald-400' : 
              ticket.status === 'REALIZANDO' || ticket.status === 'AGUARDANDO_MATERIAL' ? 'text-amber-400' : 
              'text-orange-400'
            }`}>
              {ticket.status === 'CONCLUIDO' ? 'Conc.' : ticket.status === 'REALIZANDO' || ticket.status === 'AGUARDANDO_MATERIAL' ? 'Em And.' : 'Pend.'}
            </div>
          </Link>
        ))}
        {tickets.length === 0 && (
          <p className="text-[0.625rem] text-white/20 italic text-center py-4">Nenhuma OS registrada</p>
        )}
      </div>
      
      <span className="hidden md:block text-[0.6875rem] font-display font-black uppercase tracking-[0.2em] relative z-10 text-white/70 mt-2">Gestão de OS</span>
    </div>
  );
};
