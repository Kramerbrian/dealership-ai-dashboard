"use client";

import { X, Twitter, Linkedin, Facebook, Copy, Check } from "lucide-react";
import { useState } from "react";
import { trackShareUnlock } from "@/lib/plg-utilities";

interface ShareModalProps {
  domain: string;
  onClose: () => void;
}

export default function ShareModal({ domain, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/?domain=${encodeURIComponent(domain)}`;
  const shareText = `Check out my dealership's AI Visibility Score: ${domain}`;

  const handleShare = (platform: string) => {
    trackShareUnlock(domain, platform);

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackShareUnlock(domain, "copy");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Share Your Results</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleShare("twitter")}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <Twitter className="w-5 h-5 text-blue-400" />
            <span>Share on Twitter</span>
          </button>

          <button
            onClick={() => handleShare("linkedin")}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <Linkedin className="w-5 h-5 text-blue-600" />
            <span>Share on LinkedIn</span>
          </button>

          <button
            onClick={() => handleShare("facebook")}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            <Facebook className="w-5 h-5 text-blue-500" />
            <span>Share on Facebook</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

