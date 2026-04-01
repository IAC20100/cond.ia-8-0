import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Receipt } from '../types';
import { Download, Printer, FileText, FileCheck, Calendar, DollarSign, User, Trash2, Search, Share2, ShieldCheck } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { safeFormatDate } from '../utils/dateUtils';
import { generatePdf, sharePdf, printPdf } from '../utils/pdfGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Receipts() {
  const navigate = useNavigate();
  const { clients, receipts, companyLogo, companyData, companySignature, addReceipt, deleteReceipt } = useStore();
  const [clientId, setClientId] = useState('');
  const [value, setValue] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingReceipt, setDownloadingReceipt] = useState<Receipt | null>(null);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === clientId);

  const filteredReceipts = receipts
    .filter(r => {
      const client = clients.find(c => c.id === r.clientId);
      const searchStr = `${client?.name} ${r.description} ${r.value}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });

  const handleSaveAndDownload = async () => {
    if (!clientId || value <= 0 || !description || !date) {
      toast.error('Preencha todos os campos obrigatórios (Cliente, Valor, Descrição e Data).');
      return;
    }

    if (!receiptRef.current) return;

    // Garantir que a página está no topo para evitar problemas de renderização
    window.scrollTo(0, 0);

    setIsGenerating(true);
    try {
      // Save to store
      addReceipt({
        clientId,
        value,
        description,
        date
      });

      // Generate PDF
      const safeName = selectedClient?.name ? selectedClient.name.replace(/\s+/g, '_') : 'Cliente';
      const fileName = `Recibo_${safeName}_${date}.pdf`;
      
      await generatePdf(receiptRef.current, fileName);
      
      // Reset form
      setClientId('');
      setValue(0);
      setDescription('');
      toast.success('Recibo gerado e salvo com sucesso!');
      
    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      toast.error('Erro ao gerar PDF. Tente usar o botão "Imprimir" no topo da página como alternativa.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndShare = async () => {
    if (!clientId || value <= 0 || !description || !date) {
      toast.error('Preencha todos os campos obrigatórios (Cliente, Valor, Descrição e Data).');
      return;
    }

    if (!receiptRef.current) return;

    window.scrollTo(0, 0);
    setIsGenerating(true);

    try {
      // Save to store
      addReceipt({
        clientId,
        value,
        description,
        date
      });

      // Share PDF
      const safeName = selectedClient?.name ? selectedClient.name.replace(/\s+/g, '_') : 'Cliente';
      const fileName = `Recibo_${safeName}_${date}.pdf`;
      await sharePdf(receiptRef.current, fileName);
      
      // Reset form
      setClientId('');
      setValue(0);
      setDescription('');
      toast.success('Recibo compartilhado e salvo com sucesso!');
      
    } catch (error: any) {
      console.error('Erro ao compartilhar recibo:', error);
      const errorMsg = error?.message || 'Erro desconhecido';
      if (errorMsg.includes('Compartilhamento não suportado')) {
        toast.error(errorMsg);
      } else {
        toast.error(`Erro ao compartilhar: ${errorMsg}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadExisting = async (receipt: Receipt) => {
    setDownloadingReceipt(receipt);
    
    // Garantir que a página está no topo para evitar problemas de renderização
    window.scrollTo(0, 0);

    setIsGenerating(true);
    
    // Wait for state to update and DOM to render
    setTimeout(async () => {
      if (downloadRef.current) {
        try {
          const client = clients.find(c => c.id === receipt.clientId);
          const safeName = client?.name ? client.name.replace(/\s+/g, '_') : 'Cliente';
          const fileName = `Recibo_${safeName}_${receipt.date}.pdf`;
          await generatePdf(downloadRef.current, fileName);
          toast.success('Download iniciado!');
        } catch (error) {
          console.error('Erro ao baixar recibo:', error);
          toast.error('Erro ao gerar PDF do recibo antigo.');
        }
      }
      setDownloadingReceipt(null);
      setIsGenerating(false);
    }, 800);
  };

  const handleShareReceipt = async (receipt: Receipt) => {
    setDownloadingReceipt(receipt);
    window.scrollTo(0, 0);
    setIsGenerating(true);
    
    setTimeout(async () => {
      if (downloadRef.current) {
        try {
          const client = clients.find(c => c.id === receipt.clientId);
          const safeName = client?.name ? client.name.replace(/\s+/g, '_') : 'Cliente';
          const fileName = `Recibo_${safeName}_${receipt.date}.pdf`;
          await sharePdf(downloadRef.current, fileName);
          toast.success('Compartilhamento iniciado!');
        } catch (error: any) {
          console.error('Erro ao compartilhar recibo:', error);
          const errorMsg = error?.message || 'Erro desconhecido';
          if (errorMsg.includes('Compartilhamento não suportado')) {
            toast.error(errorMsg);
          } else {
            toast.error(`Erro ao compartilhar: ${errorMsg}`);
          }
        }
      }
      setDownloadingReceipt(null);
      setIsGenerating(false);
    }, 800);
  };

  const handleDeleteReceipt = (id: string) => {
    setReceiptToDelete(id);
  };

  const confirmDelete = () => {
    if (receiptToDelete) {
      deleteReceipt(receiptToDelete);
      toast.success('Recibo excluído com sucesso!');
      setReceiptToDelete(null);
    }
  };

  const handlePrint = async () => {
    if (!receiptRef.current) return;
    
    setIsGenerating(true);
    try {
      await printPdf(receiptRef.current, `Recibo-${Date.now()}`);
    } catch (error) {
      console.error('Error printing PDF:', error);
      toast.error('Erro ao preparar impressão');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full mb-6"
          />
          <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">Gerando Recibo...</p>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 print:hidden">
        <div className="flex items-center gap-6">
          <BackButton />
          <div>
            <h1 className="text-6xl font-display font-light tracking-tight">Recibos</h1>
            <p className="text-xl opacity-60 mt-2 font-display font-light">Gere e salve recibos profissionais em PDF</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all"
          >
            <Printer className="w-5 h-5" /> 
            <span className="font-medium">Imprimir</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveAndDownload}
            disabled={isGenerating || !clientId || value <= 0 || !description || !date}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 flex items-center gap-3 border border-white/20 backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> 
            <span className="text-lg font-medium">{isGenerating ? 'Gerando...' : 'Salvar e Baixar'}</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveAndShare}
            disabled={isGenerating || !clientId || value <= 0 || !description || !date}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 flex items-center gap-3 border border-emerald-400/20 backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-lg shadow-emerald-500/20"
          >
            <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
            <span className="text-lg font-medium">{isGenerating ? 'Gerando...' : 'Salvar e Compartilhar'}</span>
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 print:hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-3 rounded-xl">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight">Dados do Recibo</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Cliente *
              </label>
              <select 
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl px-4 py-3 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#004a7c]">Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#004a7c]">{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">R$</span>
                <input 
                  type="number" 
                  value={value || ''}
                  onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-white/20"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Data *
              </label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl px-4 py-3 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-white/50 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Referente a *
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl px-4 py-3 outline-none transition-all min-h-[150px] resize-none placeholder:text-white/20"
                placeholder="Ex: Serviços de manutenção preventiva e corretiva nos portões eletrônicos..."
              />
            </div>
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/5 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/10 overflow-x-auto print:p-0 print:bg-transparent print:border-none">
            
            {/* Actual Receipt to be printed/saved */}
            <div 
              ref={receiptRef}
              className="bg-white w-full max-w-[800px] mx-auto shadow-2xl p-16 text-zinc-900 print:shadow-none rounded-sm pdf-content relative overflow-hidden font-sans"
              style={{ minHeight: '1056px', color: '#18181b' }}
            >
              {/* Modern Background Accents */}
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
              <div className="absolute top-0 right-0 w-1/3 h-32 bg-blue-50/50 -skew-x-12 transform translate-x-16 -translate-y-8"></div>

              {/* Subtle Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center overflow-hidden">
                <div className="transform -rotate-12 text-[11.25rem] font-black whitespace-nowrap select-none uppercase tracking-tighter">
                  {companyData?.name || 'IA COMPANY'}
                </div>
              </div>

              {/* Modern Header */}
              <div className="relative z-10 mb-16 flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  {companyLogo ? (
                    <div className="bg-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/10 border border-zinc-100 p-4" style={{ width: '128px', height: '128px' }}>
                      <img 
                        src={companyLogo} 
                        alt="Logo" 
                        className="object-contain" 
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20" style={{ width: '96px', height: '96px' }}>
                      <FileText style={{ width: '48px', height: '48px' }} />
                    </div>
                  )}
                  
                  <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none mb-3 uppercase">
                      Recibo de Pagamento
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="h-1 w-12 bg-blue-600 rounded-full"></span>
                      <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">
                        {companyData?.name || 'IA COMPANY'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-4 pt-4">
                  <div className="space-y-1">
                    <p className="text-[0.625rem] font-black text-zinc-400 uppercase tracking-widest">Número do Recibo</p>
                    <p className="text-sm font-bold text-zinc-900 tabular-nums">#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[0.625rem] font-black text-zinc-400 uppercase tracking-widest">Data de Emissão</p>
                    <p className="text-sm font-bold text-zinc-900">{safeFormatDate(date, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Value Box */}
              <div className="relative z-10 flex justify-end mb-16">
                <div className="bg-zinc-900 text-white px-8 py-6 rounded-3xl shadow-2xl shadow-zinc-900/20 flex flex-col items-end">
                  <p className="text-[0.625rem] font-display font-black text-zinc-400 uppercase tracking-widest mb-1">Valor Total</p>
                  <p className="text-4xl font-display font-black tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="relative z-10 space-y-12 text-lg leading-[1.8] text-zinc-700 mb-24">
                <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                  <p className="mb-8">
                    Recebemos de <strong className="text-zinc-900 uppercase">{selectedClient?.name || '__________________________________________________'}</strong>, 
                    {selectedClient?.document ? ` inscrito(a) no CNPJ/CPF sob o nº ${selectedClient.document}, ` : ' '}
                    a importância de <strong className="text-zinc-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}</strong>.
                  </p>

                  <div className="space-y-2">
                    <p className="text-[0.625rem] font-black text-zinc-400 uppercase tracking-widest">Referente a</p>
                    <p className="text-zinc-900 font-bold leading-relaxed italic">
                      {description || '________________________________________________________________________________________________________________________________________________________________'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-zinc-500 text-center italic">
                  Para maior clareza, firmamos o presente recibo para que produza os seus efeitos legais.
                </p>
              </div>

              {/* Footer Signatures */}
              <div className="relative z-10 mt-auto pt-12 border-t border-zinc-100 break-inside-avoid">
                <div className="grid grid-cols-2 gap-16">
                  <div className="flex flex-col items-center gap-6">
                    {companySignature ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <img 
                            src={companySignature} 
                            alt="Assinatura" 
                            className="h-20 object-contain grayscale brightness-90 contrast-125" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-zinc-900">{companyData?.name || 'Sua Empresa'}</p>
                          <p className="text-[0.625rem] text-zinc-400 font-black uppercase tracking-widest mt-1">Emissor Validado</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center w-full">
                        <div className="w-full h-px bg-zinc-200 mb-4"></div>
                        <p className="text-[0.625rem] font-black text-zinc-400 uppercase tracking-widest">Assinatura do Emissor</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-end">
                    <div className="w-full h-px bg-zinc-200 mb-4"></div>
                    <p className="text-[0.625rem] font-black text-zinc-400 uppercase tracking-widest">Assinatura do Cliente</p>
                  </div>
                </div>

                <div className="mt-16 text-center">
                  <p className="text-[0.5625rem] text-zinc-300 font-black uppercase tracking-[0.3em]">Documento Gerado via Condfy.IA</p>
                </div>
              </div>
              
              {/* Decorative Bottom Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-zinc-100"></div>
              <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-blue-600"></div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Receipts List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 relative z-10 print:hidden"
      >
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight">Recibos Gerados</h2>
                <p className="text-white/50 text-sm font-display">Histórico de todos os recibos emitidos</p>
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por cliente ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 text-white rounded-xl pl-12 pr-4 py-3 outline-none transition-all placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-white/30">Data</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-white/30">Cliente</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-white/30">Descrição</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-white/30">Valor</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-white/30 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredReceipts.length > 0 ? (
                    filteredReceipts.map((receipt) => {
                      const client = clients.find(c => c.id === receipt.clientId);
                      return (
                        <motion.tr 
                          key={receipt.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="group hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-white/70">
                            {safeFormatDate(receipt.date)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{client?.name || 'Cliente excluído'}</div>
                            <div className="text-xs text-white/30">{client?.document}</div>
                          </td>
                          <td className="px-6 py-4 text-white/60 max-w-md truncate">
                            {receipt.description}
                          </td>
                          <td className="px-6 py-4 font-black text-emerald-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receipt.value)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleDownloadExisting(receipt)}
                                className="p-2 bg-white/5 hover:bg-white/20 text-white rounded-lg transition-all"
                                title="Baixar PDF"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleShareReceipt(receipt)}
                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg transition-all"
                                title="Compartilhar"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteReceipt(receipt.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic">
                        Nenhum recibo encontrado.
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Hidden Receipt for Download */}
      <div className="hidden">
        {downloadingReceipt && (
          <div 
            ref={downloadRef}
            className="bg-white text-zinc-900 p-12 w-[210mm] min-h-[297mm] mx-auto pdf-content"
          >
            {/* Cabeçalho */}
            <div className="border-b border-zinc-900 pb-6 mb-8 flex justify-between items-start break-inside-avoid page-break-inside-avoid">
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo" className="h-20 w-auto object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-black">A</div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tight leading-none mb-1">
                    RECIBO DE PAGAMENTO
                  </h2>
                  <p className="text-zinc-900 font-medium text-lg mb-4">
                    Comprovante de Recebimento
                  </p>
                  
                  <div className="text-sm text-zinc-900 space-y-0.5">
                    <p className="font-black text-zinc-900 text-base">{companyData?.name || 'IA COMPANY AUTOMAÇÃO'}</p>
                    <p>CNPJ: {companyData?.document || '122.342.2440/001-18'} | Tel: {companyData?.phone || '21 96888- 8183'}</p>
                    <p>{companyData?.email || 'joaoferreira@iacompany.tec.br'}</p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="mb-6">
                  <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-1">Data de Emissão</p>
                  <p className="text-xl font-black text-zinc-900">{safeFormatDate(downloadingReceipt.date)}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-1">Número do Recibo</p>
                  <p className="text-xl font-black text-zinc-900">#{downloadingReceipt.id.slice(0, 4).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Value Box */}
            <div className="mb-10 flex justify-end break-inside-avoid page-break-inside-avoid">
              <div className="w-72 border border-zinc-900 rounded-2xl p-6 bg-zinc-50">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Valor Recebido</p>
                  <p className="text-2xl font-black text-zinc-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(downloadingReceipt.value)}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="mb-10 bg-white p-8 rounded-2xl border border-zinc-900 break-inside-avoid page-break-inside-avoid">
              <p className="text-lg leading-[1.8] text-zinc-900 mb-8">
                Recebemos de <strong className="text-zinc-900 uppercase">
                  {clients.find(c => c.id === downloadingReceipt.clientId)?.name || 'Cliente'}
                </strong>, 
                {clients.find(c => c.id === downloadingReceipt.clientId)?.document ? ` inscrito(a) no CNPJ/CPF sob o nº ${clients.find(c => c.id === downloadingReceipt.clientId)?.document}, ` : ' '}
                a importância de <strong className="text-zinc-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(downloadingReceipt.value)}</strong>.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-black text-zinc-900 uppercase tracking-widest border-b border-zinc-900 pb-2">Referente a</p>
                <p className="text-zinc-900 font-bold leading-relaxed italic pt-2">
                  {downloadingReceipt.description}
                </p>
              </div>
            </div>

            <p className="text-sm text-zinc-900 text-center italic mb-24 break-inside-avoid page-break-inside-avoid">
              Para maior clareza, firmamos o presente recibo para que produza os seus efeitos legais.
            </p>

            {/* Assinaturas */}
            <div className="mt-20 grid grid-cols-2 gap-20 break-inside-avoid page-break-inside-avoid no-break">
              <div className="text-center">
                <div className="w-full h-px bg-zinc-900 mb-4 relative">
                  {companySignature && (
                    <img 
                      src={companySignature} 
                      alt="Assinatura" 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 max-h-24 object-contain mb-2" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <p className="font-black text-zinc-900 uppercase tracking-widest text-xs">{companyData?.name || 'IA COMPANY AUTOMAÇÃO'}</p>
                <p className="text-[10px] text-zinc-900 uppercase tracking-widest mt-1">Empresa Emissora</p>
              </div>
              <div className="text-center">
                <div className="w-full h-px bg-zinc-900 mb-4"></div>
                <p className="font-black text-zinc-900 uppercase tracking-widest text-xs">{clients.find(c => c.id === downloadingReceipt.clientId)?.name || 'Cliente'}</p>
                <p className="text-[10px] text-zinc-900 uppercase tracking-widest mt-1">Assinatura do Cliente</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {receiptToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#004a7c] border border-white/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="bg-red-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-center mb-2">Excluir Recibo?</h3>
            <p className="text-white/60 text-center mb-8">Esta ação não pode ser desfeita. O recibo será removido permanentemente.</p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setReceiptToDelete(null)}
                className="bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
