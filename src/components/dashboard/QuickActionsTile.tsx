import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, UserPlus, DollarSign } from 'lucide-react';

interface QuickActionsTileProps {
  isEditMode: boolean;
}

export const QuickActionsTile: React.FC<QuickActionsTileProps> = ({ isEditMode }) => {
  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 perspective-1000">
      <Link 
        to={isEditMode ? '#' : "/tickets/new"} 
        onClick={(e) => isEditMode && e.preventDefault()}
        title="Nova OS" 
        className="bg-gradient-to-br from-[#ee1111] to-[#cc0000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        <Plus className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-90 transition-transform" />
      </Link>
      <Link 
        to={isEditMode ? '#' : "/quotes"} 
        onClick={(e) => isEditMode && e.preventDefault()}
        title="Novo Orçamento" 
        className="bg-gradient-to-br from-[#ff0097] to-[#d4007d] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        <FileText className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
      </Link>
      <Link 
        to={isEditMode ? '#' : "/clients"} 
        onClick={(e) => isEditMode && e.preventDefault()}
        title="Novo Cliente" 
        className="bg-gradient-to-br from-[#da532c] to-[#b94322] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        <UserPlus className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
      </Link>
      <Link 
        to={isEditMode ? '#' : "/financial"} 
        onClick={(e) => isEditMode && e.preventDefault()}
        title="Novo Gasto" 
        className="bg-gradient-to-br from-[#00a300] to-[#008000] hover:brightness-110 transition-all flex items-center justify-center relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-90 group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
        <DollarSign className="w-6 h-6 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
      </Link>
    </div>
  );
};
