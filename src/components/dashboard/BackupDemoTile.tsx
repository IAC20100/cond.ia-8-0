import React from 'react';
import { Database as DatabaseIcon } from 'lucide-react';

interface BackupDemoTileProps {
  isEditMode: boolean;
  setShowBackupModal: (show: boolean) => void;
}

export const BackupDemoTile: React.FC<BackupDemoTileProps> = ({ isEditMode, setShowBackupModal }) => {
  return (
    <button 
      onClick={() => !isEditMode && setShowBackupModal(true)} 
      className={`w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-left ${isEditMode ? 'cursor-grab' : 'cursor-pointer'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex justify-center items-center h-full relative z-10">
        <DatabaseIcon className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>
      <span className="text-[0.625rem] font-display font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Backup / Demo</span>
    </button>
  );
};
