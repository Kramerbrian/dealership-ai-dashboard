"use client";

import React, { useState } from 'react';
import { useOnboarding } from '@/lib/store';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Share2, Zap } from 'lucide-react';
import Link from 'next/link';

function StepShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function Onboarding() {
  const s = useOnboarding();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-black">DealershipAI · Onboarding</div>
          <Link href="/" className="text-blue-600">Back</Link>
        </header>

        {s.step === 1 && (
          <StepShell title="Step 1 · Your dealership URL">
            <p className="text-gray-600 mb-3">
              Paste your website. We run a 3-second AI visibility + zero-click scan and build your starter plan.
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-4 py-3"
                placeholder="https://yourdealership.com"
                value={s.dealerUrl}
                onChange={e => s.setUrl(e.target.value)}
              />
              <button
                onClick={() => {
                  s.decScan();
                  s.setStep(2);
                }}
                disabled={!s.dealerUrl}
                className="px-5 py-3 rounded-xl bg-blue-600 text-white flex items-center gap-2 disabled:opacity-40"
              >
                <Zap className="w-4 h-4" />
                Scan
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">Free scans left: {s.scansLeft}</div>
          </StepShell>
        )}

        {s.step === 2 && (
          <StepShell title="Step 2 · Unlock full report">
            <p className="text-gray-600 mb-3">
              Share your score to unlock the full details or enter email to receive the PDF.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={() => s.setStep(3)}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl flex items-center gap-2 justify-center"
              >
                <Share2 className="w-4 h-4" />
                Share to unlock
              </button>
              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-xl px-4 py-3"
                  placeholder="you@dealership.com"
                  value={s.email}
                  onChange={e => s.setEmail(e.target.value)}
                />
                <button
                  onClick={() => s.setStep(3)}
                  className="px-5 py-3 border rounded-xl"
                >
                  Email me
                </button>
              </div>
            </div>
          </StepShell>
        )}

        {s.step === 3 && (
          <StepShell title="Step 3 · Pick 3–5 competitors (optional)">
            <div className="grid grid-cols-2 gap-3">
              {['Naples Honda', 'Terry Reid Hyundai', 'Germain Toyota of Naples', 'Crown Nissan', 'Classic Honda'].map(name => (
                <label
                  key={name}
                  className={`px-4 py-3 rounded-xl border cursor-pointer ${
                    s.competitors.includes(name)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={s.competitors.includes(name)}
                    onChange={() => s.toggleCompetitor(name)}
                  />
                  {name}
                </label>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => s.setStep(4)}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </StepShell>
        )}

        {s.step === 4 && (
          <StepShell title="Step 4 · Business Metrics (PVR)">
            <p className="text-gray-600 mb-4">
              Help us personalize your dashboard by providing your monthly PVR (Parts, Vehicle, Repair) revenue and advertising expense.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly PVR Revenue ($)
                </label>
                <input
                  type="number"
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="e.g., 500000"
                  value={s.pvr || ''}
                  onChange={e => s.setPvr?.(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total monthly revenue from Parts, Vehicle sales, and Repair services
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Ad Expense PVR ($)
                </label>
                <input
                  type="number"
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="e.g., 50000"
                  value={s.adExpensePvr || ''}
                  onChange={e => s.setAdExpensePvr?.(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Monthly advertising spend across all channels
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={async () => {
                  // Save metrics to API
                  if (s.pvr && s.adExpensePvr) {
                    try {
                      const response = await fetch('/api/save-metrics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          pvr: Number(s.pvr),
                          adExpensePvr: Number(s.adExpensePvr),
                        }),
                      })

                      const data = await response.json()

                      if (!response.ok || !data.ok) {
                        throw new Error(data.error || 'Failed to save metrics')
                      }

                      // Success - proceed to next step
                      s.setStep(5)
                    } catch (error: any) {
                      console.error('Failed to save metrics:', error)
                      // Show error but allow user to continue
                      alert(`Failed to save metrics: ${error.message}. You can continue, but metrics won't be saved.`)
                      s.setStep(5)
                    }
                  } else {
                    s.setStep(5)
                  }
                }}
                disabled={!s.pvr || !s.adExpensePvr}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-40"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </StepShell>
        )}

        {s.step === 5 && (
          <StepShell title="Step 5 · Complete">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <Check className="w-5 h-5" />
              <span>Your metrics have been saved. Ready to launch the orchestrator?</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-900">
                You'll experience a cinematic onboarding sequence: System Acknowledgment → Orchestrator Ready → Pulse Assimilation → Dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/preview"
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl flex items-center gap-2"
              >
                Launch Orchestrator
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/dashboard?dealer=${encodeURIComponent(s.dealerUrl || 'demo')}`}
                className="px-5 py-3 border rounded-xl"
              >
                Skip to Dashboard
              </Link>
            </div>
          </StepShell>
        )}
      </div>
    </main>
  );
}

