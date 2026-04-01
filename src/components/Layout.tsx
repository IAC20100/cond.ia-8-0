import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, LogOut, Database, Bell } from 'lucide-react';
import { useStore } from '../store';
import { AssistantBia } from './AssistantBia';
import { BiaBrain } from './BiaBrain';
import Login from '../pages/Login';

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme, isAuthenticated, logout, notifications, markNotificationAsRead, clearNotifications, companyLogo, fetchInitialData, biaEnabled, fontSize } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Define public routes that don't require authentication
  const publicRoutes = ['/report', '/chat', '/feedback', '/quick'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated, fetchInitialData]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const favicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    const defaultIcon = 'https://api.iconify.design/lucide:database.svg?color=%23004a7c&v=1';
    const iconUrl = companyLogo ? `${companyLogo}${companyLogo.includes('?') ? '&' : '?'}v=${Date.now()}` : defaultIcon;
    favicons.forEach(favicon => {
      favicon.setAttribute('href', iconUrl);
    });
  }, [companyLogo]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  if (!isAuthenticated && !isPublicRoute) {
    return <Login />;
  }

  const isDashboard = location.pathname === '/';
  const isImmersive = isDashboard || [
    '/tickets', 
    '/service-orders', 
    '/tickets/new', 
    '/calendar', 
    '/kanban', 
    '/products', 
    '/financial', 
    '/receipts', 
    '/settings',
    '/clients',
    '/checklist',
    '/intelligent-checklist',
    '/qr-codes',
    '/supplies',
    '/accountability',
    '/consumption',
    '/assembly',
    '/notices',
    '/locker',
    '/visitors',
    '/monitoring',
    '/energy',
    '/document-factory',
    '/document-management',
    '/presentation',
    '/budget-forecast',
    '/financial-brain',
    '/marketplace',
    '/lost-and-found'
  ].some(path => location.pathname.startsWith(path));

  return (
    <div 
      className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white transition-colors duration-200 font-sans flex flex-col"
    >
      {/* Modern Top Bar */}
      {!isImmersive && !isPublicRoute && (
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title="Voltar para a página principal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/" className="flex items-center gap-3 group">
              {companyLogo ? (
                <img src={companyLogo} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-zinc-700" />
              ) : (
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Database className="w-4 h-4" />
                </div>
              )}
              <span className="text-xl font-display font-black group-hover:text-primary transition-colors">
                Dashboard
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block mr-4">
              <div className="text-sm font-display font-bold">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-[0.625rem] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors relative" 
                  title="Notificações"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[0.625rem] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                      <h3 className="font-bold">Notificações</h3>
                      <button onClick={clearNotifications} className="text-xs text-primary hover:underline">Limpar tudo</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm italic">
                          Nenhuma notificação
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotificationAsRead(n.id)}
                            className={`p-4 border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm">{n.title}</span>
                              <span className="text-[0.625rem] text-gray-400">{new Date(n.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                title="Sair do sistema"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 relative overflow-x-hidden ${isDashboard || isPublicRoute ? '' : 'p-6 md:p-8'}`}>
        {children}
      </main>

      {/* Assistant Bia */}
      {biaEnabled && !isPublicRoute && <AssistantBia />}
      {biaEnabled && <BiaBrain />}
    </div>
  );
}
