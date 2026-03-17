'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import {
  PLATFORMS,
  CONTENT_TYPES,
  NICHES,
  AUDIENCE_LOCATIONS,
  DELIVERABLES,
  USAGE_RIGHTS,
  EXCLUSIVITY,
} from '@/types';
import { formatNumber } from '@/lib/utils';

const calculatorSchema = z.object({
  // Step 1
  platform: z.string().min(1, 'Please select a platform'),
  username: z.string().optional(),
  followerCount: z.number().min(1000, 'Minimum 1,000 followers').max(100000000, 'Invalid follower count'),
  engagementRate: z.number().min(0.1, 'Minimum 0.1%').max(50, 'Maximum 50%'),
  
  // Step 2
  contentType: z.string().min(1, 'Please select a content type'),
  niche: z.string().min(1, 'Please select a niche'),
  audienceLocation: z.string().min(1, 'Please select audience location'),
  
  // Step 3
  deliverables: z.string().min(1, 'Please select deliverables'),
  usageRights: z.string().min(1, 'Please select usage rights'),
  exclusivity: z.string().min(1, 'Please select exclusivity'),
});

type CalculatorForm = z.infer<typeof calculatorSchema>;

const STEPS = [
  { id: 1, title: 'Platform & Basics', description: 'Tell us about your account' },
  { id: 2, title: 'Content Details', description: 'Specify your content type' },
  { id: 3, title: 'Deal Specifics', description: 'Define the sponsorship terms' },
];

export default function CalculatorPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { calculationsRemaining } = useSubscription();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<CalculatorForm>({
    resolver: zodResolver(calculatorSchema),
    mode: 'onChange',
  });

  const formValues = watch();
  const progress = (currentStep / STEPS.length) * 100;

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: (keyof CalculatorForm)[] = [];
    
    if (step === 1) {
      fieldsToValidate.push('platform', 'followerCount', 'engagementRate');
    } else if (step === 2) {
      fieldsToValidate.push('contentType', 'niche', 'audienceLocation');
    } else if (step === 3) {
      fieldsToValidate.push('deliverables', 'usageRights', 'exclusivity');
    }

    return await trigger(fieldsToValidate);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CalculatorForm) => {
    setIsCalculating(true);

    if (isSignedIn) {
      const trackResponse = await fetch('/api/calculations/track', { method: 'POST' });

      if (!trackResponse.ok) {
        const errorPayload = (await trackResponse.json()) as { message?: string };
        setUpgradeMessage(
          errorPayload.message || 'You have reached your free calculation limit. Upgrade to Premium for unlimited access.'
        );
        setShowUpgradeModal(true);
        setIsCalculating(false);
        return;
      }
    }
    
    // Encode calculation data and redirect to results page
    const params = new URLSearchParams({
      platform: data.platform,
      followerCount: data.followerCount.toString(),
      engagementRate: data.engagementRate.toString(),
      contentType: data.contentType,
      niche: data.niche,
      audienceLocation: data.audienceLocation,
      deliverables: data.deliverables,
      usageRights: data.usageRights,
      exclusivity: data.exclusivity,
      ...(data.username && { username: data.username }),
    });

    router.push(`/calculator/results?${params.toString()}`);
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#020617' }}>
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="relative container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.08)] px-4 py-3 text-sm text-slate-300">
            Free plan includes 3 calculations per month. Remaining: <span className="font-semibold">{calculationsRemaining}</span>
          </div>

          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    currentStep === step.id
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                      : currentStep > step.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-600 border border-[rgba(255,255,255,0.05)]'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep > step.id ? 'bg-emerald-500/30' : currentStep === step.id ? 'bg-violet-500/30' : 'bg-slate-700/60'
                    }`}>{currentStep > step.id ? '✓' : step.id}</span>
                    {step.title}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`h-px w-6 ${ currentStep > step.id ? 'bg-emerald-500/40' : 'bg-[rgba(255,255,255,0.06)]' }`} />
                  )}
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div className="h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-slate-500">
                Step {currentStep} of {STEPS.length}: <span className="text-slate-400">{STEPS[currentStep - 1].description}</span>
              </p>
              <p className="text-sm font-medium text-violet-400">{Math.round(progress)}%</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div
              className="rounded-2xl border border-[rgba(124,58,237,0.2)]"
              style={{ background: '#0f172a' }}
            >
              <div className="px-7 pt-7 pb-2">
                <h2 className="text-xl font-bold text-white">{STEPS[currentStep - 1].title}</h2>
                <p className="text-sm text-slate-500 mt-1">{STEPS[currentStep - 1].description}</p>
              </div>
              <div className="px-7 pb-7 pt-5 space-y-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Platform & Basics */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform *</Label>
                        <Select
                          value={formValues.platform}
                          onValueChange={(value: string) => setValue('platform', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLATFORMS.map((platform) => (
                              <SelectItem key={platform} value={platform}>
                                {platform}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.platform && (
                          <p className="text-sm text-destructive">{errors.platform.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Account Username (optional)</Label>
                        <Input
                          id="username"
                          placeholder="@yourusername"
                          {...register('username')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="followerCount">Follower Count *</Label>
                        <Input
                          id="followerCount"
                          type="number"
                          placeholder="50000"
                          {...register('followerCount', { valueAsNumber: true })}
                        />
                        {formValues.followerCount > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(formValues.followerCount)} followers
                          </p>
                        )}
                        {errors.followerCount && (
                          <p className="text-sm text-destructive">{errors.followerCount.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engagementRate">Engagement Rate (%) *</Label>
                        <Input
                          id="engagementRate"
                          type="number"
                          step="0.1"
                          placeholder="4.5"
                          {...register('engagementRate', { valueAsNumber: true })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Tip: Calculate as (Likes + Comments) / Followers × 100
                        </p>
                        {errors.engagementRate && (
                          <p className="text-sm text-destructive">{errors.engagementRate.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Content Details */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="contentType">Content Type *</Label>
                        <Select
                          value={formValues.contentType}
                          onValueChange={(value: string) => setValue('contentType', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.contentType && (
                          <p className="text-sm text-destructive">{errors.contentType.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="niche">Niche/Industry *</Label>
                        <Select
                          value={formValues.niche}
                          onValueChange={(value: string) => setValue('niche', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your niche" />
                          </SelectTrigger>
                          <SelectContent>
                            {NICHES.map((niche) => (
                              <SelectItem key={niche} value={niche}>
                                {niche}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.niche && (
                          <p className="text-sm text-destructive">{errors.niche.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="audienceLocation">Primary Audience Location *</Label>
                        <Select
                          value={formValues.audienceLocation}
                          onValueChange={(value: string) => setValue('audienceLocation', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience location" />
                          </SelectTrigger>
                          <SelectContent>
                            {AUDIENCE_LOCATIONS.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.audienceLocation && (
                          <p className="text-sm text-destructive">{errors.audienceLocation.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Deal Specifics */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={false}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="deliverables">Deliverables *</Label>
                        <Select
                          value={formValues.deliverables}
                          onValueChange={(value: string) => setValue('deliverables', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select deliverables" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERABLES.map((deliverable) => (
                              <SelectItem key={deliverable} value={deliverable}>
                                {deliverable}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.deliverables && (
                          <p className="text-sm text-destructive">{errors.deliverables.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="usageRights">Usage Rights *</Label>
                        <Select
                          value={formValues.usageRights}
                          onValueChange={(value: string) => setValue('usageRights', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select usage rights" />
                          </SelectTrigger>
                          <SelectContent>
                            {USAGE_RIGHTS.map((rights) => (
                              <SelectItem key={rights.value} value={rights.value}>
                                {rights.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Usage rights affect how brands can use your content
                        </p>
                        {errors.usageRights && (
                          <p className="text-sm text-destructive">{errors.usageRights.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exclusivity">Exclusivity *</Label>
                        <Select
                          value={formValues.exclusivity}
                          onValueChange={(value: string) => setValue('exclusivity', value, { shouldValidate: true })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exclusivity" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXCLUSIVITY.map((excl) => (
                              <SelectItem key={excl.value} value={excl.value}>
                                {excl.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Exclusivity prevents working with competing brands
                        </p>
                        {errors.exclusivity && (
                          <p className="text-sm text-destructive">{errors.exclusivity.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-400 rounded-xl border border-[rgba(255,255,255,0.08)] hover:border-[rgba(124,58,237,0.4)] hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors duration-200"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors duration-200 disabled:opacity-70"
                >
                  <span>{isCalculating ? 'Calculating...' : 'Calculate My Rate'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md" style={{ background: 'rgba(13,18,35,0.97)', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(20px)' }}>
          <DialogHeader>
            <DialogTitle className="text-white">Calculation limit reached</DialogTitle>
            <DialogDescription>{upgradeMessage}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-slate-300">
              Upgrade to Premium to unlock unlimited calculations, detailed breakdowns, and downloadable rate cards.
            </div>
            <Link href="/pricing">
              <Button className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
