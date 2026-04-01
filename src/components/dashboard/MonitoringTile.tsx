import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { MonitoringMirror } from '../MonitoringMirror';

interface MonitoringTileProps {
  isEditMode: boolean;
  criticalEvents: any[];
}

export const MonitoringTile: React.FC<MonitoringTileProps> = ({ isEditMode, criticalEvents }) => {
  const hasCritical = criticalEvents.some(e => e.status === 'CRITICAL');
  
  return (
    <Link 
      to={isEditMode ? '#' : "/monitoring"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className={`w-full h-full p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 transition-all ${
        hasCritical
          ? 'bg-gradient-to-br from-red-600 to-red-800 animate-pulse-subtle'
          : 'bg-gradient-to-br from-[#10b981] to-[#059669]'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
        <MonitoringMirror 
          showLabel={false} 
          isEditMode={isEditMode}
          className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
        />
      </div>

      <div className="flex justify-between items-end relative z-10 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.625rem] font-display font-black uppercase tracking-[0.2em] drop-shadow-md">Controle Remoto</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[0.5rem] font-display font-bold text-white/50 uppercase tracking-widest">Mirror Live</span>
            </div>
          </div>
        </div>
        <span className="text-[0.625rem] font-display font-black uppercase tracking-[0.2em] text-white/70">Acionamento Rápido</span>
      </div>
    </Link>
  );
};
