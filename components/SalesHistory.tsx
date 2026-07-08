'use client';

import clsx from 'clsx';

export interface RecentSale {
  id: string;
  totalVenta: number;
  metodoPago: string;
  pagado: boolean;
  fecha: string; // ISO string
  itemCount: number;
  items: { nombre: string; aroma: string }[];
}

export default function SalesHistory({ sales }: { sales: RecentSale[] }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-primary mb-1">Ventas Recientes</h3>
        <p className="text-sm text-secondary">Últimas 5 ventas registradas este mes</p>
      </div>

      {sales.length === 0 ? (
        <p className="text-sm text-secondary text-center py-6">Sin ventas registradas este mes</p>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => {
            const label = sale.items.length > 0
              ? `${sale.items[0].nombre} ${sale.items[0].aroma}${sale.items.length > 1 ? ` +${sale.items.length - 1} más` : ''}`
              : '—';

            return (
              <div
                key={sale.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Left side */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-primary">{label}</h4>
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded-md text-xs font-medium',
                        sale.pagado
                          ? 'bg-green-50 text-green-700'
                          : 'bg-orange-50 text-orange-600'
                      )}
                    >
                      {sale.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-secondary">
                    {sale.itemCount} {sale.itemCount === 1 ? 'item' : 'items'} · {sale.metodoPago}
                  </p>
                </div>

                {/* Right side */}
                <div className="text-right">
                  <p className="font-bold text-primary mb-1">
                    $ {sale.totalVenta.toLocaleString('es-AR')}
                  </p>
                  <p className="text-xs text-secondary">{formatDate(sale.fecha)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
