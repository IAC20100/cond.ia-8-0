import { useStore } from '../store';
import { TicketStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { safeFormatDate } from '../utils/dateUtils';
import { SortableTile } from '../components/dashboard/SortableTile';
import { WeatherTile } from '../components/dashboard/WeatherTile';
import { WhatsappStatusTile } from '../components/dashboard/WhatsappStatusTile';
import { TechnicalReportTile } from '../components/dashboard/TechnicalReportTile';
import { FinancialTile } from '../components/dashboard/FinancialTile';
import { FinancialBrainTile } from '../components/dashboard/FinancialBrainTile';
import { BudgetForecastTile } from '../components/dashboard/BudgetForecastTile';
import { CalendarTile } from '../components/dashboard/CalendarTile';
import { IntelligentChecklistTile } from '../components/dashboard/IntelligentChecklistTile';
import { QrCodesTile } from '../components/dashboard/QrCodesTile';
import { QrReportsTile } from '../components/dashboard/QrReportsTile';
import { ApprovalsTile } from '../components/dashboard/ApprovalsTile';
import { KanbanTile } from '../components/dashboard/KanbanTile';
import { QuickActionsTile } from '../components/dashboard/QuickActionsTile';
import { IncomingMoneyTile } from '../components/dashboard/IncomingMoneyTile';
import { SuppliesTile } from '../components/dashboard/SuppliesTile';
import { ConsumptionTile } from '../components/dashboard/ConsumptionTile';
import { LockerTile } from '../components/dashboard/LockerTile';
import { MonitoringTile } from '../components/dashboard/MonitoringTile';
import { SettingsTile } from '../components/dashboard/SettingsTile';
import { DocumentFactoryTile } from '../components/dashboard/DocumentFactoryTile';
import { PresentationTile } from '../components/dashboard/PresentationTile';
import { WaterManagementTile } from '../components/dashboard/WaterManagementTile';
import { BillingRulesTile } from '../components/dashboard/BillingRulesTile';
import { ContractsTile } from '../components/dashboard/ContractsTile';
import { RenovationsMovesTile } from '../components/dashboard/RenovationsMovesTile';
import { MarketplaceTile } from '../components/dashboard/MarketplaceTile';
import { LostAndFoundTile } from '../components/dashboard/LostAndFoundTile';
import { BackupDemoTile } from '../components/dashboard/BackupDemoTile';
import { CondfyIaTile } from '../components/dashboard/CondfyIaTile';
import { DocumentFactorySquareTile } from '../components/dashboard/DocumentFactorySquareTile';
import { TicketsTile } from '../components/dashboard/TicketsTile';
import { ClientsTile } from '../components/dashboard/ClientsTile';
import { ProductsTile } from '../components/dashboard/ProductsTile';
import { ReceiptsTile } from '../components/dashboard/ReceiptsTile';
import { QuotesTile } from '../components/dashboard/QuotesTile';
import { 
  Users, FileText, Plus, Hammer, 
  DollarSign, TrendingUp, Package, Database, 
  Calendar as CalendarIcon, CloudSun, Image as ImageIcon,
  Settings, Moon, Sun, UserPlus, Sun as SunIcon,
  Columns, Clock, ClipboardCheck, AlertCircle, QrCode, AlertTriangle,
  BarChart3, Droplets, Zap, ShieldCheck, Megaphone,
  Box, UserCheck, Activity, Maximize2, CheckCircle2, Presentation, LogOut,
  X, Download, FileUp, Database as DatabaseIcon, MessageSquare, Target,
  Wifi, WifiOff, GripVertical, ClipboardList, LayoutList,
  Bell, Truck, Brain, ExternalLink, Sparkles, LineChart
} from 'lucide-react';
import { KanbanMirror } from '../components/KanbanMirror';
import { TicketsMirror } from '../components/TicketsMirror';
import { SavingsMirror } from '../components/SavingsMirror';
import { CostsMirror } from '../components/CostsMirror';
import { ReceiptsMirror } from '../components/ReceiptsMirror';
import { IncomingMoneyMirror } from '../components/IncomingMoneyMirror';
import { QuotesMirror } from '../components/QuotesMirror';
import { WaterManagementMirror } from '../components/WaterManagementMirror';
import { MonitoringMirror } from '../components/MonitoringMirror';
import { Modal } from '../components/Modal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import toast from 'react-hot-toast';
import { sendWhatsAppMessage } from '../services/whatsappService';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Store, Search } from 'lucide-react'; // Added icons for new tiles
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TileData {
  id: string;
  type: 'wide' | 'square';
}



export default function Dashboard() {
  const navigate = useNavigate();
  const { 
    clients, tickets, products, receipts, costs, quotes,
    appointments, companyLogo, restoreData, theme, 
    toggleTheme, scheduledMaintenances, addNotification,
    notifications, supplyItems, payments, notices,
    packages, visitors, criticalEvents, energyData, logout,
    hiddenTiles, toggleTileVisibility, companySignature, companyData,
    assemblies, savingsGoals, consumptionReadings,
    contracts, renovations, moves, billingRules, budgetForecasts,
    classifieds = [], lostAndFound = [],
    tileSizes: storeTileSizes,
    tileOrder: storeTileOrder,
    setTileSizes: updateStoreTileSizes,
    setTileOrder: updateStoreTileOrder,
    biaOnline,
    biaEnabled,
    toggleBia
  } = useStore();

  const [isEditMode, setIsEditMode] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isAddingMoneyToGoal, setIsAddingMoneyToGoal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [moneyToAdd, setMoneyToAdd] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const backupInputRef = useRef<HTMLInputElement>(null);
  
  const [biaStatus, setBiaStatus] = useState<{ 
    status: string; 
    supabaseConfigured: boolean;
    geminiConfigured: boolean;
    evoConfigured: boolean;
    lastWebhookReceived: string | null;
    lastMessageExtracted: string | null;
    appUrl?: string;
  } | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const contentType = res.headers.get('content-type');
        
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setBiaStatus(data);
          retryCount = 0; // Reset retry count on success
        } else {
          const text = await res.text();
          console.warn('Bia status check returned non-JSON or error:', res.status, text.substring(0, 100));
        }
      } catch (e) {
        console.error('Error checking Bia status:', e);
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying Bia status check (${retryCount}/${maxRetries})...`);
          setTimeout(checkStatus, 2000 * retryCount); // Exponential backoff
        }
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check less frequently to reduce noise
    return () => clearInterval(interval);
  }, []);

  const openTickets = tickets.filter(t => t.status !== 'CONCLUIDO').length;
  const pendingApprovalCount = tickets.filter(t => t.status === 'PENDENTE_APROVACAO').length;
  const lowStockCount = supplyItems.filter(item => item.currentStock <= item.minStock).length;
  const totalDelinquency = payments.filter(p => p.status === 'OVERDUE').reduce((acc, curr) => acc + curr.amount, 0);
  const overdueMaintenances = useMemo(() => {
    return scheduledMaintenances.filter(m => {
      if (!m.nextDate) return false;
      const isOverdue = new Date(m.nextDate) < new Date();
      return isOverdue;
    }).length;
  }, [scheduledMaintenances]);

  // Check for overdue maintenances and notify
  useEffect(() => {
    const overdueItems = scheduledMaintenances.filter(m => {
      if (!m.nextDate) return false;
      const isOverdue = new Date(m.nextDate) < new Date();
      return isOverdue;
    });

    overdueItems.forEach(item => {
      const client = clients.find(c => c.id === item.clientId);
      const notificationId = `overdue-${item.id}-${item.nextDate}`;
      
      // Only add if not already notified for this specific item/date
      if (!notifications.some(n => n.message.includes(item.item) && n.message.includes(client?.name || ''))) {
        addNotification({
          title: 'Manutenção Atrasada!',
          message: `${item.item} em ${client?.name} venceu em ${safeFormatDate(item.nextDate)}`,
          type: 'WARNING'
        });
      }
    });
  }, [scheduledMaintenances, clients, addNotification]);

  const totalReceitas = receipts.reduce((acc, curr) => acc + curr.value, 0);
  const totalDespesas = costs.reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalDespesas;
  const nextAppointments = useMemo(() => {
    return appointments
      .filter(a => a.start && new Date(a.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 3);
  }, [appointments]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [isTestingWhatsapp, setIsTestingWhatsapp] = useState(false);

  const handleTestWhatsapp = async () => {
    setIsTestingWhatsapp(true);
    try {
      // Test outgoing
      const success = await sendWhatsAppMessage('5511999999999', 'Teste de conexão BiaBrain ' + new Date().toLocaleTimeString());
      if (success) {
        toast.success('Mensagem de teste enviada!');
      } else {
        toast.error('Falha ao enviar mensagem. Verifique as chaves da Evolution API.');
      }
      
      // Test incoming (simulate webhook)
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

  const [manualCommand, setManualCommand] = useState('');

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

  const initialTiles: TileData[] = [
    { id: 'technical-report', type: 'square' },
    { id: 'document-factory', type: 'square' },
    { id: 'whatsapp-status', type: 'square' },
    { id: 'tickets', type: 'wide' },
    { id: 'clients', type: 'square' },
    { id: 'products', type: 'square' },
    { id: 'receipts', type: 'square' },
    { id: 'quotes', type: 'wide' },
    { id: 'financial', type: 'wide' },
    { id: 'financial-brain', type: 'wide' },
    { id: 'budget-forecast', type: 'wide' },
    { id: 'calendar', type: 'square' },
    { id: 'intelligent-checklist', type: 'wide' },
    { id: 'qr-codes', type: 'square' },
    { id: 'qr-reports', type: 'wide' },
    { id: 'approvals', type: 'wide' },
    { id: 'kanban', type: 'wide' },
    { id: 'weather', type: 'wide' },
    { id: 'quick-actions', type: 'square' },
    { id: 'incoming-money', type: 'wide' },
    { id: 'supplies', type: 'wide' },
    { id: 'consumption', type: 'wide' },
    { id: 'locker', type: 'square' },
    { id: 'monitoring', type: 'wide' },
    { id: 'settings', type: 'square' },
    { id: 'document-factory-wide', type: 'wide' },
    { id: 'system-presentation', type: 'wide' },
    { id: 'water-management', type: 'wide' },
    { id: 'billing-rules', type: 'square' },
    { id: 'contracts', type: 'wide' },
    { id: 'renovations-moves', type: 'wide' },
    { id: 'marketplace', type: 'wide' },
    { id: 'lost-and-found', type: 'wide' },
    { id: 'demo-data', type: 'square' },
    { id: 'condfy-ia-login', type: 'square' }
  ];

  const [tileSizes, setTileSizes] = useState<Record<string, 'small' | 'medium' | 'large'>>({});
  const [tiles, setTiles] = useState<TileData[]>(initialTiles);

  // Initialize tiles and sizes from store
  useEffect(() => {
    if (storeTileSizes && Object.keys(storeTileSizes).length > 0) {
      setTileSizes(storeTileSizes);
    }
  }, [storeTileSizes]);

  useEffect(() => {
    if (storeTileOrder && storeTileOrder.length > 0) {
      // Remove duplicates from storeTileOrder to prevent duplicate keys
      const uniqueOrder = Array.from(new Set(storeTileOrder));
      
      const orderedTiles = uniqueOrder
        .map(id => initialTiles.find(t => t.id === id))
        .filter(Boolean) as TileData[];
      
      // Add any new tiles that are not in the saved order
      const newTiles = initialTiles.filter(t => !uniqueOrder.includes(t.id));
      setTiles([...orderedTiles, ...newTiles]);
    } else {
      setTiles(initialTiles);
    }
  }, [storeTileOrder]);

  const handleResize = (id: string, defaultType: 'wide' | 'square', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentSize = tileSizes[id] || (defaultType === 'wide' ? 'medium' : 'small');
    const nextSize: 'small' | 'medium' | 'large' = currentSize === 'small' ? 'medium' : currentSize === 'medium' ? 'large' : 'small';
    const newSizes = { ...tileSizes, [id]: nextSize };
    setTileSizes(newSizes);
    updateStoreTileSizes(newSizes);
  };



  const handleAddMoneyToGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || moneyToAdd <= 0) return;

    const goal = savingsGoals.find(g => g.id === selectedGoalId);
    if (goal) {
      const newAmount = goal.currentAmount + moneyToAdd;
      useStore.getState().updateSavingsGoal(selectedGoalId, {
        currentAmount: newAmount,
        status: newAmount >= goal.targetAmount ? 'COMPLETED' : goal.status
      });
      toast.success(`R$ ${moneyToAdd.toLocaleString('pt-BR')} adicionados à meta!`);
      setIsAddingMoneyToGoal(false);
      setMoneyToAdd(0);
      setSelectedGoalId(null);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      clients,
      checklistItems: useStore.getState().checklistItems,
      tickets,
      quotes: useStore.getState().quotes,
      receipts,
      costs,
      appointments,
      products,
      companyLogo,
      companySignature,
      companyData,
      hiddenTiles,
      version: '1.0',
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
    setShowBackupModal(false);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          setConfirmModal({
            isOpen: true,
            title: 'Restaurar Backup',
            message: 'Atenção: Restaurar um backup irá substituir todos os dados atuais. Deseja continuar?',
            onConfirm: () => {
              restoreData(json);
              setShowBackupModal(false);
              toast.success('Backup restaurado com sucesso!');
            }
          });
        } catch (error) {
          console.error('Erro ao importar backup:', error);
          toast.error('Erro ao importar backup. Verifique o arquivo.');
        }
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = '';
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tiles.findIndex((item) => item.id === active.id);
      const newIndex = tiles.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(tiles, oldIndex, newIndex);
      setTiles(newItems);
      updateStoreTileOrder(newItems.map(t => t.id));
    }
  }

  const renderTile = (id: string) => {
    switch (id) {
      case 'technical-report':
        return <TechnicalReportTile isEditMode={isEditMode} />;
      case 'document-factory':
        return <DocumentFactorySquareTile isEditMode={isEditMode} contractsCount={contracts.length} />;
      case 'whatsapp-status':
        return (
          <WhatsappStatusTile 
            biaEnabled={biaEnabled}
            toggleBia={toggleBia}
            biaOnline={biaOnline}
            biaStatus={biaStatus}
          />
        );
      case 'tickets':
        return <TicketsTile isEditMode={isEditMode} tickets={tickets} />;
      case 'clients':
        return <ClientsTile isEditMode={isEditMode} clientsCount={clients.length} />;
      case 'products':
        return <ProductsTile isEditMode={isEditMode} productsCount={products.length} />;
      case 'receipts':
        return <ReceiptsTile isEditMode={isEditMode} receiptsCount={receipts.length} />;
      case 'quotes':
        return <QuotesTile isEditMode={isEditMode} quotes={quotes} clients={clients} />;
      case 'financial':
        return <FinancialTile isEditMode={isEditMode} saldo={saldo} />;
      case 'financial-brain':
        return <FinancialBrainTile isEditMode={isEditMode} />;
      case 'budget-forecast':
        return <BudgetForecastTile isEditMode={isEditMode} />;
      case 'calendar':
        return <CalendarTile isEditMode={isEditMode} nextAppointments={nextAppointments} />;
      case 'intelligent-checklist':
        return <IntelligentChecklistTile isEditMode={isEditMode} overdueMaintenances={overdueMaintenances} />;
      case 'qr-codes':
        return <QrCodesTile isEditMode={isEditMode} />;
      case 'qr-reports':
        return <QrReportsTile isEditMode={isEditMode} tickets={tickets} />;
      case 'approvals':
        return <ApprovalsTile isEditMode={isEditMode} tickets={tickets} safeFormatDate={safeFormatDate} />;
      case 'kanban':
        return <KanbanTile isEditMode={isEditMode} tickets={tickets} />;
      case 'weather':
        return <WeatherTile />;
      case 'quick-actions':
        return <QuickActionsTile isEditMode={isEditMode} />;
      case 'incoming-money':
        return <IncomingMoneyTile isEditMode={isEditMode} receipts={receipts} payments={payments} />;
      case 'supplies':
        return <SuppliesTile isEditMode={isEditMode} lowStockCount={lowStockCount} />;
      case 'consumption':
        return <ConsumptionTile isEditMode={isEditMode} />;
      case 'locker':
        return <LockerTile isEditMode={isEditMode} packages={packages} />;
      case 'monitoring':
        return <MonitoringTile isEditMode={isEditMode} criticalEvents={criticalEvents} />;
      case 'settings':
        return <SettingsTile isEditMode={isEditMode} />;
      case 'document-factory-wide':
        return <DocumentFactoryTile isEditMode={isEditMode} />;
      case 'system-presentation':
        return <PresentationTile isEditMode={isEditMode} />;
      case 'water-management':
        return <WaterManagementTile isEditMode={isEditMode} consumptionReadings={consumptionReadings} criticalEvents={criticalEvents} />;
      case 'billing-rules':
        return <BillingRulesTile isEditMode={isEditMode} />;
      case 'contracts':
        return <ContractsTile isEditMode={isEditMode} contracts={contracts} />;
      case 'renovations-moves':
        return <RenovationsMovesTile isEditMode={isEditMode} renovations={renovations} moves={moves} />;
      case 'marketplace':
        return <MarketplaceTile isEditMode={isEditMode} classifieds={classifieds} />;
      case 'lost-and-found':
        return <LostAndFoundTile isEditMode={isEditMode} lostAndFound={lostAndFound} />;
      case 'demo-data':
        return <BackupDemoTile isEditMode={isEditMode} setShowBackupModal={setShowBackupModal} />;
      case 'condfy-ia-login':
        return <CondfyIaTile isEditMode={isEditMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen -m-6 md:-m-8 p-3 sm:p-8 md:p-12 bg-[#004a7c] text-white overflow-x-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="currentColor" className="text-white/5" fillOpacity="0.5" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="currentColor" className="text-white/10" fillOpacity="0.5" />
        </svg>
      </div>

      <header className="mb-4 md:mb-12 flex justify-between items-start relative z-10 gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-black tracking-tight text-white shrink-0">Iniciar</h1>
            
            {/* Bia Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all mt-2 md:mt-4 ${
              biaStatus?.status === 'online' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                biaStatus?.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'
              }`} />
              <span className="text-[0.75rem] font-display font-black uppercase tracking-widest">
                Bia {biaStatus?.status === 'online' ? 'Online' : 'Offline'}
              </span>
              {biaStatus?.lastWebhookReceived && (
                <span className="text-[0.625rem] opacity-60 ml-2 font-medium">
                  Último sinal: {new Date(biaStatus.lastWebhookReceived).toLocaleTimeString('pt-BR')}
                </span>
              )}
              {!biaStatus?.supabaseConfigured && biaStatus?.status === 'online' && (
                <span className="text-[0.5rem] opacity-60 ml-1">(Erro Supabase)</span>
              )}
              {!biaStatus?.geminiConfigured && biaStatus?.status === 'online' && (
                <span className="text-[0.5rem] opacity-60 ml-1">(Erro IA)</span>
              )}
              {!biaStatus?.evoConfigured && biaStatus?.status === 'online' && (
                <span className="text-[0.5rem] opacity-60 ml-1">(Erro WhatsApp)</span>
              )}
            </div>
          </div>
          
          {biaStatus?.lastMessageExtracted && (
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 mb-2 w-fit animate-pulse">
              <p className="text-[0.625rem] font-display font-black uppercase tracking-widest text-white/40 mb-1">Bia ouviu agora mesmo:</p>
              <p className="text-[0.75rem] italic text-emerald-400 font-medium">"{biaStatus.lastMessageExtracted}"</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <div className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 flex items-center gap-2">
              <span className="text-[0.625rem] text-white/40 uppercase font-bold tracking-wider">Webhook:</span>
              <code className="text-[0.625rem] text-blue-400 font-mono truncate max-w-[150px]">
                {window.location.origin}/api/webhook/whatsapp
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/webhook/whatsapp`);
                  toast.success('URL do Webhook copiada!');
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Copiar URL do Webhook"
              >
                <Database className="w-3 h-3 text-white/60" />
              </button>
            </div>
            
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button 
              onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.75rem] font-display font-black uppercase tracking-widest transition-all w-fit ${
              isEditMode 
                ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <Columns className="w-3 h-3" />
            {isEditMode ? 'Salvar Layout' : 'Personalizar'}
          </button>
          <button 
            onClick={async () => {
              const loadingToast = toast.loading('Enviando mensagem de teste...');
              try {
                await sendWhatsAppMessage('21982240134', 'Olá! Eu sou a Bia, sua assistente virtual do CONDFY.IA. Recebi seu comando e estou pronta para ajudar! 🚀');
                toast.success('Mensagem enviada com sucesso!', { id: loadingToast });
              } catch (error) {
                toast.error('Erro ao enviar mensagem.', { id: loadingToast });
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.625rem] font-display font-black uppercase tracking-widest transition-all w-fit bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:bg-blue-600"
          >
            <Brain className="w-3 h-3" />
            Testar Bia
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-6 min-w-0">
          <button 
            onClick={toggleTheme}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white shrink-0"
          >
            {theme === 'dark' ? <SunIcon className="w-4 h-4 md:w-6 md:h-6" /> : <Moon className="w-4 h-4 md:w-6 md:h-6" />}
          </button>
          <div className="text-right min-w-0">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/20 mb-1 md:mb-2 ml-auto" />
            ) : (
              <div className="w-10 h-10 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center text-white/60 mb-1 md:mb-2 ml-auto">
                <Database className="w-5 h-5 md:w-8 md:h-8" />
              </div>
            )}
            <p className="text-sm sm:text-base md:text-xl font-display font-bold text-white truncate">Administrador</p>
            <p className="text-[0.625rem] md:text-sm text-white/60 font-medium truncate">{companyData?.name || 'CONDFY.IA'}</p>
            <button 
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Sair do Sistema',
                  message: 'Deseja realmente sair do sistema?',
                  onConfirm: logout
                });
              }}
              className="mt-1 text-[0.625rem] md:text-[0.75rem] font-display font-black uppercase tracking-[0.2em] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 ml-auto group"
            >
              <LogOut className="w-2 h-2 md:w-2.5 md:h-2.5 group-hover:-translate-x-1 transition-transform" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={tiles.map(t => t.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 relative z-10 max-w-[1400px] perspective-1000 grid-flow-dense">
            {tiles.filter(t => !hiddenTiles.includes(t.id)).map((tile) => {
              const currentSize = tileSizes[tile.id] || (tile.type === 'wide' ? 'medium' : 'small');
              const sizeClasses = currentSize === 'small' ? 'col-span-1 row-span-1 aspect-square' :
                                  currentSize === 'medium' ? 'col-span-2 row-span-1 aspect-[2/1] sm:aspect-video md:aspect-[2/1]' :
                                  'col-span-2 row-span-2 aspect-square';
              return (
                <SortableTile 
                  key={tile.id} 
                  id={tile.id} 
                  className={sizeClasses}
                  isEditMode={isEditMode}
                  onResize={(e) => handleResize(tile.id, tile.type, e)}
                  onClose={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTileVisibility(tile.id);
                  }}
                >
                  {renderTile(tile.id)}
                </SortableTile>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Backup e Sistema</h3>
              <button onClick={() => setShowBackupModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={handleExportBackup}
                className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-display font-bold flex items-center gap-3 transition-all active:scale-95"
              >
                <Download className="w-6 h-6" />
                <div>
                  <p className="text-left font-display">Gerar Backup Completo</p>
                  <p className="text-xs font-normal opacity-70">Baixe todos os dados para outro PC</p>
                </div>
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
                  className="w-full p-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-2xl font-display font-bold flex items-center gap-3 transition-all active:scale-95"
                >
                  <FileUp className="w-6 h-6" />
                  <div>
                    <p className="text-left font-display">Restaurar Backup</p>
                    <p className="text-xs font-normal opacity-70">Carregar arquivo .json</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Money to Goal Modal */}
      <Modal 
        isOpen={isAddingMoneyToGoal} 
        onClose={() => {
          setIsAddingMoneyToGoal(false);
          setMoneyToAdd(0);
          setSelectedGoalId(null);
        }} 
        title="Adicionar Dinheiro à Meta"
        maxWidth="sm"
        glass={true}
      >
        <form onSubmit={handleAddMoneyToGoal} className="space-y-6 p-2">
          <div>
            <p className="text-white/60 text-sm mb-4">
              Meta: <span className="text-white font-display font-bold">{savingsGoals.find(g => g.id === selectedGoalId)?.title}</span>
            </p>
            <label className="block text-sm font-display font-bold uppercase tracking-wider text-white/60 mb-2">Valor a Adicionar (R$) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-display font-bold">R$</span>
              <input 
                type="number" 
                value={moneyToAdd || ''}
                onChange={(e) => setMoneyToAdd(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/30 rounded-xl pl-12 pr-4 py-3 outline-none transition-all text-white"
                min="0.01"
                step="0.01"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              type="button"
              onClick={() => {
                setIsAddingMoneyToGoal(false);
                setMoneyToAdd(0);
                setSelectedGoalId(null);
              }}
              className="px-6 py-3 text-white/60 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-10 py-3 rounded-xl font-display font-bold border border-emerald-500/30 transition-all active:scale-95 shadow-lg backdrop-blur-md"
            >
              ADICIONAR
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type="danger"
      />
    </div>
  );
}
