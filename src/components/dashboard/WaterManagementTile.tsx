import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { WaterManagementMirror } from '../WaterManagementMirror';

interface WaterManagementTileProps {
  isEditMode: boolean;
  consumptionReadings: any[];
  criticalEvents: any[];
}

export const WaterManagementTile: React.FC<WaterManagementTileProps> = ({ isEditMode, consumptionReadings, criticalEvents }) => {
  const pumpAlerts = criticalEvents.filter(e => e.type === 'PUMP' && e.status !== 'NORMAL').length;
  
  return (
    <Link 
      to={isEditMode ? '#' : "/consumption"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#2563eb] to-[#1e40af] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
        <WaterManagementMirror 
          readings={consumptionReadings} 
          events={criticalEvents}
          isEditMode={isEditMode}
          className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
          hideFooter={true}
        />
      </div>

      <div className="flex justify-between items-end relative z-10 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[0.625rem] font-black uppercase tracking-[0.2em] drop-shadow-md text-white">Gestão Hídrica</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[0.5rem] font-bold text-white/50 uppercase tracking-widest">Monitoramento Smart</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[0.5rem] font-black uppercase text-white/50 mb-0.5">Alertas</p>
          <div className="bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-sm font-black drop-shadow-lg text-white">
              {pumpAlerts}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
