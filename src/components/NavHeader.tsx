'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/shared/Logo';

export function NavHeader({
  authEnabled = true,
  signedIn = false,
  isAdmin = false,
}: {
  authEnabled?: boolean;
  signedIn?: boolean;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on dashboard or admin pages
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const navigation = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Calculator', href: '/calculator' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-slate-800 bg-slate-950'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size="md" />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 group"
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {authEnabled ? (
            <>
              {!signedIn ? (
                <>
                  <Link href="/login">
                    <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
                      Login
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors duration-200">
                      Get Started
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors duration-200">
                      Dashboard
                    </button>
                  </Link>
                  <Link href="/dashboard/settings">
                    <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors duration-200">
                      Account
                    </button>
                  </Link>
                  {isAdmin ? (
                    <Link href="/admin">
                      <button className="px-4 py-2 text-sm font-medium text-white border border-violet-500/50 hover:border-violet-400 rounded-lg transition-colors duration-200">
                        Admin
                      </button>
                    </Link>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <>
              <Link href="/pricing">
                <button className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
                  Pricing
                </button>
              </Link>
              <Link href="/calculator">
                <button className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors duration-200">
                  Calculate Free
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-2 mt-2">
              {authEnabled ? (
                <>
                  {!signedIn ? (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors duration-200">
                          Login
                        </button>
                      </Link>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors duration-200 mt-2">
                          Get Started
                        </button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-300 border border-[rgba(124,58,237,0.3)] rounded-lg">
                          Dashboard
                        </button>
                      </Link>
                      <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-300 border border-[rgba(124,58,237,0.3)] rounded-lg mt-2">
                          Account
                        </button>
                      </Link>
                      {isAdmin ? (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <button className="w-full px-4 py-2.5 text-sm font-medium text-white border border-violet-500/50 rounded-lg mt-2">
                            Admin
                          </button>
                        </Link>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 text-sm font-medium text-slate-300 border border-[rgba(124,58,237,0.3)] rounded-lg">
                      Pricing
                    </button>
                  </Link>
                  <Link href="/calculator" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors duration-200 mt-2">
                      Calculate Free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}