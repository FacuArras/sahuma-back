// 'use client';

// import { prisma } from '@/lib/prisma';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingBag, PiggyBank } from 'lucide-react';
import RevenueChart from '@/components/RevenueChart';
import SalesHistory from '@/components/SalesHistory';
import TopProductsChart from '@/components/TopProductsChart';
import SalesByCategoryChart from '@/components/SalesByCategoryChart';


function MetricCard({
  title,
  value,
  change,
  prefix = '$',
  icon: Icon,
  trendLabel
}: {
  title: string;
  value: number;
  change?: number;
  prefix?: string;
  icon: any;
  trendLabel?: string;
}) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex flex-col justify-between gap-3 mb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-md text-secondary font-medium">{title}</p>
          <div className="bg-orange-50 p-2 rounded-lg">
            <Icon className="w-5 h-5 text-orange-400" />
          </div>
        </div>
        <h3 className="text-3xl font-bold text-primary">
          {prefix}{value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          {/* .900 hack for design matching if needed, else standard formatting */}
        </h3>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`px-2 py-1 rounded-md ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-secondary">{trendLabel || 'vs. mes anterior'}</span>
        </div>
      )}

      {/* Fallback for items without change percentage like Ahorro Sugerido */}
      {change === undefined && (
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-secondary">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  // MOCK DATA
  const data = {
    ingresos: { value: 98900, change: 4.1 },
    ganancias: { value: 62400, change: 3.8 },
    costes: { value: 36500, change: 4.3 },
    ahorro: { value: 45000 },
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-1">¡Bienvenida de vuelta!</h1>
        <p className="text-secondary text-sm">Resumen de tu tienda de sahumerios - Febrero 2026 | <span className="text-orange-400">7 ventas completadas, 3 pendientes de pago</span></p>
        <hr className="mt-3 border-orange-100" />
      </div>


      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos"
          value={data.ingresos.value}
          change={data.ingresos.change}
          icon={DollarSign}
        />
        <MetricCard
          title="Ganancias"
          value={data.ganancias.value}
          change={data.ganancias.change}
          icon={TrendingUp} // Or proper graph icon
        />
        <MetricCard
          title="Costes"
          value={data.costes.value}
          change={data.costes.change} // Red usually means bad for costs increasing, but following design color
          icon={Wallet}
        />
        <MetricCard
          title="Ahorro"
          value={data.ahorro.value}
          icon={PiggyBank}
          trendLabel="Dinero en efectivo a tener para el próximo mes"
        />
      </div>
      <div className="flex flex-col gap-6">
        <RevenueChart />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <TopProductsChart />
          <SalesByCategoryChart />
        </div>
        <SalesHistory />
      </div>
    </div>
  );
}

