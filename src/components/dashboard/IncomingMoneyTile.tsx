import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { IncomingMoneyMirror } from '../IncomingMoneyMirror';

interface IncomingMoneyTileProps {
  isEditMode: boolean;
  receipts: any[];
  payments: any[];
}

export const IncomingMoneyTile: React.FC<IncomingMoneyTileProps> = ({ isEditMode, receipts, payments }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => !isEditMode && navigate('/receipts')}
      className={`w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 ${isEditMode ? 'cursor-grab' : 'cursor-pointer'}`}
    >
      <IncomingMoneyMirror 
        receipts={receipts} 
        payments={payments}
        isEditMode={isEditMode}
        className="!p-4 !bg-transparent !border-none !shadow-none !rounded-none w-full h-full" 
        hideFooter={true}
      />
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
        <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/20 shadow-sm">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="text-[0.625rem] font-display font-black uppercase tracking-[0.2em] text-white/70">Entradas de Dinheiro</span>
      </div>
    </div>
  );
};
