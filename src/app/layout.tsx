import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { NavHeader } from '@/components/NavHeader';
import Script from 'next/script';
import { StructuredData } from '@/components/StructuredData';
import { HotToaster } from '@/components/shared/HotToaster';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rateright.com'),
  title: {
    default: 'RateRight - Sponsorship Rate Calculator for Influencers',
    template: '%s | RateRight',
  },
  description:
    'Calculate fair sponsorship rates instantly. Access real data from 10,000+ creator deals. Stop undercharging brands and earn what you deserve.',
  keywords: [
    'influencer rates',
    'sponsorship calculator',
    'instagram rates',
    'youtube sponsorship',
    'content creator pricing',
    'brand deal rates',
    'creator economy',
    'rate card generator',
  ],
  authors: [{ name: 'RateRight Team' }],
  creator: 'RateRight',
  publisher: 'RateRight',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://rateright.com',
    title: 'RateRight - Sponsorship Rate Calculator for Influencers',
    description: 'Calculate fair sponsorship rates in seconds. Stop undercharging brands.',
    siteName: 'RateRight',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RateRight - Sponsorship Rate Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RateRight - Know Your Worth',
    description: 'Calculate fair sponsorship rates based on real creator data.',
    images: ['/og-image.png'],
    creator: '@rateright',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkEnabled =
    typeof publishableKey === 'string' &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('your_key_here') &&
    !publishableKey.includes('...');

  const { userId } = await getOptionalAuth();
  const isSignedIn = Boolean(userId);
  let isAdmin = false;

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      });
      isAdmin = user?.role === 'ADMIN';
    } catch {
      isAdmin = false;
    }
  }

  if (!clerkEnabled) {
    return (
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <StructuredData />
          {process.env.NEXT_PUBLIC_GA_ID ? (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
              </Script>
            </>
          ) : null}
          <NavHeader authEnabled={false} signedIn={false} isAdmin={false} />
          {children}
          <HotToaster />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
          <StructuredData />
          {process.env.NEXT_PUBLIC_GA_ID ? (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
              </Script>
            </>
          ) : null}
          <NavHeader authEnabled signedIn={isSignedIn} isAdmin={isAdmin} />
          {children}
          <HotToaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
