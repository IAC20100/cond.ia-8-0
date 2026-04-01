import { MessageSquare, Activity, Wifi } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { sendWhatsAppMessage } from '../../services/whatsappService';
import { supabase } from '../../lib/supabase';

interface WhatsappStatusTileProps {
  biaEnabled: boolean;
  toggleBia: () => void;
  biaOnline: boolean;
  biaStatus: { 
    status: string; 
    appUrl?: string;
    lastWebhookReceived: string | null;
    lastMessageExtracted: string | null;
  } | null;
}

export function WhatsappStatusTile({ biaEnabled, toggleBia, biaOnline, biaStatus }: WhatsappStatusTileProps) {
  const [manualCommand, setManualCommand] = useState('');
  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);

  const handleManualCommand = async () => {
    if (!manualCommand.trim()) return;
    try {
      const { error } = await supabase.from('whatsapp_commands').insert([{
        sender_name: 'Admin (Manual)',
        sender_number: 'admin',
        message_text: manualCommand,
        processed: false,
        created_at: new Date().toISOString()
      }]);
      
      if (error) throw error;
      toast.success('Comando manual enviado para processamento!');
      setManualCommand('');
    } catch (err) {
      toast.error('Erro ao enviar comando: ' + (err as Error).message);
    }
  };

  const handleTestWhatsapp = async () => {
    setIsTestingWhatsapp(true);
    try {
      const success = await sendWhatsAppMessage('5511999999999', 'Teste de conexão BiaBrain ' + new Date().toLocaleTimeString());
      if (success) {
        toast.success('Mensagem de teste enviada!');
      } else {
        toast.error('Falha ao enviar mensagem. Verifique as chaves da Evolution API.');
      }
      
      const webhookRes = await fetch('/api/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'messages.upsert',
          data: {
            messages: [{
              key: { remoteJid: 'test@s.whatsapp.net', fromMe: false },
              pushName: 'Testador',
              message: { conversation: 'Bia, teste interno' }
            }]
          }
        })
      });
      
      if (webhookRes.ok) {
        toast.success('Webhook simulado com sucesso!');
      }
    } catch (err) {
      toast.error('Erro no teste: ' + (err as Error).message);
    } finally {
      setIsTestingWhatsapp(false);
    }
  };

  return (
    <div className="w-full h-full bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-4 flex flex-col justify-between group relative overflow-hidden active:scale-95 transition-all">
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-[0.625rem] font-display font-bold text-white uppercase tracking-wider">Status Bia</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBia();
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.5rem] font-bold transition-all ${
              biaEnabled 
                ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                : 'bg-zinc-700 text-zinc-400'
            }`}
            title={biaEnabled ? "Desativar Bia" : "Ativar Bia"}
          >
            {biaEnabled ? 'ON' : 'OFF'}
          </button>
          <div className={`w-2 h-2 rounded-full ${biaStatus?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} title="Servidor Webhook" />
          <div className={`w-2 h-2 rounded-full ${biaOnline ? 'bg-blue-400 animate-pulse' : 'bg-gray-400'}`} title="Bia Brain (Navegador)" />
        </div>
      </div>
      
      <div className="flex-1 space-y-1.5 text-[0.5625rem] font-display relative z-10">
        <div className="flex justify-between text-emerald-100/70">
          <span>Webhook URL:</span>
          <span className="text-white font-mono truncate max-w-[100px]" title={`${biaStatus?.appUrl || ''}/api/webhook/whatsapp`}>
            {biaStatus?.appUrl ? `${biaStatus.appUrl.substring(0, 15)}...` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between text-emerald-100/70">
          <span>Bia Brain:</span>
          <span className={`font-mono ${biaOnline ? 'text-blue-300' : 'text-gray-400'}`}>
            {biaOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <div className="flex justify-between text-emerald-100/70">
          <span>Último Webhook:</span>
          <span className="text-white font-mono truncate max-w-[80px]">
            {biaStatus?.lastWebhookReceived ? new Date(biaStatus.lastWebhookReceived).toLocaleTimeString() : 'Nunca'}
          </span>
        </div>
        <div className="flex justify-between text-emerald-100/70">
          <span>Última Msg:</span>
          <span className="text-white font-mono truncate max-w-[80px]">
            {biaStatus?.lastMessageExtracted || 'Nenhuma'}
          </span>
        </div>
        
        <div className="pt-1">
          <input 
            type="text"
            value={manualCommand}
            onChange={(e) => setManualCommand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualCommand()}
            placeholder="Comando manual..."
            className="w-full bg-black/20 border border-emerald-500/30 rounded px-2 py-1 text-[0.5rem] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>
      
      <div className="flex gap-1 mt-2 relative z-10">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleManualCommand();
          }}
          className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[0.5rem] font-bold transition-colors"
        >
          Enviar
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleTestWhatsapp();
          }}
          disabled={isTestingWhatsapp}
          className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center"
        >
          {isTestingWhatsapp ? <Activity className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
