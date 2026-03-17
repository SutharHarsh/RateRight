import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled =
    typeof publishableKey === 'string' &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('your_key_here') &&
    !publishableKey.includes('...');

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#020617' }}>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center transition-colors duration-200 group-hover:bg-violet-500">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-2xl text-white">
              RateRight
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {!clerkEnabled ? (
          <div
            className="rounded-2xl border border-[rgba(124,58,237,0.3)] p-8 text-center"
            style={{
              background: '#0f172a',
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Authentication not configured</h2>
            <p className="text-slate-500 text-sm">
              Set real Clerk keys in your environment file to enable login.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl border border-[rgba(124,58,237,0.25)]"
            style={{
              background: '#0f172a',
            }}
          >
            <div className="p-1">
              <SignIn
                appearance={{
                  variables: {
                    colorBackground: 'transparent',
                    colorText: '#e2e8f0',
                    colorTextSecondary: '#64748b',
                    colorInputBackground: 'rgba(255,255,255,0.04)',
                    colorInputText: '#e2e8f0',
                    colorPrimary: '#7c3aed',
                    borderRadius: '12px',
                  },
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none bg-transparent border-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 'border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] text-slate-300 transition-all',
                    formFieldInput: 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-slate-200 focus:border-violet-500/50 focus:ring-violet-500/20',
                    formButtonPrimary: 'bg-violet-600 hover:bg-violet-500',
                    footerActionLink: 'text-violet-400 hover:text-violet-300',
                    dividerLine: 'bg-[rgba(255,255,255,0.06)]',
                    dividerText: 'text-slate-600',
                  },
                }}
                routing="hash"
                signUpUrl="/signup"
                afterSignInUrl="/calculator"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

