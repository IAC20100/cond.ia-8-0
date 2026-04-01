import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  MapPin,
  MessageSquare,
  Zap
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicQuickResponse() {
  const [searchParams] = useSearchParams();
  const { clients, addTicket, companyLogo, companyData } = useStore();
  
  const clientId = searchParams.get('client');
  const locationId = searchParams.get('location');
  
  const [client, setClient] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const quickResponses = [
    "Problema de iluminação",
    "Limpeza necessária",
    "Barulho excessivo",
    "Portão com defeito",
    "Elevador parado",
    "Vazamento de água"
  ];

  useEffect(() => {
    if (clientId) {
      const foundClient = clients.find(c => c.id === clientId);
      if (foundClient) {
        setClient(foundClient);
        if (locationId) {
          const foundLoc = foundClient.locations?.find(l => l.id === locationId);
          if (foundLoc) setLocation(foundLoc);
        }
      }
    }
  }, [clientId, locationId, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = selectedResponse === 'Outro' ? customMessage : selectedResponse;
    if (!message) return;

    const newTicket = {
      id: uuidv4(),
      clientId: client.id,
      type: 'CORRETIVA' as const,
      status: 'PENDENTE_APROVACAO' as const,
      date: new Date().toISOString(),
      technician: 'A definir',
      observations: `Resposta Rápida via QR Code`,
      reportedBy: 'Anônimo (QR)',
      location: location?.name || 'Não especificado',
      reportedProblem: message,
      items: []
    };

    addTicket(newTicket);
    setIsSubmitted(true);
  };

  if (!clientId || !client) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Link Inválido</h1>
          <p className="text-zinc-400">Este QR Code não parece ser válido ou o condomínio não foi encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-lg mx-auto border-x border-zinc-800 shadow-2xl relative overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 p-6 flex items-center gap-4 sticky top-0 z-20">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <Building2 className="w-6 h-6 text-zinc-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-bold truncate leading-tight text-xl">{client.name}</h1>
          <div className="flex items-center gap-1.5 text-cyan-500 text-[10px] font-black uppercase tracking-widest">
            <Zap className="w-3 h-3 fill-current" />
            Resposta Rápida
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Localização</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  {location?.name || 'Área Comum'}
                </h2>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-cyan-500" />
                  O que está acontecendo?
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {quickResponses.map((resp) => (
                      <button
                        key={resp}
                        type="button"
                        onClick={() => {
                          setSelectedResponse(resp);
                          setCustomMessage('');
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all font-bold text-sm ${
                          selectedResponse === resp 
                            ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {resp}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedResponse('Outro')}
                      className={`p-4 rounded-2xl border text-left transition-all font-bold text-sm ${
                        selectedResponse === 'Outro' 
                          ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
                          : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      Outro problema...
                    </button>
                  </div>

                  {selectedResponse === 'Outro' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2"
                    >
                      <textarea
                        required
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Descreva o problema aqui..."
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all min-h-[120px] resize-none"
                      />
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedResponse || (selectedResponse === 'Outro' && !customMessage.trim())}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 mt-4 ${
                      (selectedResponse && (selectedResponse !== 'Outro' || customMessage.trim()))
                        ? 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/20 active:scale-95' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    Enviar Relato
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl animate-pulse" />
                <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Enviado com <span className="text-emerald-500">Sucesso!</span>
                </h2>
                <p className="text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
                  Seu relato foi registrado e nossa equipe já foi notificada. Obrigado por nos ajudar a manter o condomínio em ordem!
                </p>
              </div>

              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-zinc-700 active:scale-95"
              >
                Enviar outro relato
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-8 text-center border-t border-zinc-800 bg-zinc-900/50">
        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em] mb-2">
          {companyData?.name || 'FLORES'} Gestão de Manutenção
        </p>
        <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">
          Powered by QR Studio Intelligence
        </p>
      </footer>
    </div>
  );
}
