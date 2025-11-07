'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {SignedIn, SignedOut, SignInButton, UserButton} from '@clerk/nextjs';

const seoLd = {
  software: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DealershipAI',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '847'
    }
  }),
  faq: JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I check AI visibility?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use DealershipAI\'s free analyzer for instant results.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is AEO?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Optimizing for AI search engines like ChatGPT and Claude.'
        }
      }
    ]
  })
};

export default function Landing() {
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  
  async function runAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!domain) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/analyze?domain=${encodeURIComponent(domain)}`, {cache: 'no-store'});
      const payload = await res.json();
      sessionStorage.setItem('dai:analyzer', JSON.stringify(payload));
      router.push('/onboarding');
    } finally {
      setBusy(false);
    }
  }
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: seoLd.software}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: seoLd.faq}} />
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white" />
          <span className="font-medium">dealershipAI</span>
        </div>
        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-full bg-white text-black">Login</button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-6xl font-light tracking-tight">Are you invisible to AI?</h1>
        <p className="mt-4 text-white/70">When ChatGPT doesn't know your dealership, you leak <b>$43K/month</b>.</p>
        <form onSubmit={runAnalyze} className="mt-8 flex gap-3 max-w-2xl mx-auto">
          <input
            value={domain}
            onChange={e => setDomain(e.target.value)}
            placeholder="terryreidhyundai.com"
            className="flex-1 px-5 py-4 rounded-lg bg-white/5 border border-white/10"
          />
          <button disabled={busy} className="px-6 py-4 rounded-lg bg-white text-black font-medium">
            {busy ? 'Analyzing…' : 'Analyze Free'}
          </button>
        </form>
        <div className="mt-6 text-sm text-white/50">
          ✓ Scans ChatGPT, Perplexity, Gemini, Copilot • ✓ $ at risk • ✓ Auto-fix
        </div>
      </main>
    </>
  );
}

