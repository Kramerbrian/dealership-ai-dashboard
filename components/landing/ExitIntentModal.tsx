'use client';

import { useState, useEffect } from 'react';
import { X, Download, ArrowRight } from 'lucide-react';

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen the modal
    const hasSeenModal = localStorage.getItem('exit-intent-shown');
    if (hasSeenModal) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving towards the top of the page
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        localStorage.setItem('exit-intent-shown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDownloadSample = () => {
    // Track download event
    console.log('Sample report download clicked');
    // In production, this would trigger actual download
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Wait! Get a Sample Report
          </h2>
          
          <p className="text-gray-600 mb-6">
            See exactly what insights you'll get before running your own scan. 
            No signup required.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleDownloadSample}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Sample Report PDF
            </button>
            
            <button
              onClick={handleClose}
              className="w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              No thanks, continue browsing
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Sample report shows Honda of Los Angeles AIV analysis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
