import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const CommunicationCenter = lazy(() => import('./pages/CommunicationCenter'));
const Residents = lazy(() => import('./pages/Residents'));
const Operational = lazy(() => import('./pages/Operational'));
const Reservations = lazy(() => import('./pages/Reservations'));
const ChecklistManager = lazy(() => import('./pages/ChecklistManager'));
const Tickets = lazy(() => import('./pages/Tickets'));
const TicketForm = lazy(() => import('./pages/TicketForm'));
const TicketView = lazy(() => import('./pages/TicketView'));
const Settings = lazy(() => import('./pages/Settings'));
const KanbanBoard = lazy(() => import('./pages/KanbanBoard'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Receipts = lazy(() => import('./pages/Receipts'));
const Financial = lazy(() => import('./pages/Financial'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Products = lazy(() => import('./pages/Products'));
const Weather = lazy(() => import('./pages/Weather'));
const IntelligentChecklist = lazy(() => import('./pages/IntelligentChecklist'));
const QRManager = lazy(() => import('./pages/QRManager'));
const QRReports = lazy(() => import('./pages/QRReports'));
const PublicTicketForm = lazy(() => import('./pages/PublicTicketForm'));
const PublicChat = lazy(() => import('./pages/PublicChat'));
const PublicFeedback = lazy(() => import('./pages/PublicFeedback'));
const PublicQuickResponse = lazy(() => import('./pages/PublicQuickResponse'));
const SuppliesManager = lazy(() => import('./pages/SuppliesManager'));
const AccountabilityDashboard = lazy(() => import('./pages/AccountabilityDashboard'));
const ConsumptionDashboard = lazy(() => import('./pages/ConsumptionDashboard'));
const VirtualAssembly = lazy(() => import('./pages/VirtualAssembly'));
const Notices = lazy(() => import('./pages/Notices'));
const LockerManager = lazy(() => import('./pages/LockerManager'));
const VisitorControl = lazy(() => import('./pages/VisitorControl'));
const IotAutomation = lazy(() => import('./pages/IotAutomation'));
const EnergyMonitoring = lazy(() => import('./pages/EnergyMonitoring'));
const DocumentFactory = lazy(() => import('./pages/DocumentFactory'));
const DocumentManagement = lazy(() => import('./pages/DocumentManagement'));
const SystemPresentation = lazy(() => import('./pages/SystemPresentation'));
const BillingRules = lazy(() => import('./pages/BillingRules'));
const Contracts = lazy(() => import('./pages/Contracts'));
const RenovationsMoves = lazy(() => import('./pages/RenovationsMoves'));
const BudgetForecast = lazy(() => import('./pages/BudgetForecast'));
const FinancialBrain = lazy(() => import('./pages/FinancialBrain'));
const TechnicalReport = lazy(() => import('./pages/TechnicalReport'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const LostAndFound = lazy(() => import('./pages/LostAndFound'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Toaster position="top-right" />
        <Layout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/communication" element={<CommunicationCenter />} />
              <Route path="/clients" element={<Residents />} />
              <Route path="/products" element={<Products />} />
              <Route path="/checklist" element={<ChecklistManager />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/service-orders" element={<Tickets />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/intelligent-checklist" element={<IntelligentChecklist />} />
              <Route path="/qr-codes" element={<QRManager />} />
              <Route path="/qr-reports" element={<QRReports />} />
              <Route path="/report" element={<PublicTicketForm />} />
              <Route path="/chat" element={<PublicChat />} />
              <Route path="/feedback" element={<PublicFeedback />} />
              <Route path="/quick" element={<PublicQuickResponse />} />
              <Route path="/supplies" element={<SuppliesManager />} />
              <Route path="/accountability" element={<AccountabilityDashboard />} />
              <Route path="/consumption" element={<ConsumptionDashboard />} />
              <Route path="/billing-rules" element={<BillingRules />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/renovations-moves" element={<RenovationsMoves />} />
              <Route path="/budget-forecast" element={<BudgetForecast />} />
              <Route path="/financial-brain" element={<FinancialBrain />} />
              <Route path="/assembly" element={<VirtualAssembly />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/locker" element={<LockerManager />} />
              <Route path="/visitors" element={<VisitorControl />} />
              <Route path="/monitoring" element={<IotAutomation />} />
              <Route path="/operational" element={<Operational />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/energy" element={<EnergyMonitoring />} />
              <Route path="/tickets/new" element={<TicketForm />} />
              <Route path="/tickets/:id/edit" element={<TicketForm />} />
              <Route path="/tickets/:id" element={<TicketView />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/document-factory" element={<DocumentFactory />} />
              <Route path="/document-management" element={<DocumentManagement />} />
              <Route path="/technical-report" element={<TechnicalReport />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/lost-and-found" element={<LostAndFound />} />
              <Route path="/presentation" element={<SystemPresentation />} />
            </Routes>
          </Suspense>
        </Layout>
      </HashRouter>
    </ErrorBoundary>
  );
}
