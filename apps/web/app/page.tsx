'use client';

import dynamicImport from 'next/dynamic';

// Disable SSR for landing analyzer to avoid build issues
const LandingAnalyzer = dynamicImport(() => import('@/components/landing/LandingAnalyzer'), {
  ssr: false,
});

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-white">
      <section className="mx-auto max-w-5xl px-6 pt-16">
        <h1 className="text-4xl md:text-5xl font-semibold">
          Every decision changes how AI sees your dealership.
        </h1>
        <p className="mt-3 text-sm text-white/60 max-w-xl">
          See how you show up across search, AI answers, and local visibility before you even log in.
        </p>
      </section>

      <LandingAnalyzer />
    </main>
  );
}
