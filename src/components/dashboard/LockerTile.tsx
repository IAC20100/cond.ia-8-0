import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';

interface LockerTileProps {
  isEditMode: boolean;
  packages: any[];
}

export const LockerTile: React.FC<LockerTileProps> = ({ isEditMode, packages }) => {
  const pendingPackages = packages.filter(p => p.status === 'PENDING');
  
  return (
    <Link 
      to={isEditMode ? '#' : "/locker"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex justify-center items-center h-full relative z-10">
        <Box className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex flex-col items-center relative z-10">
        <span className="text-[0.625rem] font-display font-bold uppercase tracking-wider drop-shadow-md">Locker</span>
        <span className="text-3xl font-display font-light drop-shadow-lg">{pendingPackages.length}</span>
      </div>
    </Link>
  );
};
