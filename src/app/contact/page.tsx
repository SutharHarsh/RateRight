import { Mail, Bug, MessageSquareWarning } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const supportEmail = 'sutharharshp01@gmail.com';

  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Card className="border-[rgba(124,58,237,0.25)] bg-[#0f172a] p-8 md:p-10">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquareWarning className="h-6 w-6 text-violet-400" />
            <h1 className="text-3xl font-bold text-white">Contact Us</h1>
          </div>

          <p className="text-slate-300 leading-7 mb-8">
            Found a bug or facing any issue in the product? Please report it and we will review it quickly.
          </p>

          <div className="rounded-xl border border-[rgba(124,58,237,0.28)] bg-[rgba(124,58,237,0.08)] p-5 mb-8">
            <div className="flex items-center gap-2 mb-2 text-violet-300">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-semibold">Support Email</span>
            </div>
            <a
              href={`mailto:${supportEmail}?subject=RateRight%20Bug%20Report`}
              className="text-lg text-white hover:text-violet-300 transition-colors break-all"
            >
              {supportEmail}
            </a>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 mb-8">
            <div className="flex items-center gap-2 mb-2 text-slate-200">
              <Bug className="h-4 w-4" />
              <span className="text-sm font-semibold">Helpful Bug Report Format</span>
            </div>
            <p className="text-sm text-slate-400">
              Include: what happened, expected behavior, steps to reproduce, and screenshots if possible.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${supportEmail}?subject=RateRight%20Bug%20Report`}>
              <Button>
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
            </a>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}