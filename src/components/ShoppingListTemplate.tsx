import React from 'react';
import { SupplyItem, Client, CompanyData } from '../types';
import { format } from 'date-fns';
import { Package, MapPin, Calendar, ClipboardList } from 'lucide-react';

interface ShoppingListTemplateProps {
  items: { supplyItemId: string; quantity: number }[];
  supplyItems: SupplyItem[];
  client?: Client;
  companyData: CompanyData | null;
  companyLogo?: string | null;
  companySignature?: string | null;
}

export const ShoppingListTemplate: React.FC<ShoppingListTemplateProps> = ({ 
  items, 
  supplyItems, 
  client,
  companyData,
  companyLogo,
  companySignature
}) => {
  const date = new Date();

  return (
    <div className="p-8 bg-white text-zinc-900 min-h-[29.7cm] w-[21cm] mx-auto pdf-content" id="shopping-list-pdf">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-zinc-900 pb-8 mb-8">
        <div className="flex items-start gap-6">
          {companyLogo && (
            <img 
              src={companyLogo} 
              alt="Logo" 
              className="w-20 h-20 object-contain rounded-2xl bg-white p-2 border border-zinc-900" 
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2 uppercase">Lista de Compras</h1>
            <div className="flex items-center gap-2 text-zinc-500 font-bold">
              <Calendar className="w-4 h-4" />
              <span>Emitido em: {format(date, 'dd/MM/yyyy HH:mm')}</span>
            </div>
          </div>
        </div>
        {companyData && (
          <div className="text-right">
            <h2 className="text-xl font-black text-zinc-900 uppercase">{companyData.name}</h2>
            <p className="text-sm text-zinc-500 font-medium">{companyData.document}</p>
            <p className="text-sm text-zinc-500 font-medium">{companyData.phone}</p>
          </div>
        )}
      </div>

      {/* Client Info */}
      {client && (
        <div className="bg-white rounded-2xl p-6 mb-8 border border-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-900 rounded-xl text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900">Destino da Entrega</h3>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-zinc-900 mb-1 border-b border-zinc-900 pb-1">Condomínio / Prédio</p>
              <p className="font-bold text-zinc-900 pt-1">{client.name}</p>
            </div>
            <div>
              <p className="text-[0.625rem] font-black uppercase tracking-widest text-zinc-900 mb-1 border-b border-zinc-900 pb-1">Endereço</p>
              <p className="font-bold text-zinc-900 pt-1">{client.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-8 border border-zinc-900 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 mb-6 p-6 pb-0">
          <div className="p-2 bg-zinc-900 rounded-xl text-white">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900">Itens Solicitados</h3>
        </div>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-y border-zinc-900 text-zinc-900">
              <th className="text-left py-4 px-6 text-[0.625rem] font-black uppercase tracking-widest">Item / Produto</th>
              <th className="text-center py-4 px-6 text-[0.625rem] font-black uppercase tracking-widest">Categoria</th>
              <th className="text-right py-4 px-6 text-[0.625rem] font-black uppercase tracking-widest">Quantidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {items.map((qi, idx) => {
              const item = supplyItems.find(si => si.id === qi.supplyItemId);
              return (
                <tr key={qi.supplyItemId} className="bg-white break-inside-avoid">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-zinc-400" />
                      <span className="font-bold text-zinc-900">{item?.name || 'Item não encontrado'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-3 py-1 bg-zinc-200 text-[0.625rem] font-black uppercase tracking-widest rounded-lg text-zinc-600">
                      {item?.category || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-lg font-black text-zinc-900">{qi.quantity}</span>
                    <span className="text-sm text-zinc-400 ml-1 font-bold">{item?.unit}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Notes */}
      <div className="mt-auto pt-12 border-t border-zinc-200 break-inside-avoid">
        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col items-center">
            <p className="text-[0.625rem] font-black uppercase tracking-widest text-zinc-400 mb-4 text-center">Assinatura do Responsável</p>
            <div className="border-b border-zinc-900 h-12 w-full flex items-center justify-center">
              {companySignature && (
                <img 
                  src={companySignature} 
                  alt="Assinatura" 
                  className="max-h-12 object-contain" 
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          </div>
          <div>
            <p className="text-[0.625rem] font-black uppercase tracking-widest text-zinc-400 mb-4 text-center">Data de Recebimento</p>
            <div className="border-b border-zinc-900 h-12 w-full flex items-end justify-center pb-2 font-bold text-zinc-300">
              ____ / ____ / ________
            </div>
          </div>
        </div>
        <p className="text-center text-[0.625rem] text-zinc-400 mt-12 font-medium">
          Este documento é uma solicitação formal de compra gerada pelo sistema de gestão condominial.
        </p>
        {/* Spacer to prevent cutting off at the bottom of the page */}
        <div style={{ height: '40px', color: 'transparent', overflow: 'hidden' }}>.</div>
      </div>
    </div>
  );
};
