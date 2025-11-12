"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export default function DynamicCTA({ dealerUrl }: { dealerUrl: string }) {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [ctaText, setCtaText] = useState("Run 3-Second AI Visibility Scan");

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const depth = scrollTop / (documentHeight - windowHeight);
      setScrollDepth(depth);

      // Update CTA text based on scroll depth
      if (depth > 0.8) {
        setCtaText("Still here? Analyze your site.");
      } else if (depth > 0.5) {
        setCtaText("See your AI visibility score");
      } else {
        setCtaText("Run 3-Second AI Visibility Scan");
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky bottom-4 z-50 max-w-md mx-auto"
    >
      <Link
        href={`/dashboard?dealer=${encodeURIComponent(dealerUrl || "demo-dealer")}`}
        className="block px-6 py-4 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        {ctaText}
        <ArrowRight className="w-5 h-5" />
      </Link>
    </motion.div>
  );
}

