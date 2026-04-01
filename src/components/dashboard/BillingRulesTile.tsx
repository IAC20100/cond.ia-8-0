import React from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

interface BillingRulesTileProps {
  isEditMode: boolean;
}

export const BillingRulesTile: React.FC<BillingRulesTileProps> = ({ isEditMode }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/billing-rules"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex justify-center items-center h-full relative z-10">
        <Bell className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
      </div>
      <span className="text-[0.625rem] font-display font-bold uppercase tracking-wider relative z-10 drop-shadow-md">Régua de Cobrança</span>
    </Link>
  );
};
