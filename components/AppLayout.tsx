'use client';

import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { SidebarProvider, useSidebar } from './SidebarContext';

function MainContent({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();
    return (
        <main className={`transition-all duration-300 pb-20 md:pb-0 min-h-screen ${collapsed ? 'md:pl-[72px]' : 'md:pl-64'}`}>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-cream">
                {/* Desktop Sidebar */}
                <Sidebar />

                {/* Main Content — shifts with sidebar */}
                <MainContent>{children}</MainContent>

                {/* Mobile Bottom Navigation */}
                <BottomNav />
            </div>
        </SidebarProvider>
    );
}
