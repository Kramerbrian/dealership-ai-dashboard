"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { trackAnalyzeStart, decrementAnalyses } from "@/lib/plg-utilities";

interface InstantAnalyzerProps {
  onAnalyze: (domain: string) => void;
  remaining: number;
}

export default function InstantAnalyzer({ onAnalyze, remaining }: InstantAnalyzerProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || remaining <= 0) return;

    setLoading(true);
    trackAnalyzeStart(input.trim());
    
    try {
      await onAnalyze(input.trim());
      decrementAnalyses();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your dealership domain (e.g., toyota-naples.com)"
            className="w-full px-4 py-4 pl-12 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-lg focus:outline-none focus:border-purple-500 transition-colors"
            disabled={loading || remaining <= 0}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
        <button
          type="submit"
          disabled={loading || remaining <= 0 || !input.trim()}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap"
        >
          {loading ? "Analyzing..." : remaining <= 0 ? "No analyses left" : "Analyze Free"}
        </button>
      </div>
      {remaining <= 0 && (
        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
          <a href="/dashboard" className="text-purple-600 dark:text-purple-400 hover:underline">
            Upgrade to Pro
          </a>{" "}
          for unlimited analyses
        </p>
      )}
    </form>
  );
}

