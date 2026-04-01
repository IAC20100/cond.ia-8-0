import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, AlertCircle } from 'lucide-react';

interface QrReportsTileProps {
  isEditMode: boolean;
  tickets: any[];
}

export const QrReportsTile: React.FC<QrReportsTileProps> = ({ isEditMode, tickets }) => {
  const pendingReports = tickets.filter(t => t.status === 'PENDENTE_APROVACAO' && t.reportedBy);
  
  return (
    <Link 
      to={isEditMode ? '#' : "/qr-reports"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className={`w-full h-full p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 transition-all ${
        pendingReports.length > 0 
          ? 'bg-gradient-to-br from-amber-500 to-amber-700 animate-pulse-subtle' 
          : 'bg-gradient-to-br from-zinc-800 to-zinc-900'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-start gap-2 md:gap-4 h-full relative z-10">
        <div className="p-1.5 md:p-3 bg-white/20 rounded-xl md:rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
          <MessageSquare className="w-6 h-6 md:w-10 md:h-10 text-white" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-[0.5rem] md:text-[0.625rem] font-black uppercase text-white/70 mb-0.5 md:mb-1 tracking-[0.2em] truncate">Relatos de Moradores</p>
          <div className="space-y-0.5 md:space-y-1">
            <p className="font-black text-xs md:text-xl truncate text-white leading-tight">Mensagens QR Code</p>
            <div className="flex items-center gap-1.5 md:gap-2 text-white/80">
              {pendingReports.length > 0 ? (
                <>
                  <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse shrink-0" />
                  <p className="text-[0.625rem] md:text-sm font-bold text-white truncate">
                    {pendingReports.length} novos relatos
                  </p>
                </>
              ) : (
                <p className="text-[0.625rem] md:text-sm font-medium truncate">Nenhuma mensagem nova</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <span className="hidden md:block text-[0.6875rem] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Gestão de Chamados</span>
    </Link>
  );
};
