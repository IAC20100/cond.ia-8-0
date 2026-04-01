import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store';
import { CompanyData } from '../types';
import { toast } from 'react-hot-toast';
import { 
  Upload, Trash2, Image as ImageIcon, Save, Download, Database, 
  FileUp, ChevronUp, ChevronDown, Layout as LayoutIcon, 
  Settings as SettingsIcon, Eye, EyeOff, MessageSquare,
  Users, UserPlus, Edit2, X, Check, Shield
} from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const { 
    companyLogo, setCompanyLogo, 
    companySignature, setCompanySignature,
    companyData, setCompanyData,
    menuOrder, setMenuOrder,
    hiddenTiles, toggleTileVisibility,
    tileSizes, tileOrder,
    clients, checklistItems, tickets, quotes, receipts, costs, appointments, products,
    suppliers, supplyItems, supplyQuotations, payments, legalAgreements, scheduledMaintenances,
    notifications, consumptionReadings, digitalFolder, notices, packages, visitors,
    criticalEvents, energyData, savingsGoals, assemblies, documentTemplates,
    users, addUser, updateUser, deleteUser,
    restoreData, logout,
    whatsappEnabled, toggleWhatsApp,
    biaEnabled, toggleBia,
    fontSize, setFontSize
  } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [activeTab, setActiveTab] = useState<'general' | 'users' | 'security'>('general');
  const { 
    mfaEnabled, toggleMfa,
    dataConsent, setDataConsent,
    encryptionActive, toggleEncryption,
    securityLogs
  } = useStore();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'OPERATOR' as 'ADMIN' | 'OPERATOR' | 'VIEWER',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    website: ''
  });

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      role: 'OPERATOR',
      status: 'ACTIVE'
    });
    setEditingUser(null);
    setIsUserFormOpen(false);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await updateUser(editingUser.id, userFormData);
    } else {
      await addUser(userFormData);
    }
    resetUserForm();
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setIsUserFormOpen(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (companyData) {
      setFormData(companyData);
    }
  }, [companyData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB to avoid database/storage limits)
      if (file.size > 2 * 1024 * 1024) {
        import('react-hot-toast').then(({ toast }) => {
          toast.error('A imagem é muito grande. O limite é 2MB.');
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
        import('react-hot-toast').then(({ toast }) => {
          toast.success('Logo atualizada com sucesso!');
        });
      };
      reader.onerror = () => {
        import('react-hot-toast').then(({ toast }) => {
          toast.error('Erro ao ler o arquivo.');
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanySignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveData = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyData(formData);
    // Using a simple notification style instead of alert if possible, 
    // but for now keeping it simple or just a visual feedback
  };

  const handleExportBackup = () => {
    const backupData = {
      clients,
      checklistItems,
      tickets,
      quotes,
      receipts,
      costs,
      appointments,
      products,
      suppliers,
      supplyItems,
      supplyQuotations,
      payments,
      legalAgreements,
      scheduledMaintenances,
      notifications,
      consumptionReadings,
      digitalFolder,
      notices,
      packages,
      visitors,
      criticalEvents,
      energyData,
      savingsGoals,
      assemblies,
      documentTemplates,
      users,
      companyLogo,
      companySignature,
      companyData,
      menuOrder,
      hiddenTiles,
      tileSizes,
      tileOrder,
      fontSize,
      version: '1.1',
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_iac_tec_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setConfirmModal({
            isOpen: true,
            title: 'Restaurar Backup',
            message: 'Atenção: Restaurar um backup irá substituir todos os dados atuais. Deseja continuar?',
            onConfirm: async () => {
              await restoreData(json);
              toast.success('Backup restaurado com sucesso!');
            },
            type: 'danger'
          });
        } catch (error) {
          console.error('Erro ao importar backup:', error);
          toast.error('Arquivo de backup inválido.');
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  const moveMenuItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...menuOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setMenuOrder(newOrder);
    }
  };

  const menuLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    clients: 'Clientes',
    products: 'Produtos',
    tickets: 'Ordens (Lista/Checklist)',
    kanban: 'Kanban',
    quotes: 'Orçamentos',
    receipts: 'Recibos',
    financial: 'Financeiro',
    calendar: 'Agenda',
    settings: 'Ajustes',
    marketplace: 'Classificados',
    'lost-and-found': 'Achados e Perdidos',
  };

  const tileLabels: Record<string, string> = {
    weather: 'Clima',
    clients: 'Clientes',
    products: 'Produtos',
    tickets: 'Ordens de Serviço',
    kanban: 'Kanban',
    quotes: 'Orçamentos',
    receipts: 'Recibos',
    financial: 'Financeiro',
    calendar: 'Agenda',
    accountability: 'Central de Custos',
    consumption: 'Consumo (Água/Gás)',
    locker: 'Locker Digital',
    monitoring: 'Automações IoT',
    settings: 'Ajustes',
    'document-factory': 'Central de Documentos',
    'system-presentation': 'Apresentação',
    'demo-data': 'Backup / Demo',
    'marketplace': 'Classificados',
    'lost-and-found': 'Achados e Perdidos',
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-8 md:p-12 overflow-x-hidden relative flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-white/5" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-white/10" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 shrink-0">
        <div className="flex items-center gap-6">
          <BackButton />
          <div>
            <h1 className="text-6xl font-light tracking-tight text-white">Ajustes</h1>
            <p className="text-xl text-white/60 mt-2 font-light">Configurações do sistema e dados da empresa</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full mb-8 flex gap-4 relative z-10">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            activeTab === 'general' 
              ? 'bg-white text-[#004a7c] shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <SettingsIcon className="w-5 h-5" /> GERAL
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            activeTab === 'users' 
              ? 'bg-white text-[#004a7c] shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Users className="w-5 h-5" /> USUÁRIOS
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${
            activeTab === 'security' 
              ? 'bg-white text-[#004a7c] shadow-lg' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Shield className="w-5 h-5" /> SEGURANÇA
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={activeTab}
        className="max-w-5xl mx-auto w-full space-y-8 relative z-10 pb-20"
      >
        {activeTab === 'general' ? (
          <>
            {/* Logo Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            Logo da Empresa
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="w-56 h-56 bg-white rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 group relative">
              {companyLogo ? (
                <>
                  <img src={companyLogo} alt="Logo da Empresa" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setCompanyLogo(null)} className="p-3 bg-red-500 rounded-full text-white shadow-lg">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-200">
                  <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <span className="text-sm font-bold uppercase tracking-widest">Sem logo</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-lg text-zinc-500 font-light leading-relaxed">
                Adicione a logo da sua empresa para que ela apareça no dashboard, no ícone do navegador (favicon) e nos relatórios em PDF gerados pelo sistema.
              </p>
              <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-200">
                <p className="text-sm text-zinc-400 font-medium">
                  Recomendamos uma imagem com fundo transparente (PNG) ou branco (JPG).
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold border border-blue-700 transition-all flex items-center gap-3 shadow-lg"
                >
                  <Upload className="w-5 h-5" /> ESCOLHER IMAGEM
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Signature Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <ImageIcon className="w-6 h-6 text-purple-600" />
            Assinatura da Empresa
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-10">
            <div className="w-72 h-40 bg-white rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 group relative">
              {companySignature ? (
                <>
                  <img src={companySignature} alt="Assinatura da Empresa" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => setCompanySignature(null)} className="p-3 bg-red-500 rounded-full text-white shadow-lg">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-200">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sem assinatura</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-6">
              <p className="text-lg text-zinc-500 font-light leading-relaxed">
                Adicione uma imagem da assinatura digitalizada ou carimbo da sua empresa. Ela será exibida no rodapé de Orçamentos, Ordens de Serviço e Recibos.
              </p>
              <div className="p-4 bg-zinc-100 rounded-xl border border-zinc-200">
                <p className="text-sm text-zinc-400 font-medium">
                  Recomendamos uma imagem com fundo transparente (PNG) para melhor visualização nos documentos.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={signatureInputRef}
                  onChange={handleSignatureChange}
                />
                <button 
                  onClick={() => signatureInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold border border-blue-700 transition-all flex items-center gap-3 shadow-lg"
                >
                  <Upload className="w-5 h-5" /> ESCOLHER ASSINATURA
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Data Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <MessageSquare className="w-6 h-6 text-green-600" />
            Integrações
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-zinc-200">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Notificações via WhatsApp</h3>
                <p className="text-zinc-500 font-light">Envie avisos automáticos de encomendas, obras e mudanças via Evolution API.</p>
              </div>
              <button
                onClick={toggleWhatsApp}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  whatsappEnabled ? 'bg-green-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    whatsappEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-zinc-200">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Assistente Bia (IA)</h3>
                <p className="text-zinc-500 font-light">Ative ou desative a assistente virtual Bia para suporte e automação.</p>
              </div>
              <button
                onClick={toggleBia}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                  biaEnabled ? 'bg-blue-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    biaEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {whatsappEnabled && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm text-green-800 font-medium">
                  A integração com a Evolution API está ativa. As notificações serão enviadas automaticamente para os números cadastrados.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Company Data Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <SettingsIcon className="w-6 h-6 text-emerald-600" />
            Dados da Empresa
          </h2>
          <form onSubmit={handleSaveData} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Nome da Empresa / Razão Social *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg placeholder:text-zinc-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">CNPJ / CPF *</label>
                <input 
                  type="text" 
                  value={formData.document}
                  onChange={(e) => setFormData({...formData, document: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg placeholder:text-zinc-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Telefone / WhatsApp *</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg placeholder:text-zinc-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">E-mail *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg placeholder:text-zinc-300"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Endereço Completo *</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg placeholder:text-zinc-300"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Site (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.website || ''}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg placeholder:text-zinc-300"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-6">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-black tracking-widest border border-blue-700 transition-all active:scale-95 flex items-center gap-3 shadow-xl"
              >
                <Save className="w-6 h-6" /> SALVAR DADOS
              </button>
            </div>
          </form>
        </motion.div>

        {/* Menu Organization Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <LayoutIcon className="w-6 h-6 text-orange-600" />
            Organização do Menu
          </h2>
          <p className="text-lg text-zinc-500 font-light mb-8">
            Altere a ordem dos itens no menu lateral para facilitar seu fluxo de trabalho.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {menuOrder.map((id, index) => (
              <div key={id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-zinc-200 group hover:bg-zinc-50 transition-all">
                <span className="font-bold text-lg text-zinc-700">
                  {menuLabels[id] || id}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => moveMenuItem(index, 'up')}
                    disabled={index === 0}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-all disabled:opacity-10 text-zinc-400 hover:text-zinc-600"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => moveMenuItem(index, 'down')}
                    disabled={index === menuOrder.length - 1}
                    className="p-2 hover:bg-zinc-100 rounded-xl transition-all disabled:opacity-10 text-zinc-400 hover:text-zinc-600"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Visibility Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <LayoutIcon className="w-6 h-6 text-indigo-600" />
            Visibilidade do Dashboard
          </h2>
          <p className="text-lg text-zinc-500 font-light mb-8">
            Ative ou desative os blocos (tiles) que aparecem na sua tela inicial.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(tileLabels).map(([id, label]) => {
              const isHidden = hiddenTiles.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleTileVisibility(id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isHidden 
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400 grayscale' 
                      : 'bg-white border-blue-100 text-zinc-900 shadow-sm hover:border-blue-300'
                  }`}
                >
                  <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
                  {isHidden ? (
                    <EyeOff className="w-5 h-5 opacity-50" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Accessibility Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <LayoutIcon className="w-6 h-6 text-blue-600" />
            Acessibilidade
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">Tamanho da Fonte ({fontSize}px)</label>
              <div className="flex items-center gap-6">
                <span className="text-sm text-zinc-400">A</span>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-2xl text-zinc-400">A</span>
              </div>
              <p className="mt-4 text-zinc-500 font-light">Ajuste o tamanho das letras para facilitar a leitura de acordo com sua necessidade.</p>
            </div>
          </div>
        </motion.div>

        {/* Backup Section */}
        <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-zinc-900">
            <Database className="w-6 h-6 text-rose-600" />
            Backup e Restauração
          </h2>
          <p className="text-lg text-zinc-500 font-light mb-8">
            Gere uma cópia de segurança de todos os seus dados para salvar em outro local ou restaurar em caso de necessidade.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={handleExportBackup}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold border border-blue-700 transition-all flex items-center gap-3 active:scale-95 shadow-lg"
            >
              <Download className="w-6 h-6" /> GERAR BACKUP COMPLETO
            </button>
            
            <div className="relative">
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={backupInputRef}
                onChange={handleImportBackup}
              />
              <button 
                onClick={() => backupInputRef.current?.click()}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 px-8 py-5 rounded-2xl font-bold border border-zinc-200 transition-all flex items-center gap-3 active:scale-95"
              >
                <FileUp className="w-6 h-6" /> RESTAURAR BACKUP
              </button>
            </div>
          </div>
          
          <div className="mt-10 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-amber-800 leading-relaxed">
              <strong className="text-amber-600 uppercase tracking-widest text-xs block mb-2">Aviso Importante</strong>
              Ao restaurar um backup, todos os dados atuais do sistema serão substituídos pelos dados contidos no arquivo. Recomendamos gerar um backup dos dados atuais antes de realizar uma restauração.
            </p>
          </div>
        </motion.div>

        {/* Logout Section */}
        <motion.div variants={itemVariants} className="pt-10 flex justify-center">
          <button 
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: 'Sair do Sistema',
                message: 'Deseja realmente sair do sistema?',
                onConfirm: () => {
                  logout();
                  navigate('/');
                },
                type: 'danger'
              });
            }}
            className="flex items-center gap-3 px-12 py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-black tracking-[0.2em] transition-all active:scale-95 shadow-xl"
          >
            <Upload className="w-6 h-6 rotate-90" /> ENCERRAR SESSÃO DO USUÁRIO
          </button>
        </motion.div>
          </>
        ) : (
          <div className="space-y-8">
            {/* User Form */}
            {isUserFormOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-900">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h2>
                  <button onClick={resetUserForm} className="p-2 hover:bg-zinc-200 rounded-full transition-all text-zinc-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUserSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Nome Completo</label>
                      <input 
                        type="text" 
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                        className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">E-mail</label>
                      <input 
                        type="email" 
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                        className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Nível de Acesso</label>
                      <select 
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({...userFormData, role: e.target.value as any})}
                        className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg appearance-none"
                      >
                        <option value="ADMIN">Administrador</option>
                        <option value="OPERATOR">Operador</option>
                        <option value="VIEWER">Visualizador</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold uppercase tracking-wider text-zinc-400 ml-1">Status</label>
                      <select 
                        value={userFormData.status}
                        onChange={(e) => setUserFormData({...userFormData, status: e.target.value as any})}
                        className="w-full bg-white border border-zinc-200 focus:border-blue-500 rounded-2xl px-6 py-4 outline-none transition-all text-zinc-900 text-lg appearance-none"
                      >
                        <option value="ACTIVE">Ativo</option>
                        <option value="INACTIVE">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={resetUserForm}
                      className="px-8 py-4 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
                    >
                      CANCELAR
                    </button>
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg"
                    >
                      <Save className="w-5 h-5" /> {editingUser ? 'ATUALIZAR' : 'CRIAR USUÁRIO'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Users List */}
            <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-900">
                  <Users className="w-6 h-6 text-blue-600" />
                  Usuários do Sistema
                </h2>
                {!isUserFormOpen && (
                  <button 
                    onClick={() => setIsUserFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md"
                  >
                    <UserPlus className="w-5 h-5" /> NOVO USUÁRIO
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200">
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Usuário</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Acesso</th>
                      <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Status</th>
                      <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-zinc-400 italic">
                          Nenhum usuário cadastrado além do administrador padrão.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="group hover:bg-white transition-all">
                          <td className="py-4 px-4">
                            <div className="font-bold text-zinc-900">{user.name}</div>
                            <div className="text-sm text-zinc-500">{user.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'OPERATOR' ? 'bg-blue-100 text-blue-700' :
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                              {user.status === 'ACTIVE' ? 'ATIVO' : 'INATIVO'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Remover Usuário',
                                    message: `Deseja realmente remover o usuário ${user.name}? Esta ação não pode ser desfeita.`,
                                    onConfirm: () => deleteUser(user.id),
                                    type: 'danger'
                                  });
                                }}
                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* MFA & Authentication */}
            <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl text-zinc-900">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                Autenticação e Identidade
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-zinc-100">
                  <div>
                    <h3 className="font-bold text-lg">Autenticação de Dois Fatores (MFA)</h3>
                    <p className="text-zinc-500 text-sm">Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.</p>
                  </div>
                  <button 
                    onClick={toggleMfa}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                      mfaEnabled ? 'bg-blue-600' : 'bg-zinc-200'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      mfaEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-zinc-100">
                  <div>
                    <h3 className="font-bold text-lg">Criptografia de Dados Sensíveis (AES-256)</h3>
                    <p className="text-zinc-500 text-sm">Criptografa informações críticas antes de serem armazenadas no banco de dados.</p>
                  </div>
                  <button 
                    onClick={toggleEncryption}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                      encryptionActive ? 'bg-blue-600' : 'bg-zinc-200'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      encryptionActive ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Privacy & LGPD */}
            <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl text-zinc-900">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Database className="w-6 h-6 text-emerald-600" />
                Privacidade e LGPD
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-zinc-100">
                  <div>
                    <h3 className="font-bold text-lg">Consentimento de Uso de Dados</h3>
                    <p className="text-zinc-500 text-sm">Ao ativar, você confirma que leu e aceita os termos de uso e política de privacidade em conformidade com a LGPD.</p>
                  </div>
                  <button 
                    onClick={() => setDataConsent(!dataConsent)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                      dataConsent ? 'bg-emerald-600' : 'bg-zinc-200'
                    }`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      dataConsent ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">Política de Privacidade</h4>
                  <p className="text-blue-700 text-sm mb-4">Seus dados são protegidos por TLS 1.3 e armazenados em servidores seguros com criptografia em repouso.</p>
                  <button className="text-blue-600 font-bold text-sm hover:underline">VISUALIZAR POLÍTICA COMPLETA</button>
                </div>
              </div>
            </motion.div>

            {/* Security Logs */}
            <motion.div variants={itemVariants} className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 shadow-xl text-zinc-900">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <FileUp className="w-6 h-6 text-amber-600" />
                Logs de Segurança
              </h2>
              <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-50 sticky top-0">
                      <tr>
                        <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Evento</th>
                        <th className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Data/Hora</th>
                        <th className="text-right py-3 px-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Gravidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {securityLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-400 italic text-sm">Nenhum log registrado.</td>
                        </tr>
                      ) : (
                        securityLogs.map(log => (
                          <tr key={log.id} className="text-sm">
                            <td className="py-3 px-4 font-medium">{log.event}</td>
                            <td className="py-3 px-4 text-zinc-500">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                log.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                log.severity === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {log.severity}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
