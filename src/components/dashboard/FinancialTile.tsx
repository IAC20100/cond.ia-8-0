import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

interface FinancialTileProps {
  isEditMode: boolean;
  saldo: number;
}

export function FinancialTile({ isEditMode, saldo }: FinancialTileProps) {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full bg-slate-900/40 backdrop-blur-2xl p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 transition-all">
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <div 
          className={`flex-1 flex flex-col justify-center items-center p-4 transition-all group/fin border border-white/5 rounded-2xl ${isEditMode ? 'cursor-grab' : 'cursor-pointer hover:bg-white/5'}`} 
          onClick={() => !isEditMode && navigate('/financial')}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-[0.625rem] font-display font-black uppercase text-white/40 mb-2 tracking-[0.3em]">Saldo Atual</p>
            <span className="text-5xl font-display font-black text-white group-hover/fin:text-emerald-400 transition-all duration-500 scale-100 group-hover/fin:scale-110">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(saldo)}
            </span>
            <div className="mt-6 flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              <span className="text-xs font-display font-black text-emerald-400 uppercase tracking-[0.2em]">Fluxo de Caixa Ativo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end relative z-10 mt-2 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="p-1.5 md:p-2 bg-white/10 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[0.5rem] md:text-[0.625rem] font-display font-black uppercase tracking-[0.2em] drop-shadow-md truncate">Gestão Financeira</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[0.375rem] md:text-[0.5rem] font-bold text-white/50 uppercase tracking-widest truncate">Controle de Fluxo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
