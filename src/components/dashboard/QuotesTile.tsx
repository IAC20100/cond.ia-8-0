import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotesMirror } from '../QuotesMirror';

interface QuotesTileProps {
  isEditMode: boolean;
  quotes: any[];
  clients: any[];
}

export const QuotesTile: React.FC<QuotesTileProps> = ({ isEditMode, quotes, clients }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => !isEditMode && navigate('/quotes')}
      className={`w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 ${isEditMode ? 'cursor-grab' : 'cursor-pointer'}`}
    >
      <QuotesMirror 
        quotes={quotes} 
        clients={clients}
        isEditMode={isEditMode}
        className="!p-4 !bg-transparent !border-none !shadow-none !rounded-none w-full h-full" 
        showLabel={true}
      />
    </div>
  );
};
