import Link from 'next/link';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#050b16]">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          <div>
            <Logo withLink size="md" />
            <p className="mt-4 text-sm text-slate-400 leading-7">
              Made for creators, by creators.
            </p>
            <div className="mt-5 flex items-center gap-3 text-slate-400">
              <a href="#" aria-label="RateRight on Twitter" className="hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="RateRight on LinkedIn" className="hover:text-white transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="RateRight on Instagram" className="hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/calculator" className="hover:text-white transition-colors">Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Resources</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8">
          <p className="text-center text-sm text-slate-400">
            © 2024 RateRight. All rights reserved. Made for creators, by creators.
          </p>
        </div>
      </div>
    </footer>
  );
}
