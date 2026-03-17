import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Home, LayoutDashboard, Shield } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <aside className="w-64 border-r border-slate-200 bg-white hidden md:block">
        <div className="p-6 border-b border-slate-200">
          <Logo size="md" />
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <Shield className="h-3.5 w-3.5" />
            Admin
          </div>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-1">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Logo size="md" />
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">Admin Panel</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
