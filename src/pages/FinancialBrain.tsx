import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { 
  Brain, TrendingUp, TrendingDown, Calendar, DollarSign, 
  AlertCircle, Loader2, RefreshCw, BarChart3, PieChart as PieChartIcon,
  Search, Filter, LayoutGrid, List, Share2, Settings as SettingsIcon,
  Home, FolderOpen, PieChart, ChevronRight, MoreHorizontal,
  Building2, XCircle, ArrowLeft, Bell, FileText, Target, ShieldCheck,
  Zap, Lightbulb, Activity, Cpu, Sparkles, LineChart as LineChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, LineChart, Line, 
  PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area 
} from 'recharts';
import { toast } from 'react-hot-toast';
import { GlassCard, CircularProgress } from '../components/GlassUI';

export default function FinancialBrain() {
  const navigate = useNavigate();
  const { receipts, costs, biaEnabled } = useStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock data for the "Brain" insights
  const insights = [
    {
      id: 1,
      title: "Otimização de Fluxo",
      description: "Identificamos uma oportunidade de reduzir custos operacionais em 12% renegociando contratos de manutenção.",
      impact: "Alto",
      category: "Economia",
      icon: Lightbulb,
      color: "text-amber-400"
    },
    {
      id: 2,
      title: "Previsão de Receita",
      description: "Tendência de alta de 5% nos próximos 3 meses baseada no histórico de ocupação e novos contratos.",
      impact: "Médio",
      category: "Crescimento",
      icon: TrendingUp,
      color: "text-emerald-400"
    },
    {
      id: 3,
      title: "Alerta de Inadimplência",
      description: "Risco de aumento de 2% na inadimplência para o próximo mês. Recomendamos antecipar cobranças.",
      impact: "Crítico",
      category: "Risco",
      icon: AlertCircle,
      color: "text-red-400"
    }
  ];

  const cashFlowData = [
    { month: 'Jan', entrada: 45000, saida: 32000, previsao: 44000 },
    { month: 'Fev', entrada: 52000, saida: 35000, previsao: 50000 },
    { month: 'Mar', entrada: 48000, saida: 38000, previsao: 49000 },
    { month: 'Abr', entrada: 61000, saida: 42000, previsao: 58000 },
    { month: 'Mai', entrada: 55000, saida: 40000, previsao: 56000 },
    { month: 'Jun', entrada: 67000, saida: 45000, previsao: 65000 },
  ];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Análise de IA concluída com sucesso!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover opacity-20"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10 p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-5 h-5 text-purple-400" />
                <span className="text-[0.625rem] font-black uppercase tracking-[0.3em] text-white/40">Inteligência Financeira</span>
              </div>
              <h1 className="text-4xl font-black tracking-tighter">CÉREBRO FINANCEIRO</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Processando...' : 'Nova Análise IA'}
            </motion.button>
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Main Insight Card */}
          <GlassCard className="md:col-span-8 overflow-hidden" noPadding>
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Fluxo de Caixa Preditivo</h3>
                  <p className="text-sm text-white/50">Projeção baseada em IA para os próximos 6 meses</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[0.625rem] font-bold text-emerald-400 uppercase">Tempo Real</span>
                </div>
              </div>
            </div>
            <div className="p-8 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickFormatter={(value) => `R$ ${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="entrada" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorEntrada)" 
                    name="Entradas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saida" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSaida)" 
                    name="Saídas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="previsao" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    dot={false}
                    name="Previsão IA"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* AI Score Card */}
          <GlassCard className="md:col-span-4 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
              <CircularProgress 
                value={88} 
                size={180} 
                strokeWidth={12} 
                color="text-purple-500"
                label="Saúde Financeira"
              />
            </div>
            <h3 className="text-2xl font-black mb-2">EXCELENTE</h3>
            <p className="text-sm text-white/50 mb-8 max-w-[200px]">Sua saúde financeira está 15% acima da média do setor.</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] font-bold text-white/40 uppercase mb-1">Liquidez</div>
                <div className="text-lg font-bold text-emerald-400">1.8x</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[0.625rem] font-bold text-white/40 uppercase mb-1">Margem</div>
                <div className="text-lg font-bold text-blue-400">24%</div>
              </div>
            </div>
          </GlassCard>

          {/* AI Insights List */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 px-2">Insights da Bia</h3>
            {insights.map((insight) => (
              <GlassCard key={insight.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${insight.color}`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.625rem] font-bold uppercase tracking-wider text-white/30">{insight.category}</span>
                      <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${
                        insight.impact === 'Crítico' ? 'text-red-400' : 
                        insight.impact === 'Alto' ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {insight.impact}
                      </span>
                    </div>
                    <h4 className="font-bold mb-2">{insight.title}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Distribution Card */}
          <GlassCard className="md:col-span-4 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold">Distribuição de Gastos</h3>
              <PieChartIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Operacional', value: 400 },
                      { name: 'Manutenção', value: 300 },
                      { name: 'Pessoal', value: 300 },
                      { name: 'Outros', value: 200 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-xs text-white/60">Operacional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-white/60">Manutenção</span>
              </div>
            </div>
          </GlassCard>

          {/* Efficiency Stats */}
          <GlassCard className="md:col-span-4 p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Cpu className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-bold mb-8">Eficiência Operacional</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-white/50 uppercase">Processamento de Notas</span>
                  <span className="text-purple-400">98%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '98%' }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-white/50 uppercase">Conciliação Bancária</span>
                  <span className="text-blue-400">92%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-white/50 uppercase">Automação de Pagamentos</span>
                  <span className="text-emerald-400">85%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-[0.625rem] font-bold text-white/30 uppercase">Economia Gerada</div>
                  <div className="text-xl font-black text-white">R$ 12.450,00</div>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
