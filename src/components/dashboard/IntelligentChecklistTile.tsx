import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, ShieldCheck } from 'lucide-react';

interface IntelligentChecklistTileProps {
  isEditMode: boolean;
  overdueMaintenances: number;
}

export const IntelligentChecklistTile: React.FC<IntelligentChecklistTileProps> = ({ isEditMode, overdueMaintenances }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/intelligent-checklist"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#004a7c] to-[#002a4c] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-start gap-2 md:gap-4 h-full relative z-10">
        <div className="p-1.5 md:p-3 bg-white/10 rounded-xl md:rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
          <ClipboardCheck className="w-6 h-6 md:w-10 md:h-10 text-white" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-[0.5rem] md:text-[0.625rem] font-display font-black uppercase text-white/70 mb-0.5 md:mb-1 tracking-[0.2em] truncate">Manutenção Preventiva</p>
          <div className="space-y-0.5 md:space-y-1">
            <p className="font-display font-black text-xs md:text-xl truncate text-white leading-tight">Manutenção preventiva</p>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="flex-1 h-1 md:h-1.5 bg-white/20 rounded-full overflow-hidden max-w-[60px] md:max-w-[100px]">
                <div 
                  className={`h-full transition-all duration-1000 ${overdueMaintenances > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: overdueMaintenances > 0 ? '40%' : '100%' }}
                />
              </div>
              <p className={`text-[0.5rem] md:text-xs font-display font-bold ${overdueMaintenances > 0 ? 'text-amber-400' : 'text-emerald-400'} truncate`}>
                {overdueMaintenances > 0 ? `${overdueMaintenances} pendentes` : '100% em dia'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end relative z-10">
        <span className="hidden md:block text-[0.6875rem] font-display font-black uppercase tracking-[0.2em] text-white/70">Manutenção Preventiva</span>
        <div className="flex items-center gap-1 md:gap-2 bg-white/10 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border border-white/10 shrink-0">
          <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400" />
          <span className="text-[0.4375rem] md:text-[0.5625rem] font-display font-bold uppercase tracking-tight text-white/70">Conformidade Legal</span>
        </div>
      </div>
    </Link>
  );
};
