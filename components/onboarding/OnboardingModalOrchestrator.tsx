'use client';

import React, { useState, useEffect } from 'react';
import { useDealerTheme } from '@/lib/utils/theme';
import PLGUpsellCard from './PLGUpsellCard';
import Hovercard from '../ui/Hovercard';
import styles from '../../styles/onboardingModal.module.css';

interface DealerProfile {
  id: string;
  name: string;
  dma?: string;
}

interface BaselineScores {
  AIV: number;
  ATI: number;
  CVI: number;
  ORI: number;
  GRI: number;
  DPI: number;
}

interface Competitor {
  id: string;
  name: string;
  AIV: number;
  ATI: number;
  CVI: number;
  DPI: number;
}

interface PLGUpsell {
  id: string;
  title: string;
  offer_text: string;
  cta: string;
  api: string;
}

interface OnboardingModalProps {
  user: { id: string; name?: string } | null;
  onClose: () => void;
}

export default function OnboardingModal({ user, onClose }: OnboardingModalProps) {
  const [stage, setStage] = useState<'loading' | 'ready' | 'error'>('loading');
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [baseline, setBaseline] = useState<BaselineScores | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [personalizedUpsells, setPersonalizedUpsells] = useState<PLGUpsell[]>([]);

  // Fetch dealer theme
  const { theme, loading: themeLoading } = useDealerTheme(user?.id || null);

  useEffect(() => {
    async function init() {
      if (!user) return;

      try {
        // Fetch dealer profile
        const profileRes = await fetch(`/api/v1/dealer/${user.id}/profile`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setDealerProfile(profile);
        } else {
          // Fallback profile
          setDealerProfile({ id: user.id, name: user.name || 'Dealer' });
        }

        // Fetch baseline scores (with DMA if available)
        const dma = dealerProfile?.dma || 'default';
        const baseRes = await fetch(`/api/v1/benchmarks/init?dma=${dma}`);
        if (baseRes.ok) {
          const base = await baseRes.json();
          setBaseline(base);
        } else {
          // Fallback baseline
          setBaseline({
            AIV: 60,
            ATI: 65,
            CVI: 58,
            ORI: 70,
            GRI: 62,
            DPI: 63,
          });
        }

        // Fetch competitors
        const compRes = await fetch(`/api/v1/competitive?dma=${dma}&count=5`);
        if (compRes.ok) {
          const comp = await compRes.json();
          setCompetitors(comp);
        }

        // Fetch personalized upsells
        const upsellRes = await fetch(`/api/v1/upsells/recommend?dealer=${user.id}`);
        if (upsellRes.ok) {
          const upsells = await upsellRes.json();
          setPersonalizedUpsells(upsells);
        }

        setStage('ready');
      } catch (err) {
        console.error('Onboarding error:', err);
        setStage('error');
      }
    }

    init();
  }, [user, dealerProfile?.dma]);

  // Apply theme to document
  useEffect(() => {
    if (user?.id && !themeLoading) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.palette.primary);
      root.style.setProperty('--theme-accent', theme.palette.accent);
      root.style.setProperty('--theme-light', theme.palette.light);
      root.style.setProperty('--theme-dark', theme.palette.dark);
      
      if (theme.mode === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else if (theme.mode === 'light') {
        root.setAttribute('data-theme', 'light');
      }
    }
  }, [theme, themeLoading, user?.id]);

  if (stage === 'loading') {
    return (
      <div className={styles.modal}>
        <h3>Initializing your DealershipAI dashboard...</h3>
        <p>Setting baselines and gathering local competitor data.</p>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className={`${styles.modal} error`}>
        <h3>Something went wrong</h3>
        <p>We couldn't complete setup. Please retry or contact support.</p>
      </div>
    );
  }

  return (
    <div className={styles.modal} data-theme={theme.mode === 'dark' ? 'dark' : 'light'}>
      <h2>Welcome to DealershipAI, {dealerProfile?.name || 'Dealer'}!</h2>

      <div className={styles.baselines}>
        <h4>Your Baseline Scores</h4>
        <ul>
          {baseline &&
            Object.entries(baseline).map(([key, value]) => (
              <li key={key}>
                <strong>{key}</strong>: {value} <Hovercard metric={key as any} />
              </li>
            ))}
        </ul>
      </div>

      <div className={styles.competitors}>
        <h4>Local Competitors {dealerProfile?.dma && `(DMA: ${dealerProfile.dma})`}</h4>
        <table>
          <thead>
            <tr>
              <th>Dealer</th>
              <th>AIV</th>
              <th>ATI</th>
              <th>CVI</th>
              <th>DPI</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.AIV}</td>
                <td>{c.ATI}</td>
                <td>{c.CVI}</td>
                <td>{c.DPI}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.upsells}>
        <h4>Personalized Recommendations</h4>
        <div className={styles.upsellGrid}>
          {personalizedUpsells.map((u) => (
            <PLGUpsellCard key={u.id} {...u} />
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={onClose}>
          Launch Dashboard
        </button>
      </div>
    </div>
  );
}


