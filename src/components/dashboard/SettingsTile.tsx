import React from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface SettingsTileProps {
  isEditMode: boolean;
}

export const SettingsTile: React.FC<SettingsTileProps> = ({ isEditMode }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/settings"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#52525b] to-[#3f3f46] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex justify-center items-center h-full relative z-10">
        <Settings className="w-12 h-12 text-white drop-shadow-lg group-hover:rotate-45 transition-transform duration-500" />
      </div>
      <span className="text-[0.625rem] font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Ajustes</span>
    </Link>
  );
};
