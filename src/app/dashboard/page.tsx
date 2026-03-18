import { getOptionalAuth } from '@/lib/auth';
import { clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, Calculator, FileText, TrendingUp, Users, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { prisma } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import { normalizePlan } from '@/lib/subscription';
import { CheckoutSessionSync } from '@/components/dashboard/CheckoutSessionSync';

async function loadDashboardUser(userId: string) {
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      calculations: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) {
    let clerkUser;
    try {
      const client = await clerkClient();
      clerkUser = await client.users.getUser(userId);
    } catch {
      // Session could not be resolved reliably (often cookie/auth edge cases).
      return null;
    }

    if (!clerkUser) {
      return null;
    }

    const primaryEmail =
      clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return null;
    }

    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
      clerkUser.username ||
      null;

    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email: primaryEmail,
        name: displayName,
        imageUrl: clerkUser.imageUrl,
      },
      create: {
        clerkId: userId,
        email: primaryEmail,
        name: displayName,
        imageUrl: clerkUser.imageUrl,
      },
    });

    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        calculations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  return user;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { success?: string; session_id?: string };
}) {
  const { userId } = await getOptionalAuth();

  if (!userId) {
    redirect('/login');
  }

  let user;
  try {
    user = await loadDashboardUser(userId);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#020617' }}>
        <div
          className="max-w-lg w-full rounded-2xl p-6 border"
          style={{
            background: 'rgba(13,25,41,0.75)',
            borderColor: 'rgba(124,58,237,0.25)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <h1 className="text-xl font-semibold text-white mb-2">Database unavailable</h1>
          <p className="text-slate-300 text-sm mb-4">
            RateRight couldn&apos;t connect to your Postgres database. Check your `DATABASE_URL` and verify the
            database is reachable, then refresh this page.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(to right, #7c3aed, #06b6d4)' }}
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
  }

  const totalCalculations = user.calculations.length;
  const normalizedPlan = normalizePlan(user.plan);
  const averageRate =
    totalCalculations > 0
      ? user.calculations.reduce((sum: number, calc: any) => sum + calc.recommendedRate, 0) /
        totalCalculations
      : 0;
  const highestRate =
    totalCalculations > 0
      ? Math.max(...user.calculations.map((calc: any) => calc.maxRate))
      : 0;
  const potentialEarnings = user.calculations.reduce(
    (sum: number, calc: any) => sum + calc.recommendedRate,
    0
  );

  const stats = [
    {
      label: 'Calculations This Month',
      value: user.calculationsUsed.toString(),
      sub: normalizedPlan === 'FREE' ? `${Math.max(0, user.calculationsLimit - user.calculationsUsed)} remaining` : 'Unlimited',
      icon: Calculator,
      accent: 'violet',
      glow: 'rgba(124,58,237,0.4)',
    },
    {
      label: 'Average Rate',
      value: formatCurrency(Math.round(averageRate)),
      sub: 'Across all calculations',
      icon: TrendingUp,
      accent: 'cyan',
      glow: 'rgba(6,182,212,0.4)',
    },
    {
      label: 'Highest Rate',
      value: formatCurrency(highestRate),
      sub: 'Your maximum rate',
      icon: DollarSign,
      accent: 'pink',
      glow: 'rgba(236,72,153,0.4)',
    },
    {
      label: 'Potential Earnings',
      value: formatCurrency(potentialEarnings),
      sub: 'If all deals closed',
      icon: Users,
      accent: 'green',
      glow: 'rgba(16,185,129,0.4)',
    },
  ];

  const accentClasses: Record<string, { border: string; icon: string; badge: string }> = {
    violet: { border: 'border-violet-500/20', icon: 'text-violet-400', badge: 'bg-violet-500/10' },
    cyan: { border: 'border-cyan-500/20', icon: 'text-cyan-400', badge: 'bg-cyan-500/10' },
    pink: { border: 'border-pink-500/20', icon: 'text-pink-400', badge: 'bg-pink-500/10' },
    green: { border: 'border-emerald-500/20', icon: 'text-emerald-400', badge: 'bg-emerald-500/10' },
  };

  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      <CheckoutSessionSync success={searchParams?.success} sessionId={searchParams?.session_id} />
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">

        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Welcome back,{' '}
              <span className="text-violet-300">
                {user.name || 'Creator'}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                normalizedPlan === 'FREE'
                  ? 'bg-slate-700/60 text-slate-300 border border-slate-600/40'
                  : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
              }`}
            >
              {normalizedPlan !== 'FREE' && <Sparkles className="w-3 h-3" />}
              {normalizedPlan}
            </span>
            {normalizedPlan === 'FREE' && (
              <Link href="/pricing">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-600 text-white cursor-pointer hover:bg-violet-500 transition-colors duration-200">
                  <TrendingUp className="w-3 h-3" />
                  Upgrade to Premium
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const cls = accentClasses[stat.accent];
            return (
              <div
                key={stat.label}
                className={`relative p-5 rounded-2xl border ${cls.border} group hover:scale-[1.02] transition-all duration-300`}
                style={{
                  background: '#0f172a',
                }}
              >
                <div className={`w-9 h-9 rounded-xl ${cls.badge} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${cls.icon}`} />
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-600">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl border border-[rgba(124,58,237,0.2)] p-6 mb-8"
          style={{
            background: '#0f172a',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Quick Actions</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Get started with your next calculation</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/calculator">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors duration-200">
                <Calculator className="w-4 h-4" />
                <span>New Rate Calculation</span>
              </button>
            </Link>
            {normalizedPlan !== 'FREE' && (
              <Link href="/dashboard/rate-cards">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 rounded-xl border border-slate-700 hover:border-slate-600 hover:text-white transition-colors duration-200">
                  <FileText className="w-4 h-4" />
                  Create Rate Card
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Calculations */}
        <div
          className="rounded-2xl border border-[rgba(124,58,237,0.2)]"
          style={{
            background: '#0f172a',
          }}
        >
          <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.05)]">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Recent Calculations</h2>
              </div>
              <p className="text-xs text-slate-500">Your latest rate calculations</p>
            </div>
            <Link href="/dashboard/calculations">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-[rgba(255,255,255,0.1)] hover:border-[rgba(124,58,237,0.4)] rounded-lg transition-all duration-200">
                View All
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
          <div className="p-6">
            {user.calculations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No calculations yet</h3>
                <p className="text-slate-500 mb-6 text-sm">Calculate your first rate to get started</p>
                <Link href="/calculator">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors duration-200">
                    <span>Calculate Now</span>
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {user.calculations.map((calc: any) => (
                  <Link
                    key={calc.id}
                    href={`/calculator/results?id=${calc.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[rgba(255,255,255,0.04)] hover:border-[rgba(124,58,237,0.3)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(124,58,237,0.05)] transition-all duration-200 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            {calc.platform}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-slate-700/60 text-slate-400 border border-slate-600/30">
                            {calc.niche}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{formatDate(calc.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-lg text-white group-hover:text-violet-300 transition-colors">
                          {formatCurrency(calc.recommendedRate)}
                        </p>
                        <p className="text-xs text-slate-600">
                          {formatCurrency(calc.minRate)} – {formatCurrency(calc.maxRate)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
