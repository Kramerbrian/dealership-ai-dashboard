"use client";

import dynamicImport from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// Dynamic imports to avoid SSR issues
const FOMOTimer = dynamicImport(() => import("@/components/plg/FOMOTimer"), { ssr: false });
const ProgressiveBlur = dynamicImport(() => import("@/components/plg/ProgressiveBlur"), { ssr: false });

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import LetterFadeText from "@/components/LetterFadeText";
import { TimelineRail } from "@/components/TimelineRail";
import ThemeToggle from "@/components/ThemeToggle";
import TOKENS from "@/design/tokens";
import { GRADIENTS, GRADIENT_SHADOWS } from "@/design/gradients";

export default function Landing() {
  const { isSignedIn } = useUser();
  const [scrollDepth, setScrollDepth] = useState(0);
  const [ctaText, setCtaText] = useState("Define My Signals");
  const ctaHref = isSignedIn ? "/dashboard" : "/sign-in?redirect_url=/onboarding";

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const depth = scrollTop / (documentHeight - windowHeight);
      setScrollDepth(depth);

      if (depth > 0.8) {
        setCtaText("Still here? Analyze your site.");
      } else if (depth > 0.5) {
        setCtaText("See your AI visibility score");
      } else {
        setCtaText("Define My Signals");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(90%_60%_at_50%_-10%,#0b1220,transparent),linear-gradient(#0a0f1a,#05070c)] text-white">
      <FOMOTimer />
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <LogoClay />
        <nav className="hidden md:flex gap-6 text-sm text-white/70">
          <a href="#why" className="hover:text-white">Why</a>
          <a href="#how" className="hover:text-white">How</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-white/90 text-[#0a0f1a] hover:bg-white transition-colors"
          >
            {isSignedIn ? "Open Dashboard" : "Start"}
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <ClayHeroCard ctaText={ctaText} ctaHref={ctaHref} />
      </section>

      <section id="why" className="mx-auto max-w-6xl px-6 pb-24">
        <FeatureRow />
      </section>
    </main>
  );
}

function ClayHeroCard({ ctaText, ctaHref }: { ctaText: string; ctaHref: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[28px] p-10 md:p-14 backdrop-blur-xl bg-white/[0.06] border border-white/10 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5),0_2px_0_0_rgba(255,255,255,0.06)_inset]"
    >
      <TimelineRail />
      <Badge>Clay UI • GEO-ready</Badge>

      <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
        <LetterFadeText text="Every decision impacts your visibility to AI search." />
        <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#66d1ff] to-[#8ef0df]">
          <LetterFadeText text="Let's define yours." />
        </span>
      </h1>

      <p className="mt-5 text-white/70 max-w-2xl">
        Invisible online? That's cute—if it were 1998. dealershipAI reveals how discoverable, trusted, and visible your dealership really is — across Google, ChatGPT, Perplexity, and every surface that now decides who wins the click.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <PrimaryCTA href={ctaHref}>{ctaText}</PrimaryCTA>
        <ProgressiveBlur>
          <GhostCTA href="#how">See How It Works</GhostCTA>
        </ProgressiveBlur>
      </div>

      <ClayKPIChips />
    </motion.div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs bg-white/[0.08] border border-white/10">
      <span className="size-1.5 rounded-full bg-[#66d1ff]" />
      {children}
    </div>
  );
}

function PrimaryCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`h-12 px-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r ${GRADIENTS.primary} text-white ${GRADIENT_SHADOWS.primary} transition-all`}
    >
      {children}
    </Link>
  );
}

function GhostCTA({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="h-12 px-6 inline-flex items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 text-white/90 hover:bg-white/[0.09] transition-colors"
    >
      {children}
    </Link>
  );
}

function ClayKPIChips() {
  const chips = [
    { label: "Clarity", value: "74" },
    { label: "Trust (ATI)", value: "68" },
    { label: "GEO Coverage", value: "61%" },
    { label: "Revenue at Risk", value: "$14.7k/mo" },
  ];
  return (
    <div className="mt-10 flex flex-wrap gap-3">
      {chips.map((c) => (
        <div
          key={c.label}
          className="px-4 h-10 inline-flex items-center rounded-2xl bg-white/[0.06] border border-white/10 text-white/80"
          aria-label={`${c.label} ${c.value}`}
        >
          <span className="text-white/60 mr-2">{c.label}</span>
          <span className="font-semibold">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

function LogoClay() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="size-7 rounded-xl bg-white/[0.14] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center">
        <span className="text-xs font-bold tracking-tight">ai</span>
      </div>
      <span className="font-medium text-white/90">dealership</span>
    </div>
  );
}

function FeatureRow() {
  const items = [
    { h: "Zero-Click Visibility", p: "GEO + AEO + SEO coverage that AI can cite." },
    { h: "Trust Signals", p: "ATI, listings integrity, schema health, real reviews." },
    { h: "Pulse Fixes", p: "One-tap repairs for issues costing money today." },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {items.map((x) => (
        <div
          key={x.h}
          className="rounded-[24px] p-6 bg-white/[0.06] border border-white/10 backdrop-blur shadow-[0_10px_28px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <h3 className="text-lg font-semibold">{x.h}</h3>
          <p className="mt-2 text-sm text-white/70">{x.p}</p>
        </div>
      ))}
    </div>
  );
}

