'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PersonaData {
  role: 'owner' | 'gm' | 'used_car_dir' | 'visitor';
  geoBand: 'local' | 'regional' | 'national';
  city?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  referrer: 'direct' | 'linkedin' | 'google' | 'other';
  lastMode?: 'triage' | 'insights' | 'autopilot';
  hueSeed: number;
}

const PersonaContext = createContext<PersonaData | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<PersonaData>(() => inferPersona());

  useEffect(() => {
    // Update time of day every 30 minutes
    const interval = setInterval(() => {
      setPersona(prev => ({ ...prev, timeOfDay: getTimeOfDay() }));
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PersonaContext.Provider value={persona}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}

function inferPersona(): PersonaData {
  const role = inferRole();
  const geoBand = inferGeoBand();
  const city = inferCity();
  const timeOfDay = getTimeOfDay();
  const referrer = getReferrer();
  const lastMode = getLastMode();
  const hueSeed = generateHueSeed();

  return {
    role,
    geoBand,
    city,
    timeOfDay,
    referrer,
    lastMode,
    hueSeed
  };
}

function inferRole(): PersonaData['role'] {
  if (typeof window === 'undefined') return 'visitor';

  const stored = localStorage.getItem('dealershipai_role');
  if (stored && ['owner', 'gm', 'used_car_dir', 'visitor'].includes(stored)) {
    return stored as PersonaData['role'];
  }

  // Infer from URL params or referrer
  const params = new URLSearchParams(window.location.search);
  const roleParam = params.get('role');
  if (roleParam === 'owner') return 'owner';
  if (roleParam === 'gm') return 'gm';
  if (roleParam === 'ucd' || roleParam === 'used_car_dir') return 'used_car_dir';

  // Check referrer for LinkedIn (more likely to be decision-makers)
  if (document.referrer.includes('linkedin.com')) {
    return 'owner'; // Assume LinkedIn traffic is owner/GM level
  }

  return 'visitor';
}

function inferGeoBand(): PersonaData['geoBand'] {
  if (typeof window === 'undefined') return 'national';

  const stored = localStorage.getItem('dealershipai_geo');
  if (stored && ['local', 'regional', 'national'].includes(stored)) {
    return stored as PersonaData['geoBand'];
  }

  // Could integrate with IP geolocation service in production
  return 'national';
}

function inferCity(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const stored = localStorage.getItem('dealershipai_city');
  if (stored) return stored;

  // Could integrate with IP geolocation service
  return undefined;
}

function getTimeOfDay(): PersonaData['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getReferrer(): PersonaData['referrer'] {
  if (typeof window === 'undefined') return 'direct';

  const ref = document.referrer.toLowerCase();
  if (!ref) return 'direct';
  if (ref.includes('linkedin.com')) return 'linkedin';
  if (ref.includes('google.com')) return 'google';
  return 'other';
}

function getLastMode(): PersonaData['lastMode'] {
  if (typeof window === 'undefined') return undefined;

  const stored = localStorage.getItem('dealershipai_last_mode');
  if (stored && ['triage', 'insights', 'autopilot'].includes(stored)) {
    return stored as PersonaData['lastMode'];
  }
  return undefined;
}

function generateHueSeed(): number {
  if (typeof window === 'undefined') return 210;

  // Generate a consistent hue based on session
  let seed = parseInt(localStorage.getItem('dealershipai_hue_seed') || '0');
  if (!seed) {
    // Generate random hue between 180-270 (blue-purple range)
    seed = Math.floor(Math.random() * 90) + 180;
    localStorage.setItem('dealershipai_hue_seed', seed.toString());
  }
  return seed;
}

// Helper to update persona data
export function updatePersona(updates: Partial<PersonaData>) {
  if (typeof window === 'undefined') return;

  if (updates.role) localStorage.setItem('dealershipai_role', updates.role);
  if (updates.geoBand) localStorage.setItem('dealershipai_geo', updates.geoBand);
  if (updates.city) localStorage.setItem('dealershipai_city', updates.city);
  if (updates.lastMode) localStorage.setItem('dealershipai_last_mode', updates.lastMode);
}
