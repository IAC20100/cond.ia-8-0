import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketsMirror } from '../TicketsMirror';

interface TicketsTileProps {
  isEditMode: boolean;
  tickets: any[];
}

export const TicketsTile: React.FC<TicketsTileProps> = ({ isEditMode, tickets }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => !isEditMode && navigate('/tickets')}
      className={`w-full h-full bg-slate-900/40 backdrop-blur-2xl hover:brightness-110 transition-all flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-2xl active:scale-95 ${isEditMode ? 'cursor-grab' : 'cursor-pointer'}`}
    >
      <TicketsMirror 
        tickets={tickets} 
        isEditMode={isEditMode}
        className="!p-4 !bg-transparent !border-none !shadow-none !rounded-none w-full h-full" 
        showLabel={true}
      />
    </div>
  );
};
