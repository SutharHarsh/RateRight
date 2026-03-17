import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  Check, 
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import { UpgradeButton } from '@/components/shared/UpgradeButton';
import { Footer } from '@/components/shared/Footer';
import { normalizePlan } from '@/lib/subscription';

export const metadata: Metadata = {
  title: 'Pricing - Affordable Plans for Every Creator',
  description:
    'Start free with 3 calculations per month. Upgrade to Premium for unlimited calculations and professional rate cards.',
  openGraph: {
    title: 'RateRight Pricing - Plans for Every Creator',
    description: 'Free plan available. Premium starts at $19/month.',
    url: 'https://rateright.com/pricing',
  },
};

export default async function PricingPage() {
  const { userId } = await getOptionalAuth();
  
  let currentPlan: 'FREE' | 'PREMIUM' = 'FREE';
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { plan: true },
      });
      if (user) {
        currentPlan = normalizePlan(user.plan);
      }
    } catch (error) {
      console.error('Pricing database error:', error);
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out RateRight',
      features: [
        '3 rate calculations per month',
        'Basic rate ranges',
        'Platform coverage (Instagram, TikTok, YouTube)',
        'Email support',
      ],
      limitations: [
        'No detailed breakdowns',
        'No rate card downloads',
        'No saved calculations',
      ],
      cta: currentPlan === 'FREE' ? 'Current Plan' : 'Get Started Free',
      icon: Zap,
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '$19',
      period: 'per month',
      description: 'For serious creators who want to maximize earnings',
      features: [
        'Unlimited calculations',
        'Detailed rate breakdowns',
        'Professional rate card downloads',
        'Multiple rate card templates',
        'Save calculation history',
        'Historical rate trends',
        'Negotiation scripts and tips',
        'Usage rights calculator',
        'Priority email support',
        'Early access to new features',
      ],
      cta: currentPlan === 'PREMIUM' ? 'Current Plan' : 'Upgrade to Premium',
      icon: Sparkles,
      highlighted: true,
    },
  ];

  const faqs = [
    { q: 'Can I switch plans anytime?', a: 'Yes. You can upgrade to Premium anytime and cancel from billing settings when needed.' },
    { q: 'What happens when I hit the free tier limit?', a: 'You\'ll be prompted to upgrade to Premium. Your existing calculations remain accessible, but you won\'t be able to create new ones until you upgrade or your monthly limit resets.' },
    { q: 'How many calculations are included on Free?', a: 'Free includes 3 calculations per month. Premium gives you unlimited calculations.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards, and digital wallets via Stripe. All payments are secure and encrypted.' },
    { q: 'Is there a money-back guarantee?', a: 'Yes! We offer a 14-day money-back guarantee. If you\'re not satisfied, contact us for a full refund, no questions asked.' },
    { q: 'Can I cancel my subscription?', a: 'Of course! You can cancel anytime from your account settings. You\'ll keep access until the end of your billing period.' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

      <div className="relative container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
            <Sparkles className="w-3 h-3" />
            Simple, transparent pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-white">Invest in your</span>
            <br />
            <span className="text-violet-300">
              creator career
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 items-start max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = (plan.name === 'Free' && currentPlan === 'FREE') || (plan.name === 'Premium' && currentPlan === 'PREMIUM');

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-px transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-violet-500/30 scale-[1.03]'
                    : 'border border-[rgba(255,255,255,0.07)]'
                }`}
                style={!plan.highlighted ? { background: 'transparent' } : undefined}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-semibold bg-violet-600 text-white">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div
                  className="rounded-2xl p-8 h-full"
                  style={{
                    background: plan.highlighted ? 'rgba(13,18,35,0.95)' : 'rgba(13,25,41,0.7)',
                  }}
                >
                  {/* Plan header */}
                  <div className="mb-8">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                        plan.highlighted
                          ? 'bg-violet-600'
                          : 'bg-slate-700/60 border border-slate-600/30'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${plan.highlighted ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-end gap-2">
                      <span className={`text-5xl font-bold ${plan.highlighted ? 'text-violet-300' : 'text-white'}`}>
                        {plan.price}
                      </span>
                      <span className="text-slate-500 mb-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.highlighted ? 'bg-violet-500/20' : 'bg-slate-700/60'}`}>
                          <Check className={`w-3 h-3 ${plan.highlighted ? 'text-violet-400' : 'text-slate-400'}`} />
                        </div>
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {Array.isArray(plan.limitations) && (
                    <ul className="space-y-2 mb-8 border-t border-slate-800 pt-6">
                      {plan.limitations.map((item: string) => (
                        <li key={item} className="text-sm text-slate-500">{item}</li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 text-sm font-medium text-slate-500 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] cursor-not-allowed"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <>
                      {plan.name === 'Premium' ? (
                        <UpgradeButton
                          interval="month"
                          className={`w-full ${plan.highlighted ? 'bg-violet-600 hover:bg-violet-500' : ''}`}
                        />
                      ) : (
                        <Link href={userId ? '/dashboard' : '/signup'}>
                          <button className="w-full py-3 text-sm font-medium text-slate-300 rounded-xl bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] transition-all duration-200">
                            {plan.cta}
                          </button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-24 text-sm text-slate-500">
          {[
            { icon: Shield, text: '14-day money-back guarantee' },
            { icon: Zap, text: 'Cancel anytime' },
            { icon: Check, text: 'No hidden fees' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-violet-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-center mb-10">Everything you need to know</p>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] p-6 hover:border-[rgba(124,58,237,0.3)] transition-all duration-200"
                style={{ background: '#0f172a' }}
              >
                <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="relative rounded-3xl border border-[rgba(124,58,237,0.3)] p-12 text-center overflow-hidden"
          style={{
            background: '#0f172a',
          }}
        >
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-3">Still have questions?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Our team is here to help! Reach out and we&apos;ll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-7 py-3 text-sm font-semibold text-white rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors duration-200">
                Contact Sales
              </button>
              <button className="px-7 py-3 text-sm font-medium text-slate-300 rounded-xl border border-slate-700 hover:border-slate-600 hover:text-white transition-colors duration-200">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


