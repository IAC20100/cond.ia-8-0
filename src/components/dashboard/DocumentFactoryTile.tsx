import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck } from 'lucide-react';

interface DocumentFactoryTileProps {
  isEditMode: boolean;
}

export const DocumentFactoryTile: React.FC<DocumentFactoryTileProps> = ({ isEditMode }) => {
  return (
    <Link 
      to={isEditMode ? '#' : "/document-factory"} 
      onClick={(e) => isEditMode && e.preventDefault()}
      className="w-full h-full bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] hover:brightness-110 transition-all p-4 flex flex-col justify-between group relative overflow-hidden border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] active:scale-95 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
      <div className="flex items-start gap-4 h-full relative z-10">
        <div className="p-3 bg-white/20 rounded-2xl border border-white/20 shadow-sm group-hover:scale-110 transition-transform duration-500">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-[0.625rem] font-display font-black uppercase text-white/70 mb-1 tracking-[0.2em]">Central de Documentos</p>
          <div className="space-y-1">
            <p className="font-display font-black text-xl truncate text-white leading-tight">Central de Documentos</p>
            <div className="flex items-center gap-2 text-white/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-display font-bold text-white">Atas, Editais e Contratos</p>
            </div>
          </div>
        </div>
      </div>
      <span className="text-[0.6875rem] font-display font-black uppercase tracking-[0.2em] relative z-10 text-white/70">Base Jurídica Completa</span>
    </Link>
  );
};
