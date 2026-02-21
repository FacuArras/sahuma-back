'use client';

import { DollarSign } from 'lucide-react';
import clsx from 'clsx';

type SaleStatus = 'Completado' | 'Pendiente' | 'Cancelado';

interface Sale {
  id: string;
  customerName: string;
  orderId: string;
  itemCount: number;
  amount: number;
  date: string;
  status: SaleStatus;
}

// Mock data - últimas 5 ventas
const recentSales: Sale[] = [
  {
    id: '1',
    customerName: 'María González',
    orderId: 'VNT-015',
    itemCount: 3,
    amount: 8900,
    date: '2026-02-17',
    status: 'Pendiente'
  },
  {
    id: '2',
    customerName: 'Carlos Méndez',
    orderId: 'VNT-014',
    itemCount: 1,
    amount: 4200,
    date: '2026-02-16',
    status: 'Completado'
  },
  {
    id: '3',
    customerName: 'Lucía Fernández',
    orderId: 'VNT-013',
    itemCount: 5,
    amount: 12750,
    date: '2026-02-15',
    status: 'Completado'
  },
  {
    id: '4',
    customerName: 'Roberto Díaz',
    orderId: 'VNT-012',
    itemCount: 2,
    amount: 6800,
    date: '2026-02-14',
    status: 'Completado'
  },
  {
    id: '5',
    customerName: 'Ana Martínez',
    orderId: 'VNT-011',
    itemCount: 4,
    amount: 10500,
    date: '2026-02-13',
    status: 'Completado'
  }
];

export default function SalesHistory() {
  const getStatusStyles = (status: SaleStatus) => {
    switch (status) {
      case 'Completado':
        return 'bg-green-50 text-green-700';
      case 'Pendiente':
        return 'bg-orange-50 text-orange-600';
      case 'Cancelado':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-primary mb-1">Ventas Recientes</h3>
        <p className="text-sm text-secondary">Últimas 5 ventas registradas</p>
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {recentSales.map((sale) => (
          <div 
            key={sale.id} 
            className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {/* Left side - Customer info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-semibold text-primary">{sale.customerName}</h4>
                <span 
                  className={clsx(
                    'px-2 py-0.5 rounded-md text-xs font-medium',
                    getStatusStyles(sale.status)
                  )}
                >
                  {sale.status}
                </span>
              </div>
              <p className="text-xs text-secondary">
                {sale.orderId} - {sale.itemCount} {sale.itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Right side - Amount and Date */}
            <div className="text-right">
              <p className="font-bold text-primary mb-1">
                $ {sale.amount.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-secondary">{formatDate(sale.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
