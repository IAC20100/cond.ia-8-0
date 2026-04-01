import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode } from 'lucide-react';

interface QrCodesTileProps {
  isEditMode: boolean;
}

export const QrCodesTile: React.FC<QrCodesTileProps> = ({ isEditMode }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/qr-codes"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#00b7c3] to-[#008b94] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex justify-center items-center h-full relative z-10">
        <QrCode className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex justify-between items-end relative z-10">
        <span className="text-[0.5rem] sm:text-[0.625rem] font-bold uppercase tracking-wider drop-shadow-md truncate mr-1">QR Codes</span>
        <span className="text-xl sm:text-2xl font-light drop-shadow-lg shrink-0">Gerir</span>
      </div>
    </Link>
  );
};
