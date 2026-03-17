'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/shared/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const stats = [
  { label: 'Creators using RateRight', value: '10,000+', icon: Users },
  { label: 'Average rate uplift', value: '47%', icon: TrendingUp },
  { label: 'Calculations generated', value: '1.2M+', icon: Calculator },
  { label: 'Deals informed monthly', value: '80K+', icon: Target },
];

const features = [
  {
    title: 'Precision Calculator',
    description:
      'Instantly generate fair ranges from real deal data across platform, niche, and usage rights.',
    icon: Calculator,
  },
  {
    title: 'Rate Confidence Score',
    description:
      'Get confidence scoring so you can explain your pricing with data, not guesswork.',
    icon: BarChart3,
  },
  {
    title: 'Brand-Ready Rate Cards',
    description:
      'Create polished cards in minutes and send a professional offer package to any brand.',
    icon: FileText,
  },
  {
    title: 'Negotiation Advantage',
    description:
      'Walk into every negotiation with benchmark context and clear value positioning.',
    icon: Zap,
  },
];

const steps = [
  {
    title: 'Input creator profile',
    description: 'Platform, audience, content type, deliverables, and campaign requirements.',
    icon: Users,
  },
  {
    title: 'Model fair market rate',
    description: 'We process the inputs against creator deal data and market multipliers.',
    icon: BarChart3,
  },
  {
    title: 'Send with confidence',
    description: 'Export your recommendation and share a clear, defensible rate card.',
    icon: ShieldCheck,
  },
];

const testimonials = [
  {
    quote:
      'I stopped second-guessing every brand offer. My close rate improved because my pricing finally made sense.',
    author: 'Ava M.',
    role: 'Lifestyle Creator · 120K followers',
  },
  {
    quote:
      'RateRight helped me increase my average campaign fee in under a month without losing partnerships.',
    author: 'Noah R.',
    role: 'Tech Creator · 85K subscribers',
  },
  {
    quote:
      'The confidence score and breakdown are huge. I can explain every number to agencies instantly.',
    author: 'Mia T.',
    role: 'Beauty Creator · 210K followers',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="min-h-screen flex items-center py-20 md:py-24">
        <motion.div
          className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <div>
            <motion.div variants={fadeInUp} className="mb-4">
              <Badge className="px-4 py-1.5 text-sm transition-colors duration-200 hover:bg-violet-500/20">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                Creator revenue intelligence platform
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5 text-foreground leading-tight"
            >
              Price Every Brand Deal Like a Top 1% Creator
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-[1.7]">
              Stop guessing rates. Use real creator market data to calculate fair pricing, defend
              your value, and close better sponsorships.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link href="/calculator">
                <Button size="lg" className="text-base px-7 py-6 w-full sm:w-auto">
                  Start Free Calculation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-base px-7 py-6 w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                No credit card required
              </div>
              <div className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-violet-400" />
                60-second setup
              </div>
              <div className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Private by default
              </div>
            </motion.div>
          </div>

          <motion.div variants={fadeInUp}>
            <Card className="border-slate-800 bg-slate-900 transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Rate Snapshot</CardTitle>
                <CardDescription>Example campaign recommendation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 transition-colors duration-200 hover:border-slate-700">
                    <p className="text-xs text-muted-foreground">Platform</p>
                    <p className="text-sm font-medium text-white mt-1">Instagram</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 transition-colors duration-200 hover:border-slate-700">
                    <p className="text-xs text-muted-foreground">Followers</p>
                    <p className="text-sm font-medium text-white mt-1">145,000</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 transition-colors duration-200 hover:border-slate-700">
                    <p className="text-xs text-muted-foreground">Engagement</p>
                    <p className="text-sm font-medium text-white mt-1">4.8%</p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 transition-colors duration-200 hover:border-slate-700">
                    <p className="text-xs text-muted-foreground">Content Type</p>
                    <p className="text-sm font-medium text-white mt-1">Reel + Story Set</p>
                  </div>
                </div>
                <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-4">
                  <p className="text-xs text-violet-300">Recommended range</p>
                  <p className="text-3xl font-bold text-white mt-1">$2,400 – $3,200</p>
                  <p className="text-xs text-violet-200 mt-1">Confidence score: 89%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      <div className="h-16" />

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/35">
                <CardContent className="p-4 md:p-5">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 mb-3 transition-colors duration-200 hover:bg-violet-500/25">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">How RateRight Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A simple system to move from uncertain pricing to confident negotiation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/35">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-1">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-violet-300 border border-slate-700 transition-colors duration-200 hover:bg-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">Step {index + 1}</span>
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Built for Serious Creators</h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Everything you need to price smarter, respond faster, and present professionally.
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline">Compare Plans</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/35">
                  <CardHeader>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300 mb-2 transition-colors duration-200 hover:bg-violet-500/25">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">Trusted by Growing Creators</h2>
            <p className="text-muted-foreground text-lg">Real outcomes from creators using RateRight weekly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {testimonials.map((item) => (
              <Card key={item.author} className="transition-all duration-200 hover:-translate-y-1 hover:border-violet-500/35">
                <CardContent className="p-6">
                  <p className="text-sm leading-relaxed text-slate-200 mb-5">“{item.quote}”</p>
                  <div className="border-t border-slate-800 pt-4">
                    <p className="text-sm font-semibold text-white">{item.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="border-violet-500/30 bg-slate-900 transition-all duration-200 hover:border-violet-400/50">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="mb-4">Start free today</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Turn Pricing Uncertainty Into Predictable Revenue
                </h2>
                <p className="text-muted-foreground text-base md:text-lg mb-6">
                  Join thousands of creators using RateRight to price confidently and scale brand
                  partnerships.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/calculator">
                    <Button size="lg" className="w-full sm:w-auto">
                      Calculate My Rate
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-800 p-4 bg-slate-950 transition-colors duration-200 hover:border-slate-700">
                  <p className="text-xs text-muted-foreground">Avg. response time</p>
                  <p className="text-xl font-bold text-white mt-1">&lt; 2 min</p>
                </div>
                <div className="rounded-lg border border-slate-800 p-4 bg-slate-950 transition-colors duration-200 hover:border-slate-700">
                  <p className="text-xs text-muted-foreground">Export formats</p>
                  <p className="text-xl font-bold text-white mt-1">PDF + CSV</p>
                </div>
                <div className="rounded-lg border border-slate-800 p-4 bg-slate-950 transition-colors duration-200 hover:border-slate-700">
                  <p className="text-xs text-muted-foreground">Plans</p>
                  <p className="text-xl font-bold text-white mt-1">Free / Premium</p>
                </div>
                <div className="rounded-lg border border-slate-800 p-4 bg-slate-950 transition-colors duration-200 hover:border-slate-700">
                  <p className="text-xs text-muted-foreground">Data points</p>
                  <p className="text-xl font-bold text-white mt-1">10K+ deals</p>
                </div>
              </div>
            </div>
          </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}