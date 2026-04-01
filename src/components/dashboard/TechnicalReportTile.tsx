import { Link } from 'react-router-dom';
import { Sparkles, FileText } from 'lucide-react';

interface TechnicalReportTileProps {
  isEditMode: boolean;
}

export function TechnicalReportTile({ isEditMode }: TechnicalReportTileProps) {
  return (
    <Link 
      to={isEditMode ? '#' : "/technical-report"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-indigo-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 rounded-3xl"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/10 to-purple-500/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl rounded-full mix-blend-screen" />
      <div className="flex justify-center items-center h-full relative z-10">
        <div className="relative">
          <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-purple-400 animate-pulse" />
          <FileText className="w-12 h-12 text-indigo-300 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>
      <div className="flex flex-col items-start relative z-10">
        <span className="text-[0.625rem] font-display font-black uppercase tracking-widest text-indigo-200 drop-shadow-md">Criar Relatório</span>
        <span className="text-[0.5rem] font-display text-indigo-400/80 font-bold uppercase tracking-wider mt-0.5">Com Inteligência Artificial</span>
      </div>
    </Link>
  );
}
