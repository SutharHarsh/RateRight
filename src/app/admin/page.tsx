import { getOptionalAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { 
  ArrowLeft,
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Crown,
  Calculator,
  BarChart3
} from 'lucide-react';

export default async function AdminPage() {
  const { userId } = await getOptionalAuth();
  
  if (!userId) {
    redirect('/login');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Get admin stats
  const [
    totalUsers,
    premiumUsers,
    totalCalculations,
    recentUsers,
    recentCalculations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: { in: ['PRO', 'PREMIUM'] } } }),
    prisma.calculation.count(),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    }),
    prisma.calculation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = premiumUsers * 19;

  const stats = [
    {
      title: 'Total Users',
      value: formatNumber(totalUsers),
      change: '+12% from last month',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'MRR',
      value: formatCurrency(mrr),
      change: `${premiumUsers} premium subscriptions`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Total Calculations',
      value: formatNumber(totalCalculations),
      change: `${(totalCalculations / totalUsers).toFixed(1)} per user`,
      icon: Calculator,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Conversion Rate',
      value: `${((premiumUsers) / totalUsers * 100).toFixed(1)}%`,
      change: 'Free to paid conversion',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge variant="destructive">ADMIN</Badge>
        </div>
        <p className="text-muted-foreground">
          System overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Users
            </CardTitle>
            <CardDescription>
              Latest user sign-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u: typeof recentUsers[0]) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {u.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant={
                      u.plan === 'PREMIUM' ? 'default' : 
                      u.plan === 'PRO' ? 'secondary' : 
                      'outline'
                    }>
                      {u.plan === 'PREMIUM' && <Crown className="w-3 h-3 mr-1" />}
                      {u.plan}
                    </Badge>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Calculations
            </CardTitle>
            <CardDescription>
              Latest rate calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCalculations.map((calc: (typeof recentCalculations)[number]) => {
                return (
                  <div key={calc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {calc.user?.name || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {calc.platform}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(calc.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-primary">
                        {formatCurrency(Number(calc.recommendedRate ?? 0))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(calc.minRate ?? 0))} - {formatCurrency(Number(calc.maxRate ?? 0))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Plan Distribution
          </CardTitle>
          <CardDescription>
            User breakdown by subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Free</p>
              <p className="text-3xl font-bold mb-1">
                {totalUsers - premiumUsers}
              </p>
              <p className="text-xs text-muted-foreground">
                {((totalUsers - premiumUsers) / totalUsers * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg border-primary">
              <p className="text-sm text-muted-foreground mb-2">Premium</p>
              <p className="text-3xl font-bold mb-1 text-primary">
                {premiumUsers}
              </p>
              <p className="text-xs text-muted-foreground">
                {(premiumUsers / totalUsers * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Manage Users</p>
                <p className="text-sm text-muted-foreground">View all users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">View Analytics</p>
                <p className="text-sm text-muted-foreground">Detailed reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Rate Database</p>
                <p className="text-sm text-muted-foreground">Manage rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
