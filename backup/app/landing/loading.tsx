import { Loader2, Sparkles } from 'lucide-react';

export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center" role="status" aria-live="polite">
        <div className="relative inline-block mb-6">
          <Sparkles
            className="w-12 h-12 text-blue-400 animate-pulse"
            aria-hidden="true"
          />
          <Loader2
            className="w-12 h-12 animate-spin text-purple-400 absolute inset-0"
            aria-hidden="true"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          Loading DealershipAI...
        </h2>
        <p className="text-sm text-gray-400">
          Preparing your AI-powered analytics experience
        </p>
        <span className="sr-only">Loading, please wait</span>
      </div>
    </div>
  );
}
