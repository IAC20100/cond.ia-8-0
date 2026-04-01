import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured, isLocalSupabase } from './lib/supabase';
import { Security } from './lib/security';
import { toast } from 'react-hot-toast';
import { NBR5674_STANDARDS } from './constants/maintenance';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Client, ChecklistItem, TicketType, TicketStatus, Quote, Receipt, Cost, 
  SavingsGoal, Appointment, Ticket, CompanyData, Product, Supplier, 
  SupplyItem, SupplyQuotation, Payment, LegalAgreement, ScheduledMaintenance, 
  AppNotification, ConsumptionReading, Assembly, Notice, Package, Visitor, 
  CriticalEvent, EnergyRecord, AppState, DigitalFolderItem, Vote, DocumentTemplate, IotState,
  Contract, Renovation, Move, BillingRule, BudgetForecast
} from './types';

import { sendWhatsAppMessage } from './services/whatsappService';
import { safeFormatDate } from './utils/dateUtils';

export const useStore = create<AppState>()(
  (set, get) => ({
      clients: [],
      checklistItems: [],
      tickets: [],
      quotes: [],
      receipts: [],
      costs: [],
      appointments: [],
      products: [],
      suppliers: [],
      supplyItems: [],
      supplyQuotations: [],
      payments: [],
      legalAgreements: [],
      contracts: [],
      renovations: [],
      moves: [],
      billingRules: [
        {
          id: '1',
          name: 'Padrão Condomínio',
          daysBeforeDue: [5, 2],
          daysAfterDue: [1, 5, 10],
          messageTemplate: 'Olá {nome}, lembramos que seu boleto vence em {vencimento}.',
          active: true
        },
        {
          id: '2',
          name: 'Aviso de Inadimplência (15 dias)',
          daysBeforeDue: [],
          daysAfterDue: [15],
          messageTemplate: 'Prezado {nome}, identificamos que seu boleto vencido em {vencimento} ainda não foi quitado. Por favor, regularize sua situação.',
          active: true
        }
      ],
      budgetForecasts: [],
      scheduledMaintenances: [],
      notifications: [],
      consumptionReadings: [],
      digitalFolder: [],
      notices: [],
      packages: [],
      visitors: [],
      criticalEvents: [],
      energyData: [],
      savingsGoals: [],
      feedbacks: [],
      assemblies: [],
      reservations: [],
      staff: [],
      keys: [],
      classifieds: [],
      lostAndFound: [],
      users: [],
      iotDevices: [
        {
          id: '1',
          name: 'Portão Principal (ESP32)',
          type: 'ACTUATOR',
          status: 'ONLINE',
          lastSeen: new Date().toISOString(),
          deviceKey: 'dev_key_778899',
          firmwareVersion: '1.2.0',
          mqttTls: true
        },
        {
          id: '2',
          name: 'Sensor de Nível Caixa d\'água',
          type: 'SENSOR',
          status: 'ONLINE',
          lastSeen: new Date().toISOString(),
          deviceKey: 'dev_key_112233',
          firmwareVersion: '1.0.5',
          mqttTls: true
        }
      ],
      iotState: {
        pumps: {
          caixa: false,
          jardim: false,
          auto: true,
        },
        lights: {
          cozinha: 0,
          sala: 0,
          jardim: 0,
          todas: false,
        },
        alarmActive: false,
      },
      companyLogo: '',
      companySignature: '',
      companySettingsId: null,
      companyData: {
        name: '',
        document: '',
        phone: '',
        email: '',
        address: '',
        website: ''
      },
      mfaEnabled: false,
      dataConsent: false,
      encryptionActive: false,
      securityLogs: [],
      theme: 'light',
      isAuthenticated: false,
      menuOrder: ['dashboard', 'accountability', 'consumption', 'clients', 'products', 'supplies', 'tickets', 'kanban', 'quotes', 'receipts', 'financial', 'calendar', 'marketplace', 'lost-and-found', 'settings'],
      hiddenTiles: [],
      tileSizes: {},
      tileOrder: null,
      documentTemplates: [],
      isLoading: false,
      whatsappEnabled: true,
      biaEnabled: true,
      biaOnline: false,
      fontSize: 16,
      
      fetchInitialData: async () => {
        if (!isSupabaseConfigured) {
          console.warn('Supabase não configurado. Usando dados locais.');
          set({ isLoading: false });
          return;
        }
        if (isLocalSupabase) {
          toast.error('Você está usando uma URL do Supabase apontando para localhost. Isso não funcionará no ambiente de preview do AI Studio.');
        }
        set({ isLoading: true });
        try {
          // Fetch all data in parallel
          const results = await Promise.all([
            supabase.from('clients').select('*'),
            supabase.from('tickets').select('*'),
            supabase.from('products').select('*'),
            supabase.from('quotes').select('*'),
            supabase.from('receipts').select('*'),
            supabase.from('costs').select('*'),
            supabase.from('appointments').select('*'),
            supabase.from('checklist_items').select('*'),
            supabase.from('suppliers').select('*'),
            supabase.from('supply_items').select('*'),
            supabase.from('payments').select('*'),
            supabase.from('legal_agreements').select('*'),
            supabase.from('scheduled_maintenances').select('*'),
            supabase.from('consumption_readings').select('*'),
            supabase.from('assemblies').select('*'),
            supabase.from('notices').select('*'),
            supabase.from('packages').select('*'),
            supabase.from('visitors').select('*'),
            supabase.from('critical_events').select('*'),
            supabase.from('digital_folder').select('*'),
            supabase.from('supply_quotations').select('*'),
            supabase.from('company_settings').select('*').single(),
            supabase.from('notifications').select('*'),
            supabase.from('savings_goals').select('*'),
            supabase.from('document_templates').select('*'),
            supabase.from('contracts').select('*'),
            supabase.from('system_users').select('*'),
            supabase.from('renovations').select('*'),
            supabase.from('moves').select('*'),
            supabase.from('billing_rules').select('*'),
            supabase.from('budget_forecasts').select('*'),
            supabase.from('feedbacks').select('*'),
            supabase.from('reservations').select('*'),
            supabase.from('staff').select('*'),
            supabase.from('keys').select('*'),
            supabase.from('classifieds').select('*'),
            supabase.from('lost_and_found').select('*')
          ]);

          const [
            clientsRes, ticketsRes, productsRes, quotesRes, receiptsRes, 
            costsRes, appointmentsRes, checklistRes, suppliersRes, 
            supplyItemsRes, paymentsRes, legalAgreementsRes, 
            scheduledMaintenancesRes, consumptionReadingsRes, 
            assembliesRes, noticesRes, packagesRes, visitorsRes, 
            criticalEventsRes, digitalFolderRes, supplyQuotationsRes, 
            companySettingsRes, notificationsRes, savingsGoalsRes, documentTemplatesRes,
            contractsRes, usersRes, renovationsRes, movesRes, billingRulesRes, budgetForecastsRes, feedbacksRes, reservationsRes, staffRes, keysRes, classifiedsRes, lostAndFoundRes
          ] = results;

          // If company settings don't exist, create a default row
          if (companySettingsRes.error && companySettingsRes.error.code === 'PGRST116') {
            const defaultSettings = {
              name: 'CONDFY.IA',
              document: '',
              phone: '',
              email: '',
              address: '',
              website: '',
              theme: 'light',
              menu_order: ['dashboard', 'accountability', 'consumption', 'clients', 'products', 'supplies', 'tickets', 'kanban', 'quotes', 'receipts', 'financial', 'calendar', 'marketplace', 'lost-and-found', 'settings'],
              tile_sizes: {},
              tile_order: null,
              hidden_tiles: []
            };
            const { data: newSettings, error: createError } = await supabase
              .from('company_settings')
              .insert([defaultSettings])
              .select()
              .single();
            
            if (!createError && newSettings) {
              companySettingsRes.data = newSettings;
            }
          }

          // Check for errors
          results.forEach((res, index) => {
            if (res.error && res.error.code !== 'PGRST116') { 
              const msg = res.error.message || '';
              if (msg.includes('Failed to fetch') || msg.includes('TypeError')) {
                return;
              }
              // Se for erro de tabela não encontrada (PGRST205), apenas avisa no console de forma amigável
              if (res.error.code === 'PGRST205') {
                console.warn(`Tabela (index ${index}) ainda não criada no Supabase. Use o SQL Editor para criá-la.`);
              } else {
                console.error(`Erro ao carregar tabela (index ${index}):`, res.error);
              }
            }
          });

          const newState: Partial<AppState> = {};

          if (clientsRes.data) {
            newState.clients = clientsRes.data.map(c => ({
              id: c.id,
              name: c.name,
              document: c.document,
              contactPerson: c.contact_person,
              phone: c.phone,
              email: c.email,
              address: c.address,
              notes: c.notes,
              locations: c.locations || [],
              tower: c.tower,
              unit: c.unit,
              vehicles: c.vehicles,
              pets: c.pets,
              cisternVolume: c.cistern_volume,
              reservoirVolume: c.reservoir_volume
            }));
          }

          if (ticketsRes.data) {
            newState.tickets = ticketsRes.data.map(t => ({
              id: t.id,
              osNumber: t.os_number,
              title: t.title,
              type: t.type as TicketType,
              status: t.status as TicketStatus,
              maintenanceCategory: t.maintenance_category,
              maintenanceSubcategory: t.maintenance_subcategory,
              clientId: t.client_id,
              date: t.date,
              technician: t.technician,
              observations: t.observations,
              reportedProblem: t.reported_problem,
              productsForQuote: t.products_for_quote,
              serviceReport: t.service_report,
              checklistResults: t.checklist_results,
              images: t.images,
              reportedBy: t.reported_by,
              location: t.location,
              photoBefore: t.photo_before,
              budgetAmount: t.budget_amount,
              budgetApproved: t.budget_approved,
              color: t.color,
              history: t.history
            }));
          }

          if (productsRes.data) {
            newState.products = productsRes.data.map(p => ({
              id: p.id,
              code: p.code,
              name: p.name,
              description: p.description,
              price: Number(p.price),
              unit: p.unit
            }));
          }

          if (quotesRes.data) {
            newState.quotes = quotesRes.data.map(q => ({
              id: q.id,
              clientId: q.client_id,
              date: q.date,
              totalValue: Number(q.total_value),
              status: q.status as any,
              items: q.items
            }));
          }

          if (receiptsRes.data) {
            newState.receipts = receiptsRes.data.map(r => ({
              id: r.id,
              clientId: r.client_id,
              date: r.date,
              value: Number(r.value),
              description: r.description
            }));
          }

          if (costsRes.data) {
            newState.costs = costsRes.data.map(c => ({
              id: c.id,
              description: c.description,
              value: Number(c.value),
              date: c.date,
              category: c.category
            }));
          }

          if (appointmentsRes.data) {
            newState.appointments = appointmentsRes.data.map(a => ({
              id: a.id,
              title: a.title,
              start: a.start_time,
              end: a.end_time,
              type: a.type as any,
              ticketId: a.ticket_id,
              notes: a.notes
            }));
          }

          if (checklistRes.data) {
            newState.checklistItems = checklistRes.data.map(i => ({
              id: i.id,
              task: i.task,
              category: i.category,
              clientId: i.client_id,
              clientIds: i.client_ids
            }));
          }

          if (suppliersRes.data) {
            newState.suppliers = suppliersRes.data.map(s => ({
              id: s.id,
              name: s.name,
              contact: s.contact,
              phone: s.phone,
              email: s.email,
              category: s.category
            }));
          }

          if (supplyItemsRes.data) {
            newState.supplyItems = supplyItemsRes.data.map(i => ({
              id: i.id,
              name: i.name,
              category: i.category,
              currentStock: i.current_stock,
              minStock: i.min_stock,
              unit: i.unit,
              lastPrice: i.last_price ? Number(i.last_price) : undefined,
              clientId: i.client_id
            }));
          }

          if (paymentsRes.data) {
            newState.payments = paymentsRes.data.map(p => ({
              id: p.id,
              clientId: p.client_id,
              amount: Number(p.amount),
              dueDate: p.due_date,
              paymentDate: p.payment_date,
              status: p.status as any,
              reference: p.reference
            }));
          }

          if (legalAgreementsRes.data) {
            newState.legalAgreements = legalAgreementsRes.data.map(a => ({
              id: a.id,
              clientId: a.client_id,
              totalAmount: Number(a.total_amount),
              installments: a.installments,
              remainingInstallments: a.remaining_installments,
              status: a.status as any,
              startDate: a.start_date,
              notes: a.notes
            }));
          }

          if (scheduledMaintenancesRes.data) {
            newState.scheduledMaintenances = scheduledMaintenancesRes.data.map(m => ({
              id: m.id,
              clientId: m.client_id,
              standardId: m.standard_id,
              item: m.item,
              frequency: m.frequency,
              lastDone: m.last_done,
              nextDate: m.next_date,
              status: m.status as any,
              category: m.category
            }));
          }

          if (consumptionReadingsRes.data) {
            newState.consumptionReadings = consumptionReadingsRes.data.map(r => ({
              id: r.id,
              clientId: r.client_id,
              type: r.type as any,
              previousValue: Number(r.previous_value),
              currentValue: Number(r.current_value),
              consumption: Number(r.consumption),
              date: r.date,
              unit: r.unit,
              billed: r.billed
            }));
          }

          if (assembliesRes.data) {
            newState.assemblies = assembliesRes.data.map(a => ({
              id: a.id,
              title: a.title,
              description: a.description,
              date: a.date,
              status: a.status as any,
              options: a.options,
              votes: a.votes,
              legalValidityHash: a.legal_validity_hash
            }));
          }

          if (noticesRes.data) {
            newState.notices = noticesRes.data.map(n => ({
              id: n.id,
              title: n.title,
              content: n.content,
              date: n.date,
              category: n.category as any,
              tower: n.tower,
              apartmentLine: n.apartment_line,
              clientId: n.client_id
            }));
          }

          if (packagesRes.data) {
            newState.packages = packagesRes.data.map(p => ({
              id: p.id,
              residentName: p.resident_name,
              apartment: p.apartment,
              tower: p.tower,
              carrier: p.carrier,
              trackingCode: p.tracking_code,
              receivedAt: p.received_at,
              pickedUpAt: p.picked_up_at,
              status: p.status as any,
              qrCode: p.qr_code,
              photoUrl: p.photo_url,
              clientId: p.client_id
            }));
          }

          if (visitorsRes.data) {
            newState.visitors = visitorsRes.data.map(v => ({
              id: v.id,
              name: v.name,
              document: v.document,
              type: v.type as any,
              apartment: v.apartment,
              tower: v.tower,
              validUntil: v.valid_until,
              qrCode: v.qr_code,
              status: v.status as any
            }));
          }

          if (criticalEventsRes.data) {
            newState.criticalEvents = criticalEventsRes.data.map(e => ({
              id: e.id,
              device: e.device,
              location: e.location,
              type: e.type as any,
              status: e.status as any,
              lastUpdate: e.last_update,
              description: e.description
            }));
          }

          if (digitalFolderRes.data) {
            newState.digitalFolder = digitalFolderRes.data.map(i => ({
              id: i.id,
              clientId: i.client_id,
              title: i.title,
              description: i.description,
              category: i.category,
              date: i.date,
              amount: i.amount ? Number(i.amount) : undefined,
              fileUrl: i.file_url,
              status: i.status as any,
              signatures: i.signatures
            }));
          }

          if (supplyQuotationsRes.data) {
            newState.supplyQuotations = supplyQuotationsRes.data.map(q => ({
              id: q.id,
              date: q.date,
              items: q.items,
              responses: q.responses,
              status: q.status as any
            }));
          }

          if (notificationsRes.data) {
            newState.notifications = notificationsRes.data.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type as any,
              date: n.date,
              read: n.read,
              link: n.link
            }));
          }

          if (savingsGoalsRes.data) {
            newState.savingsGoals = savingsGoalsRes.data.map(g => ({
              id: g.id,
              title: g.title,
              targetAmount: g.target_amount,
              currentAmount: g.current_amount,
              deadline: g.deadline,
              category: g.category,
              icon: g.icon,
              status: g.status as any
            }));
          }

          if (documentTemplatesRes.data) {
            newState.documentTemplates = documentTemplatesRes.data.map(t => ({
              id: t.id,
              title: t.title,
              category: t.category,
              description: t.description,
              legalBasis: t.legal_basis,
              content: t.content,
              fileUrl: t.file_url
            }));
          }

          if (contractsRes.data) {
            newState.contracts = contractsRes.data.map(c => ({
              id: c.id,
              title: c.title,
              supplierId: c.supplier_id,
              category: c.category,
              startDate: c.start_date,
              endDate: c.end_date,
              value: Number(c.value),
              paymentFrequency: c.payment_frequency,
              status: c.status,
              notes: c.notes,
              fileUrl: c.file_url,
              alertDays: c.alert_days,
              alertEnabled: c.alert_enabled
            }));
          }

          if (usersRes?.data) {
            newState.users = usersRes.data.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              status: u.status,
              createdAt: u.created_at
            }));
          }

          if (companySettingsRes.data) {
            const companySettingsData = companySettingsRes.data;
            newState.companySettingsId = companySettingsData.id;
            newState.companyData = {
              name: companySettingsData.name,
              document: companySettingsData.document,
              phone: companySettingsData.phone,
              email: companySettingsData.email,
              address: companySettingsData.address,
              website: companySettingsData.website
            };
            newState.companyLogo = companySettingsData.logo_url;
            newState.companySignature = companySettingsData.signature_url;
            newState.theme = companySettingsData.theme as any;
            if (companySettingsData.menu_order) {
              newState.menuOrder = companySettingsData.menu_order;
            }
            if (companySettingsData.tile_sizes) {
              newState.tileSizes = companySettingsData.tile_sizes;
            }
            if (companySettingsData.tile_order) {
              newState.tileOrder = companySettingsData.tile_order;
            }
            if (companySettingsData.hidden_tiles) {
              newState.hiddenTiles = companySettingsData.hidden_tiles;
            }
            if (companySettingsData.font_size) {
              newState.fontSize = companySettingsData.font_size;
            }
            if (companySettingsData.energy_data) {
              newState.energyData = companySettingsData.energy_data;
            }
          }

          set(newState);
        } catch (error: any) {
          const msg = error?.message || '';
          if (!msg.includes('Failed to fetch') && !msg.includes('TypeError')) {
            console.error('Erro ao buscar dados iniciais do Supabase:', error);
          }
        } finally {
          set({ isLoading: false });
        }
      },

      setBiaOnline: (online) => set({ biaOnline: online }),
      setFontSize: async (size) => {
        set({ fontSize: size });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ font_size: size }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      setCompanyLogo: async (logo) => {
        set({ companyLogo: logo });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ logo_url: logo }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      setCompanySignature: async (signature) => {
        set({ companySignature: signature });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ signature_url: signature }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      setCompanyData: async (data) => {
        set({ companyData: data });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ 
              name: data.name,
              document: data.document,
              phone: data.phone,
              email: data.email,
              address: data.address,
              website: data.website
            }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      setMenuOrder: async (order) => {
        set({ menuOrder: order });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ menu_order: order }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      setTileSizes: async (sizes) => {
        set({ tileSizes: sizes });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ tile_sizes: sizes }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      setTileOrder: async (order) => {
        set({ tileOrder: order });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ tile_order: order }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      toggleTileVisibility: async (tileId) => {
        const state = get();
        const newHiddenTiles = state.hiddenTiles.includes(tileId)
          ? state.hiddenTiles.filter(id => id !== tileId)
          : [...state.hiddenTiles, tileId];
        
        set({ hiddenTiles: newHiddenTiles });
        
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ hidden_tiles: newHiddenTiles }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      toggleTheme: async () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ theme: newTheme }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },
      toggleWhatsApp: () => {
        set((state) => ({ whatsappEnabled: !state.whatsappEnabled }));
        toast.success(`WhatsApp ${get().whatsappEnabled ? 'ativado' : 'desativado'}`);
      },
      toggleBia: () => {
        set((state) => ({ biaEnabled: !state.biaEnabled }));
        toast.success(`Bia ${get().biaEnabled ? 'ativada' : 'desativada'}`);
      },
      toggleMfa: () => {
        const newState = !get().mfaEnabled;
        set({ mfaEnabled: newState });
        get().addSecurityLog(`MFA ${newState ? 'ativado' : 'desativado'}`, newState ? 'INFO' : 'WARNING');
        toast.success(`MFA ${newState ? 'ativado' : 'desativado'}`);
      },
      setDataConsent: (consent: boolean) => {
        set({ dataConsent: consent });
        get().addSecurityLog(`Consentimento de dados ${consent ? 'aceito' : 'revogado'}`, 'INFO');
      },
      toggleEncryption: () => {
        const newState = !get().encryptionActive;
        set({ encryptionActive: newState });
        get().addSecurityLog(`Criptografia AES-256 ${newState ? 'ativada' : 'desativada'}`, 'INFO');
        toast.success(`Criptografia AES-256 ${newState ? 'ativada' : 'desativada'}`);
      },
      addIotDevice: (device) => {
        const id = uuidv4();
        // Import Security dynamically to avoid circular dependencies if any, 
        // but here it's fine as it's a utility.
        const deviceKey = `dk_${Math.random().toString(36).substring(2, 15)}`; 
        set((state) => ({
          iotDevices: [...state.iotDevices, { 
            ...device, 
            id, 
            deviceKey, 
            lastSeen: new Date().toISOString(),
            status: 'OFFLINE'
          }]
        }));
        get().addSecurityLog(`Novo dispositivo IoT adicionado: ${device.name}`, 'INFO');
      },
      deleteIotDevice: (id) => {
        const device = get().iotDevices.find(d => d.id === id);
        set((state) => ({
          iotDevices: state.iotDevices.filter(d => d.id !== id)
        }));
        if (device) get().addSecurityLog(`Dispositivo IoT removido: ${device.name}`, 'WARNING');
      },
      updateIotDevice: (id, updated) => {
        set((state) => ({
          iotDevices: state.iotDevices.map(d => d.id === id ? { ...d, ...updated } : d)
        }));
      },
      addSecurityLog: (event: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => set((state) => ({
        securityLogs: [
          {
            id: uuidv4(),
            event,
            timestamp: new Date().toISOString(),
            severity
          },
          ...state.securityLogs.slice(0, 99)
        ]
      })),
      
      login: (user, pass) => {
        if (user === 'iac' && pass === '112213') {
          set({ isAuthenticated: true });
          // Ao fazer login, busca os dados do Supabase
          get().fetchInitialData();
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false });
      },
      
      addClient: async (client) => {
        const id = uuidv4();
        const newClient: Client = { ...client, id };

        // 1. Atualiza o estado local imediatamente (Optimistic Update)
        set((state) => ({ clients: [...state.clients, newClient] }));

        if (!isSupabaseConfigured) return;

        // 2. Tenta persistir no Supabase
        try {
          const dbClient = {
            id, // Inclui o ID gerado localmente
            name: client.name,
            document: client.document,
            contact_person: client.contactPerson,
            phone: client.phone,
            email: client.email,
            address: client.address,
            notes: client.notes,
            locations: client.locations || [],
            tower: client.tower,
            unit: client.unit,
            vehicles: client.vehicles,
            pets: client.pets,
            cistern_volume: client.cisternVolume,
            reservoir_volume: client.reservoirVolume
          };

          const { error } = await supabase.from('clients').insert([dbClient]);
          
          if (error) {
            console.error('Erro ao persistir no Supabase:', error);
            if (error.code === '42P01') {
              toast.error('Tabela "clients" não encontrada. Você executou o script SQL no Supabase?');
            } else if (error.message === 'Failed to fetch') {
              toast.error('Erro de conexão com o Supabase. Verifique se a URL do projeto está correta e se o projeto não está pausado.');
            } else {
              toast.error(`Erro ao salvar no Supabase: ${error.message}`);
            }
          } else {
            toast.success('Cliente salvo no Supabase com sucesso!');
          }
        } catch (error: any) {
          console.error('Erro de conexão com Supabase:', error);
          toast.error('Erro de conexão com Supabase. Verifique suas chaves.');
        }
      },

      updateClient: async (id, updatedClient) => {
        // 1. Atualiza localmente
        set((state) => ({
          clients: state.clients.map(c => c.id === id ? { ...updatedClient, id } : c)
        }));

        // 2. Tenta persistir no Supabase
        try {
          const dbClient = {
            name: updatedClient.name,
            document: updatedClient.document,
            contact_person: updatedClient.contactPerson,
            phone: updatedClient.phone,
            email: updatedClient.email,
            address: updatedClient.address,
            notes: updatedClient.notes,
            locations: updatedClient.locations || [],
            tower: updatedClient.tower,
            unit: updatedClient.unit,
            vehicles: updatedClient.vehicles,
            pets: updatedClient.pets,
            cistern_volume: updatedClient.cisternVolume,
            reservoir_volume: updatedClient.reservoirVolume
          };

          const { error } = await supabase.from('clients').update(dbClient).eq('id', id);
          
          if (error) {
            console.warn('Erro ao atualizar no Supabase, mantendo apenas local:', error);
          }
        } catch (error) {
          console.warn('Erro de conexão com Supabase ao atualizar:', error);
        }
      },

      deleteClient: async (id) => {
        // 1. Remove localmente
        set((state) => ({ clients: state.clients.filter(c => c.id !== id) }));

        // 2. Tenta remover no Supabase
        try {
          const { error } = await supabase.from('clients').delete().eq('id', id);
          
          if (error) {
            console.warn('Erro ao deletar no Supabase, mantendo apenas local:', error);
          }
        } catch (error) {
          console.warn('Erro de conexão com Supabase ao deletar:', error);
        }
      },
      
      addChecklistItem: async (item) => {
        const id = uuidv4();
        const newItem = { ...item, id };
        set((state) => ({ checklistItems: [...state.checklistItems, newItem] }));
        
        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('checklist_items').insert([{
            id,
            task: item.task,
            category: item.category,
            client_id: item.clientId,
            client_ids: item.clientIds
          }]);
          if (error) {
            console.error('Erro Supabase addChecklistItem:', error);
            toast.error(`Erro ao salvar checklist: ${error.message}`);
          } else {
            toast.success('Checklist salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar checklist.');
        }
      },
      updateChecklistItem: async (id, updatedItem) => {
        set((state) => ({
          checklistItems: state.checklistItems.map(i => i.id === id ? { ...updatedItem, id } : i)
        }));
        
        try {
          await supabase.from('checklist_items').update({
            task: updatedItem.task,
            category: updatedItem.category,
            client_id: updatedItem.clientId,
            client_ids: updatedItem.clientIds
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteChecklistItem: async (id) => {
        set((state) => ({ checklistItems: state.checklistItems.filter(i => i.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('checklist_items').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },
      
      addTicket: async (ticket) => {
        const state = get();
        let osNumber = ticket.osNumber;
        if (!osNumber && ticket.type !== 'TAREFA') {
          let maxOs = 0;
          state.tickets.forEach(t => {
            if (t.osNumber && t.osNumber.startsWith('OS-')) {
              const num = parseInt(t.osNumber.replace('OS-', ''), 10);
              if (!isNaN(num) && num > maxOs) {
                maxOs = num;
              }
            }
          });
          osNumber = `OS-${String(maxOs + 1).padStart(4, '0')}`;
        }
        
        const id = ticket.id || uuidv4();
        const newTicket = { ...ticket, id, osNumber } as Ticket;
        set((state) => ({ tickets: [...state.tickets, newTicket] }));

        if (!isSupabaseConfigured) return id;

        try {
          const { error } = await supabase.from('tickets').insert([{
            id,
            os_number: osNumber,
            title: ticket.title,
            type: ticket.type,
            status: ticket.status,
            maintenance_category: ticket.maintenanceCategory,
            maintenance_subcategory: ticket.maintenanceSubcategory,
            client_id: ticket.clientId,
            date: ticket.date,
            technician: ticket.technician,
            observations: ticket.observations,
            reported_problem: ticket.reportedProblem,
            products_for_quote: ticket.productsForQuote,
            service_report: ticket.serviceReport,
            checklist_results: ticket.checklistResults,
            images: ticket.images,
            reported_by: ticket.reportedBy,
            location: ticket.location,
            photo_before: ticket.photoBefore,
            budget_amount: ticket.budgetAmount,
            budget_approved: ticket.budgetApproved,
            color: ticket.color
          }]);
          if (error) {
            console.error('Erro Supabase addTicket:', error);
            if (error.message === 'Failed to fetch') {
              toast.error('Erro de conexão com o Supabase. Verifique se a URL do projeto está correta e se o projeto não está pausado.');
            } else {
              toast.error(`Erro ao salvar OS: ${error.message}`);
            }
          } else {
            toast.success(`OS ${osNumber || ''} salva no Supabase!`);
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar OS.');
        }
        return id;
      },
      updateTicket: async (id, updatedTicket) => {
        set((state) => ({
          tickets: state.tickets.map(t => t.id === id ? { ...updatedTicket, id } : t)
        }));

        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('tickets').update({
            os_number: updatedTicket.osNumber,
            title: updatedTicket.title,
            type: updatedTicket.type,
            status: updatedTicket.status,
            maintenance_category: updatedTicket.maintenanceCategory,
            maintenance_subcategory: updatedTicket.maintenanceSubcategory,
            client_id: updatedTicket.clientId,
            date: updatedTicket.date,
            technician: updatedTicket.technician,
            observations: updatedTicket.observations,
            reported_problem: updatedTicket.reportedProblem,
            products_for_quote: updatedTicket.productsForQuote,
            service_report: updatedTicket.serviceReport,
            checklist_results: updatedTicket.checklistResults,
            images: updatedTicket.images,
            reported_by: updatedTicket.reportedBy,
            location: updatedTicket.location,
            photo_before: updatedTicket.photoBefore,
            budget_amount: updatedTicket.budgetAmount,
            budget_approved: updatedTicket.budgetApproved,
            color: updatedTicket.color
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteTicket: async (id) => {
        set((state) => ({ tickets: state.tickets.filter(t => t.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('tickets').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addQuote: async (quote) => {
        const id = uuidv4();
        const newQuote = { ...quote, id };
        set((state) => ({ quotes: [...state.quotes, newQuote] }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('quotes').insert([{
            id,
            client_id: quote.clientId,
            date: quote.date,
            total_value: quote.totalValue,
            status: quote.status,
            items: quote.items
          }]);
          if (error) {
            console.error('Erro Supabase addQuote:', error);
            toast.error(`Erro ao salvar orçamento: ${error.message}`);
          } else {
            toast.success('Orçamento salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar orçamento.');
        }
      },
      updateQuote: async (id, updatedQuote) => {
        set((state) => ({
          quotes: state.quotes.map(q => q.id === id ? { ...updatedQuote, id } : q)
        }));

        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('quotes').update({
            client_id: updatedQuote.clientId,
            date: updatedQuote.date,
            total_value: updatedQuote.totalValue,
            status: updatedQuote.status,
            items: updatedQuote.items
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteQuote: async (id) => {
        set((state) => ({ quotes: state.quotes.filter(q => q.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('quotes').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addReceipt: async (receipt) => {
        const id = uuidv4();
        const newReceipt = { ...receipt, id };
        set((state) => ({ receipts: [...state.receipts, newReceipt] }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('receipts').insert([{
            id,
            client_id: receipt.clientId,
            date: receipt.date,
            value: receipt.value,
            description: receipt.description
          }]);
          if (error) {
            console.error('Erro Supabase addReceipt:', error);
            if (error.message === 'Failed to fetch') {
              toast.error('Erro de conexão com o Supabase. Verifique se a URL do projeto está correta e se o projeto não está pausado.');
            } else {
              toast.error(`Erro ao salvar recibo: ${error.message}`);
            }
          } else {
            toast.success('Recibo salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar recibo.');
        }
      },
      updateReceipt: async (id, updated) => {
        set((state) => ({
          receipts: state.receipts.map(r => r.id === id ? { ...updated, id } : r)
        }));

        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('receipts').update({
            client_id: updated.clientId,
            description: updated.description,
            value: updated.value,
            date: updated.date
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteReceipt: async (id) => {
        set((state) => ({ receipts: state.receipts.filter(r => r.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('receipts').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addCost: async (cost) => {
        const id = uuidv4();
        const newCost = { ...cost, id };
        set((state) => ({ costs: [...state.costs, newCost] }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('costs').insert([{
            id,
            description: cost.description,
            value: cost.value,
            date: cost.date,
            category: cost.category
          }]);
          if (error) {
            console.error('Erro Supabase addCost:', error);
            if (error.message === 'Failed to fetch') {
              toast.error('Erro de conexão com o Supabase. Verifique se a URL do projeto está correta e se o projeto não está pausado.');
            } else {
              toast.error(`Erro ao salvar custo: ${error.message}`);
            }
          } else {
            toast.success('Custo salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar custo.');
        }
      },
      updateCost: async (id, updated) => {
        set((state) => ({
          costs: state.costs.map(c => c.id === id ? { ...updated, id } : c)
        }));

        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('costs').update({
            description: updated.description,
            value: updated.value,
            date: updated.date,
            category: updated.category
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteCost: async (id) => {
        set((state) => ({ costs: state.costs.filter(c => c.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('costs').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addAppointment: async (appointment) => {
        const id = uuidv4();
        const newAppointment = { ...appointment, id };
        set((state) => ({ appointments: [...state.appointments, newAppointment] }));

        if (!isSupabaseConfigured) {
          toast.error('Supabase não configurado. O compromisso foi salvo apenas localmente.');
          return;
        }

        if (isLocalSupabase) {
          toast.error('URL do Supabase aponta para localhost. O compromisso foi salvo apenas localmente.');
          return;
        }

        try {
          const { error } = await supabase.from('appointments').insert([{
            id,
            title: appointment.title,
            start_time: appointment.start,
            end_time: appointment.end,
            type: appointment.type,
            ticket_id: appointment.ticketId,
            notes: appointment.notes
          }]);
          if (error) {
            console.error('Erro Supabase addAppointment:', error);
            if (error.message === 'Failed to fetch') {
              toast.error('Erro de conexão com o Supabase. Verifique se a URL do projeto está correta e se o projeto não está pausado.');
            } else {
              toast.error(`Erro ao salvar compromisso: ${error.message}`);
            }
          } else {
            toast.success('Compromisso salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar compromisso. Verifique sua internet e as configurações do Supabase.');
        }
      },
      updateAppointment: async (id, updatedAppointment) => {
        set((state) => ({
          appointments: state.appointments.map(a => a.id === id ? { ...updatedAppointment, id } : a)
        }));

        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('appointments').update({
            title: updatedAppointment.title,
            start_time: updatedAppointment.start,
            end_time: updatedAppointment.end,
            type: updatedAppointment.type,
            ticket_id: updatedAppointment.ticketId,
            notes: updatedAppointment.notes
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteAppointment: async (id) => {
        set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('appointments').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addProduct: async (product) => {
        const id = uuidv4();
        const newProduct = { ...product, id };
        set((state) => ({ products: [...state.products, newProduct] }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('products').insert([{
            id,
            code: product.code,
            name: product.name,
            description: product.description,
            price: product.price,
            unit: product.unit
          }]);
          if (error) {
            console.error('Erro Supabase addProduct:', error);
            toast.error(`Erro ao salvar produto: ${error.message}`);
          } else {
            toast.success('Produto salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar produto.');
        }
      },
      updateProduct: async (id, updatedProduct) => {
        set((state) => ({
          products: state.products.map(p => p.id === id ? { ...updatedProduct, id } : p)
        }));

        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('products').update({
            code: updatedProduct.code,
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            unit: updatedProduct.unit
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteProduct: async (id) => {
        set((state) => ({ products: state.products.filter(p => p.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          await supabase.from('products').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },
      importProducts: async (newProducts) => {
        const productsWithIds = newProducts.map(p => ({ ...p, id: uuidv4() }));
        set((state) => ({ 
          products: [...state.products, ...productsWithIds]
        }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('products').insert(productsWithIds.map(p => ({
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description,
            price: p.price,
            unit: p.unit
          })));
          if (error) console.error('Erro Supabase importProducts:', error);
        } catch (e) { console.error(e); }
      },

      addSupplier: async (supplier) => {
        const id = uuidv4();
        const newSupplier = { ...supplier, id };
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('suppliers').insert([{
            id,
            name: supplier.name,
            contact: supplier.contact,
            phone: supplier.phone,
            email: supplier.email,
            category: supplier.category
          }]);
          if (error) {
            console.error('Erro Supabase addSupplier:', error);
            toast.error(`Erro ao salvar fornecedor: ${error.message}`);
          } else {
            toast.success('Fornecedor salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar fornecedor.');
        }
      },
      updateSupplier: async (id, updated) => {
        set((state) => ({
          suppliers: state.suppliers.map(s => s.id === id ? { ...updated, id } : s)
        }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('suppliers').update({
            name: updated.name,
            contact: updated.contact,
            phone: updated.phone,
            email: updated.email,
            category: updated.category
          }).eq('id', id);
          if (error) console.error('Erro Supabase updateSupplier:', error);
        } catch (e) { console.error(e); }
      },
      deleteSupplier: async (id) => {
        set((state) => ({ suppliers: state.suppliers.filter(s => s.id !== id) }));
        
        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('suppliers').delete().eq('id', id);
          if (error) console.error('Erro Supabase deleteSupplier:', error);
        } catch (e) { console.error(e); }
      },

      addSupplyItem: async (item) => {
        const id = uuidv4();
        const newItem = { ...item, id };
        set((state) => ({ supplyItems: [...state.supplyItems, newItem] }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('supply_items').insert([{
            id,
            name: item.name,
            category: item.category,
            current_stock: item.currentStock,
            min_stock: item.minStock,
            unit: item.unit,
            last_price: item.lastPrice,
            client_id: item.clientId
          }]);
          if (error) {
            console.error('Erro Supabase addSupplyItem:', error);
            toast.error(`Erro ao salvar item de suprimento: ${error.message}`);
          } else {
            toast.success('Item de suprimento salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar item de suprimento.');
        }
      },
      updateSupplyItem: async (id, updated) => {
        set((state) => ({
          supplyItems: state.supplyItems.map(i => i.id === id ? { ...updated, id } : i)
        }));
        try {
          const { error } = await supabase.from('supply_items').update({
            name: updated.name,
            category: updated.category,
            current_stock: updated.currentStock,
            min_stock: updated.minStock,
            unit: updated.unit,
            last_price: updated.lastPrice,
            client_id: updated.clientId
          }).eq('id', id);
          if (error) console.error('Erro Supabase updateSupplyItem:', error);
        } catch (e) { console.error(e); }
      },
      deleteSupplyItem: async (id) => {
        set((state) => ({ supplyItems: state.supplyItems.filter(i => i.id !== id) }));
        try {
          const { error } = await supabase.from('supply_items').delete().eq('id', id);
          if (error) console.error('Erro Supabase deleteSupplyItem:', error);
        } catch (e) { console.error(e); }
      },
      updateStock: async (id, quantity) => {
        const item = get().supplyItems.find(i => i.id === id);
        if (!item) return;
        const newStock = item.currentStock + quantity;
        set((state) => ({
          supplyItems: state.supplyItems.map(i => i.id === id ? { ...i, currentStock: newStock } : i)
        }));
        try {
          const { error } = await supabase.from('supply_items').update({ current_stock: newStock }).eq('id', id);
          if (error) console.error('Erro Supabase updateStock:', error);
        } catch (e) { console.error(e); }
      },

      createQuotation: async (items) => {
        const id = uuidv4();
        const state = get();
        const relevantSuppliers = state.suppliers.filter(s => 
          items.some(qi => {
            const supplyItem = state.supplyItems.find(si => si.id === qi.supplyItemId);
            return supplyItem?.category === s.category || s.category === 'GERAL';
          })
        );

        const newQuotation: SupplyQuotation = {
          id,
          date: new Date().toISOString(),
          items,
          responses: relevantSuppliers.map(s => ({
            supplierId: s.id,
            prices: {},
            status: 'PENDING'
          })),
          status: 'OPEN'
        };

        set((state) => ({ supplyQuotations: [...state.supplyQuotations, newQuotation] }));

        try {
          const { error } = await supabase.from('supply_quotations').insert([{
            id,
            date: newQuotation.date,
            items,
            responses: newQuotation.responses,
            status: 'OPEN'
          }]);
          if (error) {
            console.error('Erro Supabase createQuotation:', error);
            toast.error(`Erro ao criar cotação: ${error.message}`);
          } else {
            toast.success('Cotação criada no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao criar cotação.');
        }
      },

      updateQuotationResponse: async (quotationId, supplierId, prices) => {
        const state = get();
        const quotation = state.supplyQuotations.find(q => q.id === quotationId);
        if (!quotation) return;

        const newResponses = quotation.responses.map(r => 
          r.supplierId === supplierId ? { ...r, prices, status: 'RECEIVED' as const } : r
        );

        set((state) => ({
          supplyQuotations: state.supplyQuotations.map(q => 
            q.id === quotationId ? { ...q, responses: newResponses } : q
          )
        }));

        try {
          const { error } = await supabase.from('supply_quotations').update({ 
            responses: newResponses 
          }).eq('id', quotationId);
          if (error) console.error('Erro Supabase updateQuotationResponse:', error);
        } catch (e) { console.error(e); }
      },

      addPayment: async (payment) => {
        const id = uuidv4();
        const newPayment = { ...payment, id };
        set((state) => ({ payments: [...state.payments, newPayment] }));
        try {
          const { error } = await supabase.from('payments').insert([{
            id,
            client_id: payment.clientId,
            amount: payment.amount,
            due_date: payment.dueDate,
            payment_date: payment.paymentDate,
            status: payment.status,
            reference: payment.reference
          }]);
          if (error) {
            console.error('Erro Supabase addPayment:', error);
            toast.error(`Erro ao salvar pagamento: ${error.message}`);
          } else {
            toast.success('Pagamento salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar pagamento.');
        }
      },
      updatePayment: async (id, updated) => {
        set((state) => ({
          payments: state.payments.map(p => p.id === id ? { ...p, ...updated } : p)
        }));
        try {
          const { error } = await supabase.from('payments').update({
            client_id: updated.clientId,
            amount: updated.amount,
            due_date: updated.dueDate,
            payment_date: updated.paymentDate,
            status: updated.status,
            reference: updated.reference
          }).eq('id', id);
          if (error) console.error('Erro Supabase updatePayment:', error);
        } catch (e) { console.error(e); }
      },
      deletePayment: async (id) => {
        set((state) => ({ payments: state.payments.filter(p => p.id !== id) }));
        try {
          const { error } = await supabase.from('payments').delete().eq('id', id);
          if (error) console.error('Erro Supabase deletePayment:', error);
        } catch (e) { console.error(e); }
      },

      addLegalAgreement: async (agreement) => {
        const id = uuidv4();
        const newAgreement = { ...agreement, id };
        set((state) => ({ legalAgreements: [...state.legalAgreements, newAgreement] }));
        try {
          const { error } = await supabase.from('legal_agreements').insert([{
            id,
            client_id: agreement.clientId,
            total_amount: agreement.totalAmount,
            installments: agreement.installments,
            remaining_installments: agreement.remainingInstallments,
            status: agreement.status,
            start_date: agreement.startDate,
            notes: agreement.notes
          }]);
          if (error) {
            console.error('Erro Supabase addLegalAgreement:', error);
            toast.error(`Erro ao salvar acordo: ${error.message}`);
          } else {
            toast.success('Acordo jurídico salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar acordo.');
        }
      },
      updateLegalAgreement: async (id, updated) => {
        set((state) => ({
          legalAgreements: state.legalAgreements.map(a => a.id === id ? { ...a, ...updated } : a)
        }));
        try {
          const { error } = await supabase.from('legal_agreements').update({
            client_id: updated.clientId,
            total_amount: updated.totalAmount,
            installments: updated.installments,
            remaining_installments: updated.remainingInstallments,
            status: updated.status,
            start_date: updated.startDate,
            notes: updated.notes
          }).eq('id', id);
          if (error) console.error('Erro Supabase updateLegalAgreement:', error);
        } catch (e) { console.error(e); }
      },
      deleteLegalAgreement: async (id) => {
        set((state) => ({ legalAgreements: state.legalAgreements.filter(a => a.id !== id) }));
        try {
          const { error } = await supabase.from('legal_agreements').delete().eq('id', id);
          if (error) console.error('Erro Supabase deleteLegalAgreement:', error);
        } catch (e) { console.error(e); }
      },

      addContract: async (contract) => {
        const id = uuidv4();
        const newContract = { ...contract, id };
        set((state) => ({ contracts: [...state.contracts, newContract] }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('contracts').insert([{
            id,
            title: contract.title,
            supplier_id: contract.supplierId,
            category: contract.category,
            start_date: contract.startDate,
            end_date: contract.endDate,
            value: contract.value,
            payment_frequency: contract.paymentFrequency,
            status: contract.status,
            notes: contract.notes,
            file_url: contract.fileUrl,
            alert_days: contract.alertDays,
            alert_enabled: contract.alertEnabled
          }]);
        } catch (e) { console.error(e); }
      },
      updateContract: async (id, updated) => {
        set((state) => ({
          contracts: state.contracts.map(c => c.id === id ? { ...c, ...updated } : c)
        }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('contracts').update({
            title: updated.title,
            supplier_id: updated.supplierId,
            category: updated.category,
            start_date: updated.startDate,
            end_date: updated.endDate,
            value: updated.value,
            payment_frequency: updated.paymentFrequency,
            status: updated.status,
            notes: updated.notes,
            file_url: updated.fileUrl,
            alert_days: updated.alertDays,
            alert_enabled: updated.alertEnabled
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteContract: async (id) => {
        set((state) => ({ contracts: state.contracts.filter(c => c.id !== id) }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('contracts').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addRenovation: async (renovation) => {
        const id = uuidv4();
        const newRenovation = { ...renovation, id };
        set((state) => ({ renovations: [...state.renovations, newRenovation] }));

        // WhatsApp Notification
        if (get().whatsappEnabled && renovation.clientId) {
          const client = get().clients.find(c => c.id === renovation.clientId);
          if (client?.phone) {
            const message = `Olá ${client.name}, uma nova obra foi registrada para sua unidade (${client.unit} ${client.tower || ''}). Título: ${renovation.title}.`;
            sendWhatsAppMessage(client.phone, message);
          }
        }

        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('renovations').insert([{
            id,
            client_id: renovation.clientId,
            title: renovation.title,
            description: renovation.description,
            start_date: renovation.startDate,
            end_date: renovation.endDate,
            status: renovation.status,
            art_file_url: renovation.artFileUrl,
            technician_name: renovation.technicianName
          }]);
        } catch (e) { console.error(e); }
      },
      updateRenovation: async (id, updated) => {
        set((state) => ({
          renovations: state.renovations.map(r => r.id === id ? { ...r, ...updated } : r)
        }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('renovations').update({
            client_id: updated.clientId,
            title: updated.title,
            description: updated.description,
            start_date: updated.startDate,
            end_date: updated.endDate,
            status: updated.status,
            art_file_url: updated.artFileUrl,
            technician_name: updated.technicianName
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteRenovation: async (id) => {
        set((state) => ({ renovations: state.renovations.filter(r => r.id !== id) }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('renovations').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addMove: async (move) => {
        const id = uuidv4();
        const newMove = { ...move, id };
        set((state) => ({ moves: [...state.moves, newMove] }));

        // WhatsApp Notification
        if (get().whatsappEnabled && move.clientId) {
          const client = get().clients.find(c => c.id === move.clientId);
          if (client?.phone) {
            const message = `Olá ${client.name}, sua mudança (${move.type === 'IN' ? 'Entrada' : 'Saída'}) foi agendada para ${safeFormatDate(move.date)}.`;
            sendWhatsAppMessage(client.phone, message);
          }
        }

        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('moves').insert([{
            id,
            client_id: move.clientId,
            date: move.date,
            type: move.type,
            status: move.status,
            notes: move.notes
          }]);
        } catch (e) { console.error(e); }
      },
      updateMove: async (id, updated) => {
        set((state) => ({
          moves: state.moves.map(m => m.id === id ? { ...m, ...updated } : m)
        }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('moves').update({
            client_id: updated.clientId,
            date: updated.date,
            type: updated.type,
            status: updated.status,
            notes: updated.notes
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteMove: async (id) => {
        set((state) => ({ moves: state.moves.filter(m => m.id !== id) }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('moves').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addBillingRule: async (rule) => {
        const id = uuidv4();
        const newRule = { ...rule, id };
        set((state) => ({ billingRules: [...state.billingRules, newRule] }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('billing_rules').insert([{
            id,
            name: rule.name,
            days_before_due: rule.daysBeforeDue,
            days_after_due: rule.daysAfterDue,
            message_template: rule.messageTemplate,
            active: rule.active
          }]);
        } catch (e) { console.error(e); }
      },
      updateBillingRule: async (id, updated) => {
        set((state) => ({
          billingRules: state.billingRules.map(r => r.id === id ? { ...r, ...updated } : r)
        }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('billing_rules').update({
            name: updated.name,
            days_before_due: updated.daysBeforeDue,
            days_after_due: updated.daysAfterDue,
            message_template: updated.messageTemplate,
            active: updated.active
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteBillingRule: async (id) => {
        set((state) => ({ billingRules: state.billingRules.filter(r => r.id !== id) }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('billing_rules').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },

      addBudgetForecast: async (forecast) => {
        const id = uuidv4();
        const newForecast = { ...forecast, id };
        set((state) => ({ budgetForecasts: [...state.budgetForecasts, newForecast] }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('budget_forecasts').insert([{
            id,
            created_at: forecast.createdAt,
            month: forecast.month,
            monthly_projections: forecast.monthlyProjections,
            categories: forecast.categories,
            insights: forecast.insights,
            confidence: forecast.confidence
          }]);
        } catch (e) { console.error(e); }
      },
      updateBudgetForecast: async (id, updated) => {
        set((state) => ({
          budgetForecasts: state.budgetForecasts.map(f => f.id === id ? { ...f, ...updated } : f)
        }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('budget_forecasts').update({
            month: updated.month,
            monthly_projections: updated.monthlyProjections,
            categories: updated.categories,
            insights: updated.insights,
            confidence: updated.confidence
          }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      deleteBudgetForecast: async (id) => {
        set((state) => ({ budgetForecasts: state.budgetForecasts.filter(f => f.id !== id) }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('budget_forecasts').delete().eq('id', id);
        } catch (e) { console.error(e); }
      },
      
      addScheduledMaintenance: async (maintenance) => {
        const id = uuidv4();
        const newMaintenance = { ...maintenance, id };
        set((state) => ({
          scheduledMaintenances: [...state.scheduledMaintenances, newMaintenance]
        }));
        try {
          const { error } = await supabase.from('scheduled_maintenances').insert([{
            id,
            client_id: maintenance.clientId,
            standard_id: maintenance.standardId,
            item: maintenance.item,
            frequency: maintenance.frequency,
            last_done: maintenance.lastDone,
            next_date: maintenance.nextDate,
            status: maintenance.status,
            category: maintenance.category
          }]);
          if (error) {
            console.error('Erro Supabase addScheduledMaintenance:', error);
            toast.error(`Erro ao salvar manutenção: ${error.message}`);
          } else {
            toast.success('Manutenção agendada salva no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar manutenção.');
        }
      },
      updateScheduledMaintenance: async (id, updated) => {
        set((state) => ({
          scheduledMaintenances: state.scheduledMaintenances.map(m => m.id === id ? { ...m, ...updated } : m)
        }));
        try {
          const { error } = await supabase.from('scheduled_maintenances').update({
            client_id: updated.clientId,
            standard_id: updated.standardId,
            item: updated.item,
            frequency: updated.frequency,
            last_done: updated.lastDone,
            next_date: updated.nextDate,
            status: updated.status,
            category: updated.category
          }).eq('id', id);
          if (error) console.error('Erro Supabase updateScheduledMaintenance:', error);
        } catch (e) { console.error(e); }
      },
      deleteScheduledMaintenance: async (id) => {
        set((state) => ({
          scheduledMaintenances: state.scheduledMaintenances.filter(m => m.id !== id)
        }));
        try {
          const { error } = await supabase.from('scheduled_maintenances').delete().eq('id', id);
          if (error) console.error('Erro Supabase deleteScheduledMaintenance:', error);
        } catch (e) { console.error(e); }
      },
      generateSchedulesForClient: async (clientId) => {
        const newSchedules: ScheduledMaintenance[] = NBR5674_STANDARDS.map((std: any) => {
          const nextDate = new Date();
          if (std.frequency === 'Mensal') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (std.frequency === 'Trimestral') nextDate.setMonth(nextDate.getMonth() + 3);
          else if (std.frequency === 'Semestral') nextDate.setMonth(nextDate.getMonth() + 6);
          else nextDate.setFullYear(nextDate.getFullYear() + 1);

          return {
            id: uuidv4(),
            clientId,
            standardId: std.id,
            item: std.item,
            frequency: std.frequency,
            nextDate: nextDate.toISOString().split('T')[0],
            status: 'PENDING',
            category: std.category
          };
        });

        set((state) => ({
          scheduledMaintenances: [
            ...state.scheduledMaintenances.filter(m => m.clientId !== clientId),
            ...newSchedules
          ]
        }));

        try {
          // Remove antigos e insere novos no Supabase
          await supabase.from('scheduled_maintenances').delete().eq('client_id', clientId);
          const { error } = await supabase.from('scheduled_maintenances').insert(newSchedules.map(m => ({
            id: m.id,
            client_id: m.clientId,
            standard_id: m.standardId,
            item: m.item,
            frequency: m.frequency,
            next_date: m.nextDate,
            status: m.status,
            category: m.category
          })));
          if (error) console.error('Erro Supabase generateSchedulesForClient:', error);
        } catch (e) { console.error(e); }
      },

      addNotification: async (notif) => {
        const id = uuidv4();
        const newNotif = { ...notif, id, date: new Date().toISOString(), read: false };
        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 50)
        }));

        try {
          await supabase.from('notifications').insert([{
            id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            date: newNotif.date,
            read: false
          }]);
        } catch (e) { console.error(e); }
      },
      markNotificationAsRead: async (id) => {
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
        }));
        try {
          await supabase.from('notifications').update({ read: true }).eq('id', id);
        } catch (e) { console.error(e); }
      },
      clearNotifications: async () => {
        set({ notifications: [] });
        try {
          await supabase.from('notifications').delete().neq('id', ''); // Delete all
        } catch (e) { console.error(e); }
      },

      addConsumptionReading: async (reading) => {
        const id = uuidv4();
        const newReading = { ...reading, id };
        set((state) => ({
          consumptionReadings: [...state.consumptionReadings, newReading]
        }));
        try {
          const { error } = await supabase.from('consumption_readings').insert([{
            id,
            client_id: reading.clientId,
            type: reading.type,
            previous_value: reading.previousValue,
            current_value: reading.currentValue,
            consumption: reading.consumption,
            date: reading.date,
            unit: reading.unit,
            billed: reading.billed
          }]);
          if (error) {
            console.error('Erro Supabase addConsumptionReading:', error);
            toast.error(`Erro ao salvar leitura: ${error.message}`);
          } else {
            toast.success('Leitura de consumo salva no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar leitura.');
        }
      },
      addDigitalFolderItem: async (item) => {
        const id = uuidv4();
        const newItem: DigitalFolderItem = { 
          ...item, 
          id, 
          status: 'PENDING', 
          signatures: [],
          date: new Date().toISOString()
        };
        set((state) => ({
          digitalFolder: [...state.digitalFolder, newItem]
        }));
        try {
          const { error } = await supabase.from('digital_folder').insert([{
            id,
            client_id: item.clientId,
            title: item.title,
            description: item.description,
            category: item.category,
            date: newItem.date,
            amount: item.amount,
            file_url: item.fileUrl,
            status: 'PENDING',
            signatures: []
          }]);
          if (error) {
            console.error('Erro Supabase addDigitalFolderItem:', error);
            toast.error(`Erro ao salvar documento: ${error.message}`);
          } else {
            toast.success('Documento salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar documento.');
        }
      },
      validateDigitalFolderItem: async (id, userName, role) => {
        const item = get().digitalFolder.find(i => i.id === id);
        if (!item) return;

        const newSignature = { id: uuidv4(), userName, role, date: new Date().toISOString() };
        const newSignatures = [...item.signatures, newSignature];
        const newStatus = newSignatures.length >= 3 ? 'VALIDATED' : item.status;

        set((state) => ({
          digitalFolder: state.digitalFolder.map(i => 
            i.id === id ? { ...i, signatures: newSignatures, status: newStatus } : i
          )
        }));

        try {
          const { error } = await supabase.from('digital_folder').update({ 
            signatures: newSignatures, 
            status: newStatus 
          }).eq('id', id);
          if (error) console.error('Erro Supabase validateDigitalFolderItem:', error);
        } catch (e) { console.error(e); }
      },

      addAssembly: async (assembly) => {
        const id = uuidv4();
        const newAssembly = {
          ...assembly,
          id,
          votes: [],
          legalValidityHash: `SHA256-${uuidv4().substring(0, 8).toUpperCase()}`
        };
        set((state) => ({
          assemblies: [...state.assemblies, newAssembly]
        }));
        try {
          const { error } = await supabase.from('assemblies').insert([{
            id,
            title: assembly.title,
            description: assembly.description,
            date: assembly.date,
            status: assembly.status,
            options: assembly.options,
            votes: [],
            legal_validity_hash: newAssembly.legalValidityHash
          }]);
          if (error) {
            console.error('Erro Supabase addAssembly:', error);
            toast.error(`Erro ao salvar assembleia: ${error.message}`);
          } else {
            toast.success('Assembleia salva no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar assembleia.');
        }
      },

      castVote: async (assemblyId, optionId, userName) => {
        const assembly = get().assemblies.find(a => a.id === assemblyId);
        if (!assembly) return;

        const vote: Vote = {
          id: uuidv4(),
          userId: 'current-user',
          userName,
          optionId,
          timestamp: new Date().toISOString(),
          signature: `SIG-${uuidv4().substring(0, 12).toUpperCase()}`
        };

        const newVotes = [...assembly.votes, vote];

        set((state) => ({
          assemblies: state.assemblies.map(a => a.id === assemblyId ? { ...a, votes: newVotes } : a)
        }));

        try {
          const { error } = await supabase.from('assemblies').update({ votes: newVotes }).eq('id', assemblyId);
          if (error) console.error('Erro Supabase castVote:', error);
        } catch (e) { console.error(e); }
      },

      closeAssembly: async (id) => {
        set((state) => ({
          assemblies: state.assemblies.map(a => a.id === id ? { ...a, status: 'CLOSED' } : a)
        }));
        try {
          const { error } = await supabase.from('assemblies').update({ status: 'CLOSED' }).eq('id', id);
          if (error) console.error('Erro Supabase closeAssembly:', error);
        } catch (e) { console.error(e); }
      },

      deleteAssembly: async (id) => {
        set((state) => ({
          assemblies: state.assemblies.filter(a => a.id !== id)
        }));
        try {
          const { error } = await supabase.from('assemblies').delete().eq('id', id);
          if (error) console.error('Erro Supabase deleteAssembly:', error);
        } catch (e) { console.error(e); }
      },

      addNotice: async (notice) => {
        const id = uuidv4();
        const newNotice = { ...notice, id, date: new Date().toISOString() };
        set((state) => ({
          notices: [newNotice, ...state.notices]
        }));

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('notices').insert([{
            id,
            title: notice.title,
            content: notice.content,
            date: newNotice.date,
            category: notice.category,
            tower: notice.tower,
            apartment_line: notice.apartmentLine,
            client_id: notice.clientId
          }]);
          if (error) {
            console.error('Erro Supabase addNotice:', error);
            toast.error(`Erro ao salvar comunicado: ${error.message}`);
          } else {
            toast.success('Comunicado salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar comunicado.');
        }
      },

      updateNotice: async (id, updated) => {
        set((state) => ({
          notices: state.notices.map(n => n.id === id ? { ...n, ...updated } : n)
        }));
        try {
          const { error } = await supabase.from('notices').update({
            title: updated.title,
            content: updated.content,
            category: updated.category,
            tower: updated.tower,
            apartment_line: updated.apartmentLine,
            client_id: updated.clientId
          }).eq('id', id);
          if (error) console.error('Erro Supabase updateNotice:', error);
        } catch (e) { console.error(e); }
      },

      deleteNotice: async (id) => {
        set((state) => ({
          notices: state.notices.filter(n => n.id !== id)
        }));
        try {
          const { error } = await supabase.from('notices').delete().eq('id', id);
          if (error) console.error('Erro Supabase deleteNotice:', error);
        } catch (e) { console.error(e); }
      },

      addPackage: async (pkg) => {
        const id = uuidv4();
        const newPkg: Package = {
          ...pkg,
          id,
          receivedAt: new Date().toISOString(),
          status: 'PENDING',
          qrCode: `PKG-${id.substring(0, 8).toUpperCase()}`
        };
        
        set((state) => ({ packages: [newPkg, ...state.packages] }));

        try {
          const { error } = await supabase.from('packages').insert([{
            id,
            resident_name: pkg.residentName,
            apartment: pkg.apartment,
            tower: pkg.tower,
            carrier: pkg.carrier,
            tracking_code: pkg.trackingCode,
            received_at: newPkg.receivedAt,
            status: 'PENDING',
            qr_code: newPkg.qrCode,
            photo_url: pkg.photoUrl,
            client_id: pkg.clientId
          }]);
          if (error) {
            console.error('Erro Supabase addPackage:', error);
            toast.error(`Erro ao salvar encomenda: ${error.message}`);
          } else {
            toast.success('Encomenda salva no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar encomenda.');
        }

        get().addNotification({
          title: 'Nova Encomenda!',
          message: `Pacote de ${pkg.carrier} para ${pkg.residentName} (${pkg.apartment} ${pkg.tower}).`,
          type: 'SUCCESS'
        });

        // WhatsApp Notification
        if (get().whatsappEnabled) {
          let phone = '';
          if (pkg.clientId) {
            const client = get().clients.find(c => c.id === pkg.clientId);
            phone = client?.phone || '';
          }
          
          if (phone) {
            const message = `Olá ${pkg.residentName}, uma nova encomenda de ${pkg.carrier} chegou para você (${pkg.apartment} ${pkg.tower || ''}).`;
            sendWhatsAppMessage(phone, message);
          }
        }

        return newPkg;
      },

      pickupPackage: async (id) => {
        const pkg = get().packages.find(p => p.id === id);
        if (!pkg) return;
        const pickedUpAt = new Date().toISOString();

        set((state) => ({
          packages: state.packages.map(p => 
            p.id === id ? { ...p, status: 'PICKED_UP', pickedUpAt } : p
          )
        }));

        try {
          const { error } = await supabase.from('packages').update({ 
            status: 'PICKED_UP', 
            picked_up_at: pickedUpAt 
          }).eq('id', id);
          if (error) console.error('Erro Supabase pickupPackage:', error);
        } catch (e) { console.error(e); }

        get().addNotification({
          title: 'Encomenda Retirada',
          message: `O pacote de ${pkg.carrier} foi retirado por ${pkg.residentName}.`,
          type: 'INFO'
        });
      },

      addVisitor: async (visitor) => {
        const id = uuidv4();
        const newVisitor: Visitor = {
          ...visitor,
          id,
          qrCode: `VIS-${id}`,
          status: 'ACTIVE'
        };
        set((state) => ({ visitors: [newVisitor, ...state.visitors] }));

        // WhatsApp Notification
        if (get().whatsappEnabled) {
          // Try to find the resident to notify them
          const resident = get().clients.find(c => 
            c.unit === visitor.apartment && (visitor.tower ? c.tower === visitor.tower : true)
          );
          
          if (resident?.phone) {
            const message = `Olá ${resident.name}, um novo visitante (${visitor.name}) foi registrado para sua unidade (${visitor.apartment} ${visitor.tower || ''}).`;
            sendWhatsAppMessage(resident.phone, message);
          }
        }

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('visitors').insert([{
            id,
            name: visitor.name,
            document: visitor.document,
            type: visitor.type,
            apartment: visitor.apartment,
            tower: visitor.tower,
            valid_until: visitor.validUntil,
            qr_code: newVisitor.qrCode,
            status: 'ACTIVE'
          }]);
          if (error) {
            console.error('Erro Supabase addVisitor:', error);
            toast.error(`Erro ao salvar visitante: ${error.message}`);
          } else {
            toast.success('Visitante salvo no Supabase!');
          }
        } catch (e: any) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar visitante.');
        }
      },

      revokeVisitor: async (id) => {
        set((state) => ({
          visitors: state.visitors.map(v => v.id === id ? { ...v, status: 'EXPIRED' } : v)
        }));
        try {
          const { error } = await supabase.from('visitors').update({ status: 'EXPIRED' }).eq('id', id);
          if (error) console.error('Erro Supabase revokeVisitor:', error);
        } catch (e) { console.error(e); }
      },

      updateCriticalEvent: async (id, status, description) => {
        const lastUpdate = new Date().toISOString();
        set((state) => ({
          criticalEvents: state.criticalEvents.map(e => 
            e.id === id ? { ...e, status, description, lastUpdate } : e
          )
        }));

        try {
          const { error } = await supabase.from('critical_events').update({ 
            status, 
            description, 
            last_update: lastUpdate 
          }).eq('id', id);
          if (error) console.error('Erro Supabase updateCriticalEvent:', error);
        } catch (e) { console.error(e); }

        if (status === 'CRITICAL') {
          const event = get().criticalEvents.find(e => e.id === id);
          get().addNotification({
            title: 'ALERTA CRÍTICO!',
            message: `${event?.device}: ${description}`,
            type: 'ERROR'
          });
        }
      },

      addTicketHistory: async (ticketId, note, userName) => {
        const newEntry = {
          id: uuidv4(),
          date: new Date().toISOString(),
          note,
          userName
        };
        
        let updatedHistory: any[] = [];
        
        set((state) => {
          const ticket = state.tickets.find(t => t.id === ticketId);
          updatedHistory = [...(ticket?.history || []), newEntry];
          return {
            tickets: state.tickets.map(t => 
              t.id === ticketId ? { ...t, history: updatedHistory } : t
            )
          };
        });

        if (!isSupabaseConfigured) return;

        try {
          const { error } = await supabase.from('tickets').update({ 
            history: updatedHistory 
          }).eq('id', ticketId);
          if (error) {
            console.error('Erro Supabase addTicketHistory:', error);
            toast.error('Erro ao salvar histórico no servidor');
          } else {
            toast.success('Histórico atualizado');
          }
        } catch (e) { 
          console.error(e);
          toast.error('Erro de conexão ao salvar histórico');
        }
      },

      setEnergyData: async (energyData) => {
        set({ energyData });
        const id = get().companySettingsId;
        if (id) {
          try {
            await supabase.from('company_settings').update({ energy_data: energyData }).eq('id', id);
          } catch (e) { console.error(e); }
        }
      },

      addSavingsGoal: async (goal) => {
        const id = uuidv4();
        const newGoal = { ...goal, id };
        set((state) => ({ savingsGoals: [...state.savingsGoals, newGoal] }));
        try {
          const { error } = await supabase.from('savings_goals').insert([{
            id,
            title: goal.title,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            deadline: goal.deadline,
            category: goal.category,
            icon: goal.icon,
            status: goal.status
          }]);
          if (error) throw error;
          toast.success('Meta de economia adicionada!');
        } catch (e) {
          console.error(e);
          toast.error('Erro ao salvar meta');
        }
      },

      updateSavingsGoal: async (id, goal) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => (g.id === id ? { ...g, ...goal } : g))
        }));
        try {
          const updateData: any = {};
          if (goal.title) updateData.title = goal.title;
          if (goal.targetAmount !== undefined) updateData.target_amount = goal.targetAmount;
          if (goal.currentAmount !== undefined) updateData.current_amount = goal.currentAmount;
          if (goal.deadline) updateData.deadline = goal.deadline;
          if (goal.category) updateData.category = goal.category;
          if (goal.icon) updateData.icon = goal.icon;
          if (goal.status) updateData.status = goal.status;

          const { error } = await supabase.from('savings_goals').update(updateData).eq('id', id);
          if (error) throw error;
        } catch (e) {
          console.error(e);
          toast.error('Erro ao atualizar meta');
        }
      },

      deleteSavingsGoal: async (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id)
        }));
        try {
          const { error } = await supabase.from('savings_goals').delete().eq('id', id);
          if (error) throw error;
          toast.success('Meta removida');
        } catch (e) {
          console.error(e);
          toast.error('Erro ao remover meta');
        }
      },

      addDocumentTemplate: async (template) => {
        const id = uuidv4();
        const newTemplate = { ...template, id, fileUrl: template.fileUrl || '' };
        
        set((state) => ({
          documentTemplates: [...state.documentTemplates, newTemplate],
        }));

        if (isSupabaseConfigured) {
          const { error } = await supabase.from('document_templates').insert([{
            id,
            title: template.title,
            category: template.category,
            description: template.description,
            legal_basis: template.legalBasis,
            content: template.content,
            file_url: template.fileUrl
          }]);
          if (error) {
            toast.error('Erro ao salvar documento');
            console.error(error);
          } else {
            toast.success('Documento salvo com sucesso!');
          }
        }
      },

      updateDocumentTemplate: async (id, template) => {
        set((state) => ({
          documentTemplates: state.documentTemplates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
        }));

        if (isSupabaseConfigured) {
          const updateData: any = {};
          if (template.title) updateData.title = template.title;
          if (template.category) updateData.category = template.category;
          if (template.description) updateData.description = template.description;
          if (template.legalBasis) updateData.legal_basis = template.legalBasis;
          if (template.content) updateData.content = template.content;
          if (template.fileUrl !== undefined) updateData.file_url = template.fileUrl;

          const { error } = await supabase.from('document_templates').update(updateData).eq('id', id);
          if (error) {
            toast.error('Erro ao atualizar documento');
            console.error(error);
          } else {
            toast.success('Documento atualizado com sucesso!');
          }
        }
      },

      deleteDocumentTemplate: async (id) => {
        set((state) => ({
          documentTemplates: state.documentTemplates.filter((t) => t.id !== id),
        }));

        if (isSupabaseConfigured) {
          const { error } = await supabase.from('document_templates').delete().eq('id', id);
          if (error) {
            toast.error('Erro ao excluir documento');
            console.error(error);
          } else {
            toast.success('Documento excluído com sucesso!');
          }
        }
      },

      addFeedback: async (feedback) => {
        const id = uuidv4();
        const date = new Date().toISOString();
        const newFeedback = { ...feedback, id, date };
        set((state) => ({ feedbacks: [...state.feedbacks, newFeedback] }));
        
        try {
          const { error } = await supabase.from('feedbacks').insert([{
            id,
            client_id: feedback.clientId,
            location_id: feedback.locationId,
            rating: feedback.rating,
            comment: feedback.comment,
            user_name: feedback.userName,
            date
          }]);
          if (error) {
            console.error('Erro Supabase addFeedback:', error);
          }
        } catch (e) { console.error(e); }
      },

      addReservation: async (reservation) => {
        const id = uuidv4();
        set((state) => ({ reservations: [...state.reservations, { ...reservation, id }] }));
        if (isSupabaseConfigured) {
          await supabase.from('reservations').insert([{
            id, client_id: reservation.clientId, area_name: reservation.areaName,
            date: reservation.date, start_time: reservation.startTime, end_time: reservation.endTime,
            status: reservation.status, notes: reservation.notes
          }]);
        }
      },
      updateReservation: async (id, reservation) => {
        set((state) => ({ reservations: state.reservations.map(r => r.id === id ? { ...r, ...reservation } : r) }));
        if (isSupabaseConfigured) {
          const updateData: any = {};
          if (reservation.clientId !== undefined) updateData.client_id = reservation.clientId;
          if (reservation.areaName !== undefined) updateData.area_name = reservation.areaName;
          if (reservation.date !== undefined) updateData.date = reservation.date;
          if (reservation.startTime !== undefined) updateData.start_time = reservation.startTime;
          if (reservation.endTime !== undefined) updateData.end_time = reservation.endTime;
          if (reservation.status !== undefined) updateData.status = reservation.status;
          if (reservation.notes !== undefined) updateData.notes = reservation.notes;
          await supabase.from('reservations').update(updateData).eq('id', id);
        }
      },
      deleteReservation: async (id) => {
        set((state) => ({ reservations: state.reservations.filter(r => r.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('reservations').delete().eq('id', id);
      },

      addStaff: (staff) => {
        const encryptionActive = get().encryptionActive;
        const processedStaff = {
          ...staff,
          id: uuidv4(),
          email: encryptionActive ? Security.encrypt(staff.email) : staff.email,
          phone: encryptionActive ? Security.encrypt(staff.phone) : staff.phone
        };
        set((state) => ({ staff: [...state.staff, processedStaff] }));
        get().addSecurityLog(`Funcionário adicionado: ${staff.name}${encryptionActive ? ' (Dados Criptografados)' : ''}`, 'INFO');
      },
      updateStaff: async (id, staff) => {
        set((state) => ({ staff: state.staff.map(s => s.id === id ? { ...s, ...staff } : s) }));
        if (isSupabaseConfigured) await supabase.from('staff').update(staff).eq('id', id);
      },
      deleteStaff: async (id) => {
        set((state) => ({ staff: state.staff.filter(s => s.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('staff').delete().eq('id', id);
      },

      addKey: (key) => {
        const encryptionActive = get().encryptionActive;
        const processedKey = {
          ...key,
          id: uuidv4(),
          borrowedBy: (encryptionActive && key.borrowedBy) ? Security.encrypt(key.borrowedBy) : key.borrowedBy
        };
        set((state) => ({ keys: [...state.keys, processedKey] }));
        get().addSecurityLog(`Chave adicionada: ${key.keyName}${encryptionActive ? ' (Dados Criptografados)' : ''}`, 'INFO');
      },
      updateKey: async (id, key) => {
        set((state) => ({ keys: state.keys.map(k => k.id === id ? { ...k, ...key } : k) }));
        if (isSupabaseConfigured) {
          const updateData: any = {};
          if (key.keyName !== undefined) updateData.key_name = key.keyName;
          if (key.location !== undefined) updateData.location = key.location;
          if (key.status !== undefined) updateData.status = key.status;
          if (key.borrowedBy !== undefined) updateData.borrowed_by = key.borrowedBy;
          if (key.borrowedAt !== undefined) updateData.borrowed_at = key.borrowedAt;
          if (key.returnedAt !== undefined) updateData.returned_at = key.returnedAt;
          await supabase.from('keys').update(updateData).eq('id', id);
        }
      },
      deleteKey: async (id) => {
        set((state) => ({ keys: state.keys.filter(k => k.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('keys').delete().eq('id', id);
      },

      updateIotState: (newState) => set((state) => {
        const updatedPumps = newState.pumps ? { ...state.iotState.pumps, ...newState.pumps } : state.iotState.pumps;
        const updatedLights = newState.lights ? { ...state.iotState.lights, ...newState.lights } : state.iotState.lights;
        
        return {
          iotState: {
            ...state.iotState,
            ...newState,
            pumps: updatedPumps,
            lights: updatedLights,
          }
        };
      }),

      addClassified: async (classified) => {
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        set((state) => ({ classifieds: [...state.classifieds, { ...classified, id, createdAt, status: 'ACTIVE' }] }));
        if (isSupabaseConfigured) {
          await supabase.from('classifieds').insert([{
            id, title: classified.title, description: classified.description, price: classified.price,
            category: classified.category, author_id: classified.authorId, author_name: classified.authorName,
            contact_phone: classified.contactPhone, created_at: createdAt, images: classified.images, status: 'ACTIVE'
          }]);
        }
      },
      updateClassified: async (id, classified) => {
        set((state) => ({ classifieds: state.classifieds.map(c => c.id === id ? { ...c, ...classified } : c) }));
        if (isSupabaseConfigured) {
          const updateData: any = { ...classified };
          if (classified.authorId !== undefined) { updateData.author_id = classified.authorId; delete updateData.authorId; }
          if (classified.authorName !== undefined) { updateData.author_name = classified.authorName; delete updateData.authorName; }
          if (classified.contactPhone !== undefined) { updateData.contact_phone = classified.contactPhone; delete updateData.contactPhone; }
          await supabase.from('classifieds').update(updateData).eq('id', id);
        }
      },
      deleteClassified: async (id) => {
        set((state) => ({ classifieds: state.classifieds.filter(c => c.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('classifieds').delete().eq('id', id);
      },

      addLostAndFound: async (item) => {
        const id = uuidv4();
        set((state) => ({ lostAndFound: [...state.lostAndFound, { ...item, id, status: 'FOUND' }] }));
        if (isSupabaseConfigured) {
          await supabase.from('lost_and_found').insert([{
            id, title: item.title, description: item.description, location: item.location,
            date_found: item.dateFound, status: 'FOUND', images: item.images,
            reporter_id: item.reporterId, reporter_name: item.reporterName
          }]);
        }
      },
      updateLostAndFound: async (id, item) => {
        set((state) => ({ lostAndFound: state.lostAndFound.map(i => i.id === id ? { ...i, ...item } : i) }));
        if (isSupabaseConfigured) {
          const updateData: any = { ...item };
          if (item.dateFound !== undefined) { updateData.date_found = item.dateFound; delete updateData.dateFound; }
          if (item.reporterId !== undefined) { updateData.reporter_id = item.reporterId; delete updateData.reporterId; }
          if (item.reporterName !== undefined) { updateData.reporter_name = item.reporterName; delete updateData.reporterName; }
          if (item.returnedTo !== undefined) { updateData.returned_to = item.returnedTo; delete updateData.returnedTo; }
          if (item.returnedAt !== undefined) { updateData.returned_at = item.returnedAt; delete updateData.returnedAt; }
          await supabase.from('lost_and_found').update(updateData).eq('id', id);
        }
      },
      deleteLostAndFound: async (id) => {
        set((state) => ({ lostAndFound: state.lostAndFound.filter(i => i.id !== id) }));
        if (isSupabaseConfigured) await supabase.from('lost_and_found').delete().eq('id', id);
      },

      addUser: async (user) => {
        const id = uuidv4();
        const createdAt = new Date().toISOString();
        const newUser = { ...user, id, createdAt };
        set((state) => ({ users: [...state.users, newUser] }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('system_users').insert([{
            id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            created_at: createdAt
          }]);
          toast.success('Usuário criado com sucesso!');
        } catch (e) { console.error(e); }
      },
      updateUser: async (id, user) => {
        set((state) => ({
          users: state.users.map(u => u.id === id ? { ...u, ...user } : u)
        }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('system_users').update({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }).eq('id', id);
          toast.success('Usuário atualizado com sucesso!');
        } catch (e) { console.error(e); }
      },
      deleteUser: async (id) => {
        set((state) => ({ users: state.users.filter(u => u.id !== id) }));
        if (!isSupabaseConfigured) return;
        try {
          await supabase.from('system_users').delete().eq('id', id);
          toast.success('Usuário removido com sucesso!');
        } catch (e) { console.error(e); }
      },

      updateTicketStatus: (id, status) => {
        const ticket = get().tickets.find(t => t.id === id);
        if (ticket) {
          const { id: _, ...rest } = ticket;
          get().updateTicket(id, { ...rest, status });
        }
      },

      updateQuoteStatus: (id, status) => {
        const quote = get().quotes.find(q => q.id === id);
        if (quote) {
          const { id: _, ...rest } = quote;
          get().updateQuote(id, { ...rest, status });
        }
      },

      addWaterReading: (reading) => {
        const lastReading = get().consumptionReadings
          .filter(r => r.clientId === reading.clientId && r.type === 'WATER')
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
          })[0];
        
        const previousValue = lastReading ? lastReading.currentValue : 0;
        const consumption = reading.reading - previousValue;

        get().addConsumptionReading({
          clientId: reading.clientId,
          type: 'WATER',
          previousValue,
          currentValue: reading.reading,
          consumption: consumption > 0 ? consumption : 0,
          date: reading.date,
          unit: 'm³',
          billed: false
        });
      },

      addEnergyReading: (reading) => {
        const lastReading = get().consumptionReadings
          .filter(r => r.clientId === reading.clientId && r.type === 'ENERGY')
          .sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
          })[0];
        
        const previousValue = lastReading ? lastReading.currentValue : 0;
        const consumption = reading.reading - previousValue;

        get().addConsumptionReading({
          clientId: reading.clientId,
          type: 'ENERGY',
          previousValue,
          currentValue: reading.reading,
          consumption: consumption > 0 ? consumption : 0,
          date: reading.date,
          unit: 'kWh',
          billed: false
        });
      },

      createBudget: (budget) => {
        get().addTicket({
          title: budget.title,
          type: 'TAREFA',
          status: 'PENDENTE_APROVACAO',
          clientId: budget.clientId,
          date: new Date().toISOString(),
          technician: 'Bia AI',
          observations: budget.observations,
          budgetAmount: budget.budgetAmount,
          budgetApproved: false,
          maintenanceCategory: 'GERAL',
          maintenanceSubcategory: 'ORÇAMENTO'
        });
      },

      processConsumptionReadingWithAI: async (file, type) => {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const fileToBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const base64String = reader.result as string;
              resolve(base64String.split(',')[1]);
            };
            reader.onerror = error => reject(error);
          });
        };

        try {
          const base64Data = await fileToBase64(file);
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64Data
                  }
                },
                {
                  text: `Analise esta imagem de um medidor de ${type === 'WATER' ? 'água' : type === 'GAS' ? 'gás' : 'energia'}. Extraia o valor numérico atual exibido no visor. Retorne apenas o número em formato JSON com a chave "value" e "confidence" (0-1).`
                }
              ]
            },
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.NUMBER },
                  confidence: { type: Type.NUMBER }
                },
                required: ["value", "confidence"]
              }
            }
          });

          const result = JSON.parse(response.text || '{"value": 0, "confidence": 0}');
          return result;
        } catch (error) {
          console.error('Erro ao processar leitura com IA:', error);
          toast.error('Erro ao processar imagem.');
          return { value: 0, confidence: 0 };
        }
      },

      generateBudgetForecastWithAI: async (historicalData) => {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Com base nestes dados históricos de custos de um condomínio: ${JSON.stringify(historicalData)}. Gere uma previsão orçamentária detalhada para os próximos 6 meses. Retorne um objeto JSON com as chaves: month (mês da previsão), monthlyProjections (array com month e value), categories (array com name e value), insights (array de strings), confidence (0-1).`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  monthlyProjections: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        month: { type: Type.STRING },
                        value: { type: Type.NUMBER }
                      },
                      required: ["month", "value"]
                    }
                  },
                  categories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        value: { type: Type.NUMBER }
                      },
                      required: ["name", "value"]
                    }
                  },
                  insights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  confidence: { type: Type.NUMBER }
                },
                required: ["month", "monthlyProjections", "categories", "insights", "confidence"]
              }
            }
          });

          const data = JSON.parse(response.text || '{}');
          return {
            ...data,
            id: uuidv4(),
            createdAt: new Date().toISOString()
          } as BudgetForecast;
        } catch (error) {
          console.error("AI Forecast Error:", error);
          return null;
        }
      },

      restoreData: async (data) => {
        set((state) => ({
          ...state,
          ...data,
          // Ensure we don't accidentally overwrite functions if they were included in JSON
          clients: data.clients || state.clients,
          checklistItems: data.checklistItems || state.checklistItems,
          tickets: data.tickets || state.tickets,
          quotes: data.quotes || state.quotes,
          receipts: data.receipts || state.receipts,
          costs: data.costs || state.costs,
          appointments: data.appointments || state.appointments,
          products: data.products || state.products,
          suppliers: data.suppliers || state.suppliers,
          supplyItems: data.supplyItems || state.supplyItems,
          supplyQuotations: data.supplyQuotations || state.supplyQuotations,
          payments: data.payments || state.payments,
          legalAgreements: data.legalAgreements || state.legalAgreements,
          scheduledMaintenances: data.scheduledMaintenances || state.scheduledMaintenances,
          notifications: data.notifications || state.notifications,
          consumptionReadings: data.consumptionReadings || state.consumptionReadings,
          digitalFolder: data.digitalFolder || state.digitalFolder,
          notices: data.notices || state.notices,
          packages: data.packages || state.packages,
          visitors: data.visitors || state.visitors,
          criticalEvents: data.criticalEvents || state.criticalEvents,
          energyData: data.energyData || state.energyData,
          savingsGoals: data.savingsGoals || state.savingsGoals,
          assemblies: data.assemblies || state.assemblies,
          documentTemplates: data.documentTemplates || state.documentTemplates,
          companyLogo: data.companyLogo !== undefined ? data.companyLogo : state.companyLogo,
          companySignature: data.companySignature !== undefined ? data.companySignature : state.companySignature,
          companyData: data.companyData !== undefined ? data.companyData : state.companyData,
          theme: data.theme || state.theme,
          menuOrder: data.menuOrder || state.menuOrder,
          hiddenTiles: data.hiddenTiles || state.hiddenTiles,
          tileSizes: data.tileSizes || state.tileSizes,
          tileOrder: data.tileOrder || state.tileOrder,
        }));

        if (!isSupabaseConfigured) return;

        const loadingToast = toast.loading('Sincronizando backup com o servidor...');

        try {
          // 1. Clients
          if (data.clients) {
            await supabase.from('clients').upsert(data.clients.map(c => ({
              id: c.id,
              name: c.name,
              document: c.document,
              contact_person: c.contactPerson,
              phone: c.phone,
              email: c.email,
              address: c.address,
              notes: c.notes
            })));
          }

          // 2. Tickets
          if (data.tickets) {
            await supabase.from('tickets').upsert(data.tickets.map(t => ({
              id: t.id,
              os_number: t.osNumber,
              title: t.title,
              type: t.type,
              status: t.status,
              maintenance_category: t.maintenanceCategory,
              maintenance_subcategory: t.maintenanceSubcategory,
              client_id: t.clientId,
              date: t.date,
              technician: t.technician,
              observations: t.observations,
              reported_problem: t.reportedProblem,
              products_for_quote: t.productsForQuote,
              service_report: t.serviceReport,
              checklist_results: t.checklistResults,
              images: t.images,
              reported_by: t.reportedBy,
              location: t.location,
              photo_before: t.photoBefore,
              budget_amount: t.budgetAmount,
              budget_approved: t.budgetApproved,
              color: t.color,
              history: t.history
            })));
          }

          // 3. Products
          if (data.products) {
            await supabase.from('products').upsert(data.products.map(p => ({
              id: p.id,
              code: p.code,
              name: p.name,
              description: p.description,
              price: p.price,
              unit: p.unit
            })));
          }

          // 4. Quotes
          if (data.quotes) {
            await supabase.from('quotes').upsert(data.quotes.map(q => ({
              id: q.id,
              client_id: q.clientId,
              date: q.date,
              total_value: q.totalValue,
              status: q.status,
              items: q.items
            })));
          }

          // 5. Receipts
          if (data.receipts) {
            await supabase.from('receipts').upsert(data.receipts.map(r => ({
              id: r.id,
              client_id: r.clientId,
              date: r.date,
              value: r.value,
              description: r.description
            })));
          }

          // 6. Costs
          if (data.costs) {
            await supabase.from('costs').upsert(data.costs.map(c => ({
              id: c.id,
              description: c.description,
              value: c.value,
              date: c.date,
              category: c.category
            })));
          }

          // 7. Appointments
          if (data.appointments) {
            await supabase.from('appointments').upsert(data.appointments.map(a => ({
              id: a.id,
              title: a.title,
              start_time: a.start,
              end_time: a.end,
              type: a.type,
              ticket_id: a.ticketId,
              notes: a.notes
            })));
          }

          // 8. Checklist Items
          if (data.checklistItems) {
            await supabase.from('checklist_items').upsert(data.checklistItems.map(i => ({
              id: i.id,
              task: i.task,
              category: i.category,
              client_id: i.clientId,
              client_ids: i.clientIds
            })));
          }

          // 9. Suppliers
          if (data.suppliers) {
            await supabase.from('suppliers').upsert(data.suppliers.map(s => ({
              id: s.id,
              name: s.name,
              contact: s.contact,
              phone: s.phone,
              email: s.email,
              category: s.category
            })));
          }

          // 10. Supply Items
          if (data.supplyItems) {
            await supabase.from('supply_items').upsert(data.supplyItems.map(i => ({
              id: i.id,
              name: i.name,
              category: i.category,
              current_stock: i.currentStock,
              min_stock: i.minStock,
              unit: i.unit,
              last_price: i.lastPrice,
              client_id: i.clientId
            })));
          }

          // 11. Payments
          if (data.payments) {
            await supabase.from('payments').upsert(data.payments.map(p => ({
              id: p.id,
              client_id: p.clientId,
              amount: p.amount,
              due_date: p.dueDate,
              payment_date: p.paymentDate,
              status: p.status,
              reference: p.reference
            })));
          }

          // 12. Legal Agreements
          if (data.legalAgreements) {
            await supabase.from('legal_agreements').upsert(data.legalAgreements.map(a => ({
              id: a.id,
              client_id: a.clientId,
              total_amount: a.totalAmount,
              installments: a.installments,
              remaining_installments: a.remainingInstallments,
              status: a.status,
              start_date: a.startDate,
              notes: a.notes
            })));
          }

          // 13. Scheduled Maintenances
          if (data.scheduledMaintenances) {
            await supabase.from('scheduled_maintenances').upsert(data.scheduledMaintenances.map(m => ({
              id: m.id,
              client_id: m.clientId,
              standard_id: m.standardId,
              item: m.item,
              frequency: m.frequency,
              last_done: m.lastDone,
              next_date: m.nextDate,
              status: m.status,
              category: m.category
            })));
          }

          // 14. Consumption Readings
          if (data.consumptionReadings) {
            await supabase.from('consumption_readings').upsert(data.consumptionReadings.map(r => ({
              id: r.id,
              client_id: r.clientId,
              type: r.type,
              previous_value: r.previousValue,
              current_value: r.currentValue,
              consumption: r.consumption,
              date: r.date,
              unit: r.unit,
              billed: r.billed
            })));
          }

          // 15. Assemblies
          if (data.assemblies) {
            await supabase.from('assemblies').upsert(data.assemblies.map(a => ({
              id: a.id,
              title: a.title,
              description: a.description,
              date: a.date,
              status: a.status,
              options: a.options,
              votes: a.votes,
              legal_validity_hash: a.legalValidityHash
            })));
          }

          // 16. Notices
          if (data.notices) {
            await supabase.from('notices').upsert(data.notices.map(n => ({
              id: n.id,
              title: n.title,
              content: n.content,
              date: n.date,
              category: n.category,
              tower: n.tower,
              apartment_line: n.apartmentLine,
              client_id: n.clientId
            })));
          }

          // 17. Packages
          if (data.packages) {
            await supabase.from('packages').upsert(data.packages.map(p => ({
              id: p.id,
              resident_name: p.residentName,
              apartment: p.apartment,
              tower: p.tower,
              carrier: p.carrier,
              tracking_code: p.trackingCode,
              received_at: p.receivedAt,
              picked_up_at: p.pickedUpAt,
              status: p.status,
              qr_code: p.qrCode,
              photo_url: p.photoUrl,
              client_id: p.clientId
            })));
          }

          // 18. Visitors
          if (data.visitors) {
            await supabase.from('visitors').upsert(data.visitors.map(v => ({
              id: v.id,
              name: v.name,
              document: v.document,
              type: v.type,
              apartment: v.apartment,
              tower: v.tower,
              valid_until: v.validUntil,
              qr_code: v.qrCode,
              status: v.status
            })));
          }

          // 19. Critical Events
          if (data.criticalEvents) {
            await supabase.from('critical_events').upsert(data.criticalEvents.map(e => ({
              id: e.id,
              device: e.device,
              location: e.location,
              type: e.type,
              status: e.status,
              last_update: e.lastUpdate,
              description: e.description
            })));
          }

          // 20. Digital Folder
          if (data.digitalFolder) {
            await supabase.from('digital_folder').upsert(data.digitalFolder.map(i => ({
              id: i.id,
              client_id: i.clientId,
              title: i.title,
              description: i.description,
              category: i.category,
              date: i.date,
              amount: i.amount,
              file_url: i.fileUrl,
              status: i.status,
              signatures: i.signatures
            })));
          }

          // 21. Supply Quotations
          if (data.supplyQuotations) {
            await supabase.from('supply_quotations').upsert(data.supplyQuotations.map(q => ({
              id: q.id,
              date: q.date,
              items: q.items,
              responses: q.responses,
              status: q.status
            })));
          }

          // 22. Notifications
          if (data.notifications) {
            await supabase.from('notifications').upsert(data.notifications.map(n => ({
              id: n.id,
              title: n.title,
              message: n.message,
              type: n.type,
              date: n.date,
              read: n.read,
              link: n.link
            })));
          }

          // 23. Savings Goals
          if (data.savingsGoals) {
            await supabase.from('savings_goals').upsert(data.savingsGoals.map(g => ({
              id: g.id,
              title: g.title,
              target_amount: g.targetAmount,
              current_amount: g.currentAmount,
              deadline: g.deadline,
              category: g.category,
              icon: g.icon,
              status: g.status
            })));
          }

          // 24. Document Templates
          if (data.documentTemplates) {
            await supabase.from('document_templates').upsert(data.documentTemplates.map(t => ({
              id: t.id,
              title: t.title,
              category: t.category,
              description: t.description,
              legal_basis: t.legalBasis,
              content: t.content,
              file_url: t.fileUrl
            })));
          }

          // 25. Company Settings
          const companySettingsId = get().companySettingsId;
          if (companySettingsId && data.companyData) {
            await supabase.from('company_settings').upsert({
              id: companySettingsId,
              name: data.companyData.name,
              document: data.companyData.document,
              phone: data.companyData.phone,
              email: data.companyData.email,
              address: data.companyData.address,
              website: data.companyData.website,
              logo_url: data.companyLogo,
              signature_url: data.companySignature,
              theme: data.theme,
              menu_order: data.menuOrder,
              hidden_tiles: data.hiddenTiles,
              tile_sizes: data.tileSizes,
              tile_order: data.tileOrder,
              energy_data: data.energyData
            });
          }

          toast.success('Backup restaurado e sincronizado com sucesso!', { id: loadingToast });
        } catch (error) {
          console.error('Erro ao sincronizar backup com Supabase:', error);
          toast.error('Erro ao sincronizar dados com o servidor.', { id: loadingToast });
        }
      },
    })
);
