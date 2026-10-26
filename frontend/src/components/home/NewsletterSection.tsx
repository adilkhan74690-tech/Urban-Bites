import React, { useState } from 'react';
import { Mail, CheckCircle2, Copy, Sparkles, AlertCircle } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('URBAN15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-16 bg-cream-100 border-t border-warmgray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-charcoal-700">
          {/* Subtle ambient light */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive Member Perk</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Get 15% Off Your First Order
            </h2>

            <p className="text-sm text-warmgray-300 max-w-lg mx-auto">
              Subscribe to the Urban Bites Gazette for secret seasonal chef specials, chef's table tasting invites, and instant welcome promo perks.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-warmgray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 rounded-full bg-charcoal-950/80 border border-charcoal-700 text-white text-sm placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-md hover:shadow-warm transition-all shrink-0"
                  >
                    Claim 15% Off
                  </button>
                </div>
                {error && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mt-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </div>
                )}
                <p className="text-[11px] text-warmgray-400 mt-2">
                  No spam ever. Unsubscribe at any time with a single click.
                </p>
              </form>
            ) : (
              <div className="pt-4 p-6 rounded-2xl bg-charcoal-950/80 border border-brand-500/40 text-center animate-fadeIn space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Welcome to Urban Bites Club!</span>
                </div>
                <p className="text-xs text-warmgray-300">
                  Here is your 15% discount code for your first online order or reservation:
                </p>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-charcoal-900 border border-brand-500/50">
                  <span className="font-mono text-base font-extrabold text-brand-400 tracking-wider">
                    URBAN15
                  </span>
                  <button
                    onClick={handleCopyCode}
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
