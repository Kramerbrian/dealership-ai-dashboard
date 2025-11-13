'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const steps = ['Website', 'Location', 'Numbers', 'Role'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [storeName, setStoreName] = useState('');
  const [monthlyUsed, setMonthlyUsed] = useState('');
  const [avgGross, setAvgGross] = useState('');
  const [role, setRole] = useState('gm');

  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || '';

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
    else finish();
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function finish() {
    // TODO: send onboarding data to your backend / profile store.
    const qs = new URLSearchParams();
    if (domain) qs.set('domain', domain);
    router.push(qs.toString() ? `/dash?${qs.toString()}` : '/dash');
  }

  return (
    <main className="min-h-dvh bg-neutral-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="text-xs text-white/50 uppercase tracking-[0.16em]">
          Setup
        </div>
        <div className="mt-1 text-sm text-white/70">
          Step {step + 1} of {steps.length} · {steps[step]}
        </div>

        {step === 0 && (
          <section className="mt-5 space-y-3">
            <h1 className="text-xl font-semibold">Confirm your website</h1>
            <p className="text-sm text-white/60">
              We use this to scan how visible you are online.
            </p>
            <input
              className="mt-3 w-full h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
              defaultValue={domain}
              readOnly
            />
          </section>
        )}

        {step === 1 && (
          <section className="mt-5 space-y-3">
            <h1 className="text-xl font-semibold">Where is your dealership located?</h1>
            <p className="text-sm text-white/60">
              This helps us map your local competition.
            </p>
            <input
              placeholder="Store name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-3 w-full h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <div className="flex gap-3">
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-1/2 h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-1/2 h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-5 space-y-3">
            <h1 className="text-xl font-semibold">Help us estimate your revenue risk</h1>
            <p className="text-sm text-white/60">
              These numbers stay private. They help convert visibility into dollars.
            </p>
            <input
              placeholder="Monthly used car sales"
              value={monthlyUsed}
              onChange={(e) => setMonthlyUsed(e.target.value)}
              className="mt-3 w-full h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <input
              placeholder="Average front-end gross"
              value={avgGross}
              onChange={(e) => setAvgGross(e.target.value)}
              className="w-full h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </section>
        )}

        {step === 3 && (
          <section className="mt-5 space-y-3">
            <h1 className="text-xl font-semibold">Who is using this dashboard?</h1>
            <p className="text-sm text-white/60">
              We will adjust views and language based on your role.
            </p>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-3 w-full h-10 rounded-full bg-white/5 border border-white/15 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="dealer_principal">Dealer Principal</option>
              <option value="gm">General Manager</option>
              <option value="used_car_manager">Used Car Manager</option>
              <option value="marketing">Marketing Director</option>
              <option value="internet">Internet Manager</option>
            </select>
          </section>
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="h-9 px-4 rounded-full border border-white/20 text-xs text-white/70 disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="h-9 px-5 rounded-full bg-white text-black text-xs font-medium hover:bg-neutral-100 transition"
          >
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        <p className="mt-4 text-[11px] text-white/40">
          Once you finish, we&apos;ll generate your AI visibility dashboard.
        </p>
      </div>
    </main>
  );
}
