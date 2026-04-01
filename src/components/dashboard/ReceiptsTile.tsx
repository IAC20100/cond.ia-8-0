import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

interface ReceiptsTileProps {
  isEditMode: boolean;
  receiptsCount: number;
}

export const ReceiptsTile: React.FC<ReceiptsTileProps> = ({ isEditMode, receiptsCount }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/receipts"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#f0a30a] to-[#d38b00] hover:brightness-110 transition-all p-4 flex flex-col justify-between  group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex justify-center items-center h-full relative z-10">
        <FileText className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex justify-between items-end relative z-10">
        <span className="text-[0.5rem] sm:text-[0.625rem] font-display font-bold uppercase tracking-wider drop-shadow-md truncate mr-1">Recibos</span>
        <span className="text-xl sm:text-2xl font-display font-light drop-shadow-lg shrink-0">{receiptsCount}</span>
      </div>
    </Link>
  );
};
