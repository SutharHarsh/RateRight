'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  userEmail: string;
  status: string;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  plan: string;
}

export default function AdminBillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    mrr: 0,
    activeSubscriptions: 0,
    churnRate: 0,
  });

  useEffect(() => {
    async function load() {
      const [subsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/subscriptions', { cache: 'no-store' }),
        fetch('/api/admin/subscription-stats', { cache: 'no-store' }),
      ]);

      if (subsResponse.ok) {
        const data = (await subsResponse.json()) as { subscriptions?: Subscription[] };
        setSubscriptions(data.subscriptions || []);
      }

      if (statsResponse.ok) {
        const data = (await statsResponse.json()) as {
          mrr: number;
          activeSubscriptions: number;
          churnRate: number;
        };
        setStats(data);
      }
    }

    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Billing and Subscriptions</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold">${stats.mrr.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Churn Rate</p>
              <p className="text-2xl font-bold">{stats.churnRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Subscriptions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period End</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>{sub.userEmail}</TableCell>
                <TableCell className="font-semibold">{sub.plan}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sub.status === 'active'
                        ? 'default'
                        : sub.status === 'past_due'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {sub.status}
                  </Badge>
                  {sub.cancelAtPeriodEnd && (
                    <Badge variant="outline" className="ml-2">
                      Canceling
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd * 1000).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {sub.id ? (
                    <a
                      href={`https://dashboard.stripe.com/subscriptions/${sub.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      View in Stripe
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">No Stripe ID</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {subscriptions.length === 0 && (
          <div className="text-center py-12 text-gray-500">No subscriptions yet</div>
        )}
      </Card>
    </div>
  );
}
