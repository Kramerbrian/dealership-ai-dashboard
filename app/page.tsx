'use client';

import { LandingAnalyzer } from '@/components/landing/LandingAnalyzer';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Every decision changes how AI sees your dealership.
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-xl mx-auto">
            See how you show up across Google, AI search, and generative answers before you even log in.
          </p>
        </motion.div>
      </section>

      {/* Landing Analyzer - Master PLG Component */}
      <LandingAnalyzer />
    </main>
  );
}
