import { useNavigate } from 'react-router-dom';
import { LineChart, TrendingUp } from 'lucide-react';

interface BudgetForecastTileProps {
  isEditMode: boolean;
}

export function BudgetForecastTile({ isEditMode }: BudgetForecastTileProps) {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => !isEditMode && navigate('/budget-forecast')}
      className={`w-full h-full bg-gradient-to-br from-blue-600/40 to-emerald-600/40 backdrop-blur-2xl p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 transition-all ${isEditMode ? 'cursor-grab' : 'cursor-pointer hover:brightness-110'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-start gap-4 h-full relative z-10">
        <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-sm group-hover:scale-110 transition-transform duration-500">
          <LineChart className="w-10 h-10 text-blue-400" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-[0.625rem] font-display font-black uppercase text-white/70 mb-1 tracking-[0.2em]">Previsão Orçamentária</p>
          <div className="space-y-1">
            <p className="font-display font-black text-xl truncate text-white leading-tight">Projeção 2026</p>
            <div className="flex items-center gap-2 text-blue-300">
              <TrendingUp className="w-4 h-4" />
              <p className="text-sm font-display font-bold">92% de Precisão</p>
            </div>
          </div>
        </div>
      </div>
      <span className="hidden md:block text-[0.6875rem] font-display font-black uppercase tracking-[0.2em] relative z-10 text-white/70 italic">Planejamento Estratégico</span>
    </div>
  );
}
