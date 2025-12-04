import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PullToRefreshIndicator from './components/PullToRefreshIndicator';
import POS from './pages/POS/index';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes/index';
import Caja from './pages/Caja/index';
import Dashboard from './pages/Dashboard/index';
import Login from './components/Login';
import Notification from './components/Notification';
import { useAuth } from './hooks/useAuth';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';

// Screen configuration
const SCREENS = {
  dashboard: {
    component: Dashboard,
    title: 'Sistema POS - Dashboard'
  },
  pos: {
    component: POS,
    title: 'Sistema POS - Punto de Venta'
  },
  productos: {
    component: Productos,
    title: 'Sistema POS - Gestión de Productos'
  },
  clientes: {
    component: Clientes,
    title: 'Sistema POS - Gestión de Clientes'
  },
  caja: {
    component: Caja,
    title: 'Sistema POS - Control de Caja'
  }
} as const;

type ScreenKey = keyof typeof SCREENS;

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { notification, hideNotification } = useNotification();
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [currentScreen]);

  const handleRefresh = useCallback(async () => {
    // Simular un pequeño delay para que se vea el efecto de carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Aquí puedes agregar lógica para refrescar los datos
    // Por ejemplo, recargar datos del dashboard, productos, etc.
    window.location.reload();
  }, []);

  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    mainSelector: 'main',
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const currentScreenConfig = SCREENS[currentScreen];
  const CurrentComponent = currentScreenConfig.component;

  return (
    <div className="h-screen bg-dark-bg flex overflow-hidden w-full">
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={(screen: string) => setCurrentScreen(screen as ScreenKey)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col bg-[#181818] md:ml-14 overflow-x-hidden w-full">
        <Header
          title={currentScreenConfig.title}
          onMenuClick={toggleSidebar}
        />

        <PullToRefreshIndicator 
          pullDistance={pullDistance} 
          isRefreshing={isRefreshing}
          threshold={80}
        />

        <main className="pt-12 md:pt-12 flex-1 overflow-y-auto overflow-x-hidden w-full box-border">
          <CurrentComponent />
        </main>
      </div>
      <Notification notification={notification} onClose={hideNotification} />
    </div>
  );
};

const App: React.FC = () => (
  <NotificationProvider>
    <AppContent />
  </NotificationProvider>
);

export default App;
