/**
 * PLG Utilities for DealershipAI
 * Session tracking, decay tax, and growth mechanics
 */

import { useState, useEffect } from 'react';

export function useSessionTracking() {
  const [sessions, setSessions] = useState(0);
  const [decayTax, setDecayTax] = useState(0);

  useEffect(() => {
    // Get session count from localStorage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('dai_sessions') : null;
    const count = stored ? parseInt(stored, 10) : 0;
    
    // Calculate decay tax based on time since last audit
    const lastAudit = typeof window !== 'undefined' ? localStorage.getItem('dai_last_audit') : null;
    if (lastAudit) {
      const daysSince = Math.floor((Date.now() - parseInt(lastAudit, 10)) / (1000 * 60 * 60 * 24));
      const tax = Math.min(daysSince * 0.5, 10); // Max 10 points decay
      setDecayTax(tax);
    }

    setSessions(count);
  }, []);

  const incrementSession = () => {
    const newCount = sessions + 1;
    setSessions(newCount);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dai_sessions', newCount.toString());
      localStorage.setItem('dai_last_audit', Date.now().toString());
    }
  };

  return { sessions, decayTax, incrementSession };
}
