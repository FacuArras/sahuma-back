import { prisma } from '@/lib/prisma';
import { TrendingUp, DollarSign, Wallet, PiggyBank } from 'lucide-react';
import RevenueChart from '@/components/RevenueChart';
import SalesHistory from '@/components/SalesHistory';
import TopProductsChart from '@/components/TopProductsChart';
import SalesByCategoryChart from '@/components/SalesByCategoryChart';

// ── MetricCard ────────────────────────────────────────────────────────────────

function MetricCard({
  title,
  value,
  change,
  prefix = '$',
  icon: Icon,
  trendLabel,
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

      {change === undefined && (
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-secondary">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return { start, end };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // ── Current month boundaries ──────────────────────────────────────────────
  const { start: monthStart, end: monthEnd } = monthRange(currentYear, currentMonth);

  // ── Ingresos: sum of totalVenta for sales this month ──────────────────────
  const ventasAggregate = await prisma.venta.aggregate({
    _sum: { totalVenta: true },
    where: { fecha: { gte: monthStart, lt: monthEnd } },
  });
  const ingresos = ventasAggregate._sum.totalVenta ?? 0;

  // ── Costes: sum of costoTotal for orders this month ───────────────────────
  const pedidosAggregate = await prisma.pedido.aggregate({
    _sum: { costoTotal: true },
    where: { fecha: { gte: monthStart, lt: monthEnd } },
  });
  const costes = pedidosAggregate._sum.costoTotal ?? 0;

  // ── Ganancias: ingresos - costes, minimum 0 ───────────────────────────────
  const ganancias = Math.max(0, ingresos - costes);

  // ── Ahorro: costes * 0.25 ─────────────────────────────────────────────────
  const ahorro = Math.round(costes * 0.25);

  // ── Total sales count this month ──────────────────────────────────────────
  const totalVentas = await prisma.venta.count({
    where: { fecha: { gte: monthStart, lt: monthEnd } },
  });

  // ── RevenueChart: last 6 months of ingresos + costes ─────────────────────
  const revenueData = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      // Go back i months from the current month (0 = current, 5 = 5 months ago)
      const offset = 5 - i;
      let m = currentMonth - offset;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      const { start, end } = monthRange(y, m);

      const [vAgg, pAgg] = await Promise.all([
        prisma.venta.aggregate({ _sum: { totalVenta: true }, where: { fecha: { gte: start, lt: end } } }),
        prisma.pedido.aggregate({ _sum: { costoTotal: true }, where: { fecha: { gte: start, lt: end } } }),
      ]);

      return {
        name: MESES_CORTO[m],
        ingresos: vAgg._sum.totalVenta ?? 0,
        costes: pAgg._sum.costoTotal ?? 0,
      };
    })
  );

  // ── TopProductsChart: items sold this month grouped by nombre+aroma ───────
  const itemsVendidos = await prisma.itemVenta.findMany({
    where: { venta: { fecha: { gte: monthStart, lt: monthEnd } } },
    select: { nombre: true, aroma: true, cantidad: true },
  });

  const topProductsMap = new Map<string, number>();
  for (const item of itemsVendidos) {
    const key = `${item.nombre} - ${item.aroma}`;
    topProductsMap.set(key, (topProductsMap.get(key) ?? 0) + item.cantidad);
  }
  const topProductsData = Array.from(topProductsMap.entries())
    .map(([nombre, unidades]) => ({ nombre, unidades }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 8);

  // ── SalesByCategoryChart: items sold this month grouped by marca ──────────
  const marcaMap = new Map<string, number>();
  for (const item of itemsVendidos) {
    marcaMap.set(item.nombre, (marcaMap.get(item.nombre) ?? 0) + item.cantidad);
  }
  const categoryData = Array.from(marcaMap.entries())
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);

  // ── SalesHistory: last 5 sales this month ─────────────────────────────────
  const recentVentas = await prisma.venta.findMany({
    where: { fecha: { gte: monthStart, lt: monthEnd } },
    orderBy: { fecha: 'desc' },
    take: 5,
    include: { items: { select: { nombre: true, aroma: true } } },
  });

  const salesHistoryData = recentVentas.map((v) => ({
    id: v.id,
    totalVenta: v.totalVenta,
    metodoPago: v.metodoPago,
    pagado: v.pagado,
    fecha: v.fecha.toISOString(),
    itemCount: v.items.length,
    items: v.items,
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-1">¡Bienvenida de vuelta!</h1>
        <p className="text-secondary text-sm">
          Resumen de tu tienda de sahumerios - {MESES[currentMonth]} {currentYear} |{' '}
          <span className="text-orange-400">
            {totalVentas} {totalVentas === 1 ? 'venta registrada' : 'ventas registradas'} este mes
          </span>
        </p>
        <hr className="mt-3 border-orange-100" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos"
          value={ingresos}
          icon={DollarSign}
        />
        <MetricCard
          title="Ganancias"
          value={ganancias}
          icon={TrendingUp}
        />
        <MetricCard
          title="Costes"
          value={costes}
          icon={Wallet}
        />
        <MetricCard
          title="Ahorro"
          value={ahorro}
          icon={PiggyBank}
          trendLabel="25% del costo mensual para el próximo mes"
        />
      </div>

      <div className="flex flex-col gap-6">
        <RevenueChart data={revenueData} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <TopProductsChart data={topProductsData} />
          <SalesByCategoryChart data={categoryData} />
        </div>
        <SalesHistory sales={salesHistoryData} />
      </div>
    </div>
  );
}
