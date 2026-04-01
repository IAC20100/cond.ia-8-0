import React from 'react';
import { Link } from 'react-router-dom';
import { Columns } from 'lucide-react';
import { KanbanMirror } from '../KanbanMirror';

interface KanbanTileProps {
  isEditMode: boolean;
  tickets: any[];
}

export const KanbanTile: React.FC<KanbanTileProps> = ({ isEditMode, tickets }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/kanban"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#60a917] to-[#4d8712] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-hidden">
        <KanbanMirror 
          tickets={tickets} 
          showLabel={false} 
          isEditMode={isEditMode}
          className="!p-0 !bg-transparent !border-none !shadow-none !rounded-none w-full max-w-[260px]" 
        />
      </div>

      <div className="flex justify-between items-end relative z-10 mt-2 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="p-1.5 md:p-2 bg-white/20 rounded-xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500 shrink-0">
            <Columns className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[0.5rem] md:text-[0.625rem] font-display font-black uppercase tracking-[0.2em] drop-shadow-md truncate">Kanban</span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[0.375rem] md:text-[0.5rem] font-display font-bold text-white/50 uppercase tracking-widest truncate">Mirror Live</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2 bg-black/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-white/10 backdrop-blur-md shrink-0">
          <span className="text-sm md:text-xl font-display font-black drop-shadow-lg">{tickets.filter(t => t.type !== 'TAREFA').length}</span>
        </div>
      </div>
    </Link>
  );
};
