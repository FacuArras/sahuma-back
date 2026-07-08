'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, DollarSign, Flame, ChevronsLeft, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from './SidebarContext';

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Resumen' },
    { href: '/inventory', icon: Package, label: 'Inventario' },
    { href: '/new-product', icon: PlusCircle, label: 'Nuevo Producto' },
    { href: '/orders', icon: ShoppingCart, label: 'Pedidos' },
    { href: '/sales', icon: DollarSign, label: 'Ventas' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebar();

    return (
        <aside
            className={clsx(
                'hidden md:flex flex-col bg-sidebar text-white h-screen fixed left-0 top-0 z-50 transition-all duration-300',
                collapsed ? 'w-[72px]' : 'w-64'
            )}
        >
            {/* Logo + Collapse toggle */}
            <div className={clsx('flex items-center h-[72px] border-b border-white/10 relative', collapsed ? 'justify-center px-0' : 'px-6 gap-3')}>
                {/* Logo icon — always visible */}
                <div className="bg-orange-500/20 p-2 rounded-lg flex-shrink-0">
                    <Flame className="text-orange-500 w-6 h-6" />
                </div>

                {/* Text — hidden when collapsed */}
                {!collapsed && (
                    <div className="overflow-hidden">
                        <h1 className="font-bold text-lg leading-tight whitespace-nowrap">Sahumerios</h1>
                        <p className="text-xs text-white/50 whitespace-nowrap">Panel de control</p>
                    </div>
                )}

                {/* Collapse toggle button */}
                <button
                    onClick={toggle}
                    title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    className={clsx(
                        'absolute cursor-pointer p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors',
                        collapsed ? '-right-3 top-1/2 -translate-y-1/2 bg-sidebar border border-white/20' : 'right-3 top-1/2 -translate-y-1/2'
                    )}
                >
                    {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={clsx(
                                'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium',
                                collapsed ? 'justify-center' : '',
                                isActive
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className={clsx('border-t border-white/10 p-3', collapsed ? 'flex justify-center' : '')}>
                {collapsed ? (
                    <div
                        title="Admin Store"
                        className="w-8 h-8 rounded-full bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-200"
                    >
                        AS
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-orange-900/50 flex items-center justify-center text-xs font-bold text-orange-200 flex-shrink-0">
                            AS
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">Admin Store</p>
                            <p className="text-xs text-white/50 truncate">admin@sahumerios.com</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
