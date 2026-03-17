'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Calculator,
  FileText,
  Settings,
  Menu,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/shared/Logo';
import { useSubscription } from '@/hooks/useSubscription';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calculations', href: '/dashboard/calculations', icon: Calculator },
  { name: 'Rate Cards', href: '/dashboard/rate-cards', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isPremium } = useSubscription();

  const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div
      className="flex h-full flex-col"
      style={{
        background: '#0b1220',
        borderRight: '1px solid rgba(51,65,85,0.8)',
      }}
    >
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <Logo size="md" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive ? 'text-violet-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
              style={isActive ? { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' } : {}}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#a78bfa' }} />
              )}
              <item.icon className={cn('w-4 h-4 shrink-0', !isActive && 'ml-[10px]')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(124,58,237,0.1)' }}>
        {!isPremium && (
          <Link href="/pricing" onClick={onNavigate} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 mb-1">
            <TrendingUp className="w-4 h-4 ml-[10px]" />
            Upgrade Plan
          </Link>
        )}
        <Link href="/dashboard/settings?tab=billing" onClick={onNavigate} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 mb-3">
          <CreditCard className="w-4 h-4 ml-[10px]" />
          Billing
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-slate-400">Account</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col" style={{ zIndex: 40 }}>
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-50 border-b border-slate-800 bg-[#0b1220] flex items-center px-4">
        <div className="flex items-center gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg text-slate-300 hover:bg-white/5" aria-label="Open dashboard menu">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <Logo size="sm" />
        </div>
        <div className="ml-auto">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
