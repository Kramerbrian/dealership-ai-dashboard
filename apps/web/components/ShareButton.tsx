'use client';
import { useState } from 'react';
import { ga } from '@/lib/ga';

interface ShareButtonProps {
  snapshot: any;
  className?: string;
}

export default function ShareButton({ snapshot, className = '' }: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (!snapshot) return;
    
    setIsSharing(true);
    
    try {
      // Create shareable report
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snapshot })
      });

      if (!response.ok) {
        throw new Error('Failed to create shareable report');
      }

      const { url } = await response.json();
      const fullUrl = `${window.location.origin}${url}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(fullUrl);
      
      // Track the share event
      ga('share_created', { url });
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
      
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: show error notification
      window.dispatchEvent(new CustomEvent('show-notification', {
        detail: {
          type: 'error',
          title: 'Share Failed',
          message: 'Failed to create shareable report. Please try again.',
          duration: 5000
        }
      }));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`inline-flex items-center gap-2 h-11 px-4 rounded-xl border hover:bg-gray-50 ${className}`}
    >
      {isSharing ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          Creating...
        </>
      ) : isCopied ? (
        <>
          <span>✅</span>
          Copied to clipboard!
        </>
      ) : (
        <>
          <span>🔗</span>
          Share public report
        </>
      )}
    </button>
  );
}
