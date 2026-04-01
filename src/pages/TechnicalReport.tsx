import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Sparkles, ArrowLeft, Copy, Download, CheckCircle2, 
  AlertCircle, PenTool, Cpu, RefreshCw, Building2, User, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { GlassCard } from '../components/GlassUI';
import { generatePdf } from '../utils/pdfGenerator';
import { useStore } from '../store';

export default function TechnicalReport() {
  const navigate = useNavigate();
  const { clients, companyLogo, companyData, companySignature } = useStore();
  
  const [activeTab, setActiveTab] = useState<'name' | 'standard' | 'client'>('name');
  const [reportType, setReportType] = useState<'standard' | 'client'>('standard');
  const [reportName, setReportName] = useState('Relatório Técnico');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [input, setInput] = useState('');
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Por favor, descreva o que houve na ocorrência.');
      return;
    }

    if (reportType === 'client' && !selectedClientId) {
      toast.error('Por favor, selecione um cliente.');
      return;
    }

    setIsGenerating(true);
    setReport('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let clientContext = '';
      if (reportType === 'client' && selectedClient) {
        clientContext = `
Informações do Cliente (apenas para contexto, NÃO INCLUA ESTES DADOS NO TEXTO GERADO):
- Nome/Razão Social: ${selectedClient.name}
- Documento (CNPJ/CPF): ${selectedClient.document || 'Não informado'}
- Endereço: ${selectedClient.address || 'Não informado'}
- Contato: ${selectedClient.contactPerson || 'Não informado'}
`;
      }

      const prompt = `Você é um engenheiro/técnico especialista sênior.
Transforme a seguinte descrição informal de uma ocorrência de manutenção (OS) em um relatório técnico profissional, detalhado e pronto para ser entregue ao cliente.
O relatório deve transmitir confiança, clareza técnica e profissionalismo.
${clientContext}

Estrutura sugerida:
- Resumo da Ocorrência
- Análise Técnica e Diagnóstico
- Ações Realizadas
- Conclusão e Recomendações

IMPORTANTE: NÃO inclua título principal (ex: "RELATÓRIO TÉCNICO DE MANUTENÇÃO") nem os dados do cliente (Nome, CNPJ, Endereço) no início do texto. O sistema já adiciona um cabeçalho oficial com essas informações. Comece diretamente pelo "Resumo da Ocorrência".

Descrição original do técnico:
"${input}"

Gere apenas o relatório em formato Markdown, sem introduções ou explicações extras.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setReport(response.text);
        toast.success('Relatório gerado com sucesso!');
      } else {
        throw new Error('Resposta vazia do modelo.');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Ocorreu um erro ao gerar o relatório. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = async () => {
    if (reportRef.current && report) {
      try {
        toast.loading('Gerando PDF...', { id: 'pdf-gen' });
        const fileName = `${reportName.replace(/\s+/g, '_') || 'Relatorio_Tecnico'}.pdf`;
        await generatePdf(reportRef.current, fileName);
        toast.success('PDF gerado com sucesso!', { id: 'pdf-gen' });
      } catch (error) {
        console.error(error);
        toast.error('Erro ao gerar PDF', { id: 'pdf-gen' });
      }
    }
  };

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-6 md:p-10 relative overflow-hidden bg-zinc-950">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950/30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-black text-white tracking-tight flex items-center gap-3">
                <Cpu className="w-8 h-8 text-indigo-400" />
                Gerador de Relatório Técnico
              </h1>
              <p className="text-white/40 text-sm mt-1 font-display">Transforme anotações simples em relatórios profissionais com IA</p>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <GlassCard title="Configuração do Relatório" icon={PenTool}>
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                  <button
                    onClick={() => setActiveTab('name')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-[0.625rem] font-display font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'name' 
                        ? 'bg-indigo-500 text-white shadow-lg' 
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    Nome do Relatório
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('standard');
                      setReportType('standard');
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-[0.625rem] font-display font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'standard' 
                        ? 'bg-indigo-500 text-white shadow-lg' 
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Relatório Padrão
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('client');
                      setReportType('client');
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-[0.625rem] font-display font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      activeTab === 'client' 
                        ? 'bg-indigo-500 text-white shadow-lg' 
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Para Cliente
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'name' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-xs font-display font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Nome do Relatório
                      </label>
                      <input
                        type="text"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Ex: Relatório de Manutenção Preventiva"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-display"
                      />
                      <p className="text-[0.625rem] text-white/30 italic font-display">Este nome será usado no cabeçalho do PDF e no nome do arquivo.</p>
                      
                      <button
                        onClick={() => setActiveTab('standard')}
                        className="w-full mt-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        Próximo Passo
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  )}

                  {activeTab !== 'name' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Client Selector */}
                      {activeTab === 'client' && (
                        <div className="space-y-2">
                          <label className="text-xs font-display font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Selecione o Cliente
                          </label>
                          <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none font-display"
                          >
                            <option value="" className="bg-zinc-900">Selecione um cliente...</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id} className="bg-zinc-900">
                                {client.name} {client.document ? `- ${client.document}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/50 uppercase tracking-widest">
                          Descreva o que houve (OS)
                        </label>
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ex: Cheguei no local, a bomba d'água 2 estava vazando pelo selo mecânico..."
                          className="w-full h-48 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none custom-scrollbar"
                        />
                      </div>

                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !input.trim() || (activeTab === 'client' && !selectedClientId)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Processando com IA...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Gerar Relatório Técnico
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-200/70 leading-relaxed">
                    A Inteligência Artificial irá estruturar seu texto, corrigir a gramática e utilizar termos técnicos adequados para criar um documento pronto para ser entregue ao cliente.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Output Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <GlassCard 
              title="Relatório Gerado" 
              icon={FileText}
              action={
                report ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-2 rounded-xl transition-colors border ${
                        isEditing 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                          : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/5'
                      }`}
                      title={isEditing ? "Visualizar" : "Editar relatório"}
                    >
                      {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/5"
                      title="Copiar texto"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20"
                      title="Baixar PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : null
              }
            >
              <div className="h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {report ? (
                  <div className="bg-white text-zinc-900 rounded-2xl shadow-inner min-h-full p-4 sm:p-10">
                    {isEditing ? (
                      <div className="h-full flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Modo de Edição (Markdown)</h3>
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="text-[0.625rem] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
                          >
                            Concluir Edição
                          </button>
                        </div>
                        <textarea
                          value={report}
                          onChange={(e) => setReport(e.target.value)}
                          className="flex-1 w-full min-h-[400px] p-4 rounded-xl border-2 border-zinc-100 bg-zinc-50 text-zinc-900 font-mono text-sm focus:border-indigo-500/30 outline-none resize-none custom-scrollbar"
                          placeholder="Edite o conteúdo do relatório aqui..."
                        />
                      </div>
                    ) : (
                      <div ref={reportRef} className="bg-white text-zinc-900 relative p-16 pdf-content font-sans" style={{ width: '100%', color: '#18181b' }}>
                        {/* Modern Background Accents */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900"></div>

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
                              <div className="bg-white rounded-2xl flex items-center justify-center border border-zinc-900 p-4" style={{ width: '128px', height: '128px' }}>
                                <img 
                                  src={companyLogo} 
                                  alt="Logo" 
                                  className="object-contain" 
                                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                                  referrerPolicy="no-referrer" 
                                />
                              </div>
                            ) : (
                              <div className="bg-zinc-900 rounded-2xl flex items-center justify-center text-white" style={{ width: '96px', height: '96px' }}>
                                <FileText style={{ width: '48px', height: '48px' }} />
                              </div>
                            )}
                            
                            <div>
                              <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-none mb-3 uppercase">
                                {reportName || 'Relatório Técnico'}
                              </h1>
                              <div className="flex items-center gap-3">
                                <span className="h-1 w-12 bg-zinc-900 rounded-full"></span>
                                <p className="text-xs font-black text-zinc-900 uppercase tracking-[0.2em]">
                                  {companyData?.name || 'IA COMPANY'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-4 pt-4">
                            <div className="space-y-1">
                              <p className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest">Ordem de Serviço</p>
                              <p className="text-sm font-bold text-zinc-900 tabular-nums">#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest">Data de Emissão</p>
                              <p className="text-sm font-bold text-zinc-900">{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Client Info (if selected) */}
                        {reportType === 'client' && selectedClient && (
                          <div className="relative z-10 bg-white p-8 rounded-2xl border border-zinc-900 mb-16 break-inside-avoid">
                            <h3 className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest mb-6 border-b border-zinc-900 pb-2">Dados do Cliente</h3>
                            <div className="grid grid-cols-2 gap-12">
                              <div>
                                <p className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest mb-1">Cliente / Razão Social</p>
                                <p className="text-sm font-bold text-zinc-900">{selectedClient.name}</p>
                              </div>
                              <div>
                                <p className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest mb-1">Documento</p>
                                <p className="text-sm font-bold text-zinc-900">{selectedClient.document || 'N/A'}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest mb-1">Endereço</p>
                                <p className="text-sm font-bold text-zinc-900 leading-relaxed">{selectedClient.address || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Markdown Content */}
                        <div className="relative z-10 markdown-body text-justify text-[0.9375rem] leading-[1.8] text-zinc-700 px-2 mb-24">
                          <ReactMarkdown
                            components={{
                              p: ({node, ...props}) => <p className="mb-6" {...props} />,
                              li: ({node, ...props}) => <li className="mb-2" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-3xl font-black text-zinc-900 mt-12 mb-6 uppercase tracking-tight border-b-2 border-zinc-900 pb-4 break-inside-avoid" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-2xl font-black text-zinc-900 mt-10 mb-4 uppercase tracking-tight break-inside-avoid" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-xl font-black text-zinc-900 mt-8 mb-3 uppercase tracking-tight break-inside-avoid" {...props} />,
                              table: ({node, ...props}) => <table className="w-full border-collapse border border-zinc-900 my-8" {...props} />,
                              th: ({node, ...props}) => <th className="border border-zinc-900 bg-zinc-50 p-4 text-left text-[0.625rem] font-black uppercase tracking-widest text-zinc-900" {...props} />,
                              td: ({node, ...props}) => <td className="border border-zinc-900 p-4 text-sm text-zinc-900" {...props} />,
                            }}
                          >
                            {report}
                          </ReactMarkdown>
                        </div>

                        {/* Standard Footer */}
                        <div className="relative z-10 mt-auto pt-12 border-t border-zinc-900 break-inside-avoid">
                          <div className="flex flex-col items-center justify-center gap-8">
                            {companySignature ? (
                              <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                  <img 
                                    src={companySignature} 
                                    alt="Assinatura" 
                                    className="h-24 object-contain grayscale brightness-90 contrast-125" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="w-64 h-px bg-zinc-900 mb-4"></div>
                                <p className="text-[0.625rem] font-black text-zinc-900 uppercase tracking-widest">Assinatura do Responsável</p>
                              </div>
                            )}
                            
                            <div className="text-center">
                              <p className="text-sm font-bold text-zinc-900">{companyData?.name || 'Sua Empresa'}</p>
                              <p className="text-[0.625rem] text-zinc-500 font-medium mt-1 uppercase tracking-widest">Documento Gerado via Condfy.IA</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Decorative Bottom Bar */}
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-zinc-900"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <FileText className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">O relatório gerado aparecerá aqui</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
