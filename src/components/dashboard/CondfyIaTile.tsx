import React from 'react';
import { ExternalLink, Maximize2 } from 'lucide-react';

interface CondfyIaTileProps {
  isEditMode: boolean;
}

export const CondfyIaTile: React.FC<CondfyIaTileProps> = ({ isEditMode }) => {
  return (
    <a 
      href="https://web.condfy.com.br/login"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => isEditMode && e.preventDefault()}
      className={`w-full h-full p-4 flex flex-col justify-between group relative overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,255,128,0.2)] hover:shadow-[0_0_50px_rgba(0,255,128,0.4)] active:scale-95 text-white transition-all duration-500 rounded-[2.5rem] ${isEditMode ? 'cursor-grab' : 'cursor-pointer'}`}
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)',
      }}
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      {/* Animated gradient sweep */}
      <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out -skew-x-12 pointer-events-none" />
      
      {/* Glowing orbs */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/30 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-400/50 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/30 blur-[50px] rounded-full translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-400/50 transition-all duration-700" />
      
      <div className="absolute top-4 right-4 z-10">
        <ExternalLink className="w-4 h-4 text-emerald-300 opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex justify-center items-center h-full relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 rounded-full" />
          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl relative z-10 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Maximize2 className="w-10 h-10 text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-[0.75rem] font-display font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-indigo-300 drop-shadow-md">CONDFY.IA Web</span>
        <span className="text-[0.5rem] font-display font-bold text-white/50 tracking-widest mt-1">SISTEMA EXTERNO</span>
      </div>
    </a>
  );
};
