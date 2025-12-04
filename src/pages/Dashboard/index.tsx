import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { fixDemoProductPrice } from '../../utils/fixDemoProduct';
import { AlertCircle } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import MonthSelector from './MonthSelector';
import StatsCards from './StatsCards';
import FinancialStats from './FinancialStats';
import TopProducts from './TopProducts';
import TopClients from './TopClients';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [año, setAño] = useState<number>(new Date().getFullYear());

  const {
    stats,
    productosVendidos,
    clientesTop,
    loading,
    error
  } = useDashboard(mes, año);

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Corregir precio del producto Demo al cargar el dashboard
  useEffect(() => {
    const fixDemoPrice = async () => {
      try {
        await fixDemoProductPrice();
      } catch {
        // ignore background fix errors
      }
    };

    fixDemoPrice();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handleMesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAño(año - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const handleMesSiguiente = () => {
    if (mes === 12) {
      setMes(1);
      setAño(año + 1);
    } else {
      setMes(mes + 1);
    }
  };

  const handleMesActual = () => {
    const hoy = new Date();
    setMes(hoy.getMonth() + 1);
    setAño(hoy.getFullYear());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  const isCurrentMonth = mes === new Date().getMonth() + 1 && año === new Date().getFullYear();
  const ultimoDiaMes = new Date(año, mes, 0).getDate();

  return (
    <div className="min-h-screen bg-[#181818] overflow-x-hidden w-full">
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:max-w-7xl xl:max-w-[1800px] mx-auto max-w-full overflow-x-hidden w-full box-border">
        <DashboardHeader currentTime={currentTime} />

        <MonthSelector
          mes={mes}
          año={año}
          meses={meses}
          isCurrentMonth={isCurrentMonth}
          onMesAnterior={handleMesAnterior}
          onMesSiguiente={handleMesSiguiente}
          onMesActual={handleMesActual}
        />

        <StatsCards
          stats={stats}
          formatCurrency={formatCurrency}
          meses={meses}
          mes={mes}
          ultimoDiaMes={ultimoDiaMes}
        />

        <FinancialStats stats={stats} formatCurrency={formatCurrency} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          <TopProducts
            productosVendidos={productosVendidos}
            formatCurrency={formatCurrency}
            meses={meses}
            mes={mes}
            año={año}
          />
          <TopClients
            clientesTop={clientesTop}
            formatCurrency={formatCurrency}
            meses={meses}
            mes={mes}
            año={año}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;