import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Truck } from 'lucide-react';

interface RenovationsMovesTileProps {
  isEditMode: boolean;
  renovations: any[];
  moves: any[];
}

export const RenovationsMovesTile: React.FC<RenovationsMovesTileProps> = ({ isEditMode, renovations, moves }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/renovations-moves"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-start gap-4 h-full relative z-10">
        <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
          <Hammer className="w-10 h-10 text-white" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-[0.625rem] font-black uppercase text-white/70 mb-1 tracking-[0.2em]">Obras & Mudanças</p>
          <div className="space-y-1">
            <p className="font-black text-xl truncate text-white leading-tight">Gestão de Fluxo</p>
            <div className="flex items-center gap-2 text-white/80">
              <Truck className="w-4 h-4 text-white" />
              <p className="text-sm font-bold text-white">{renovations.length + moves.length} Solicitações</p>
            </div>
          </div>
        </div>
      </div>
      <span className="text-[0.6875rem] font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Agendamentos</span>
    </Link>
  );
};
