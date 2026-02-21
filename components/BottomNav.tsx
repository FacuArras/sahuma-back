'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, DollarSign } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { href: '/', icon: LayoutDashboard },
    { href: '/new-product', icon: PlusCircle },
    { href: '/sales', icon: DollarSign },
    { href: '/orders', icon: ShoppingCart },
    { href: '/inventory', icon: Package },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-sidebar border-t rounded-t-lg border-secondary/10 px-6 py-3 z-50">
            <div className="flex justify-between items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className={clsx(
                                    'p-2 rounded-full transition-colors',
                                    isActive ? 'text-white' : 'text-secondary'
                                )}
                            >
                                <item.icon className="w-7 h-7" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
