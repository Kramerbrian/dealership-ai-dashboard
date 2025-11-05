'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/onboardingModal.module.css';

interface BaselineScore {
  metric: string;
  value: number | string;
  unit?: string;
}

interface Competitor {
  name: string;
  rating?: number;
  reviewCount?: number;
  aiVisibility: number;
  zeroClick: number;
  sentiment: number;
}

interface PLGUpsell {
  id: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  baselines?: BaselineScore[];
  competitors?: Competitor[];
  upsells?: PLGUpsell[];
  title?: string;
  children?: React.ReactNode;
  theme?: 'light' | 'dark';
}

export default function OnboardingModal({
  isOpen,
  onClose,
  baselines = [],
  competitors = [],
  upsells = [],
  title = "Welcome to DealershipAI",
  children,
  theme = 'light',
}: OnboardingModalProps) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(theme);

  useEffect(() => {
    // Auto-detect theme from system preference or data-theme attribute
    const root = document.documentElement;
    const dataTheme = root.getAttribute('data-theme');
    if (dataTheme === 'dark' || dataTheme === 'light') {
      setCurrentTheme(dataTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setCurrentTheme('dark');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        data-theme={currentTheme}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>

        {baselines.length > 0 && (
          <div className={styles.baselines}>
            <h3>Baseline Scores</h3>
            <ul>
              {baselines.map((baseline, idx) => (
                <li key={idx}>
                  <span>{baseline.metric}</span>
                  <strong>
                    {baseline.value}
                    {baseline.unit && ` ${baseline.unit}`}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {competitors.length > 0 && (
          <div className={styles.competitors}>
            <h3>Competitive Landscape</h3>
            <table>
              <thead>
                <tr>
                  <th>Dealership</th>
                  <th>AI Visibility</th>
                  <th>Zero-Click</th>
                  <th>Sentiment</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, idx) => (
                  <tr key={idx}>
                    <td>{comp.name}</td>
                    <td>{comp.aiVisibility}%</td>
                    <td>{comp.zeroClick}%</td>
                    <td>{comp.sentiment}%</td>
                    <td>
                      {comp.rating ? `${comp.rating.toFixed(1)} ⭐` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {upsells.length > 0 && (
          <div className={styles.upsells}>
            <h4>Unlock Premium Features</h4>
            <div className={styles.upsellGrid}>
              {upsells.map((upsell) => (
                <div key={upsell.id} className={styles.upsellCard}>
                  <h5>{upsell.title}</h5>
                  <p>{upsell.description}</p>
                  <button onClick={upsell.onClick}>{upsell.cta}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {children}

        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            onClick={onClose}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Hovercard component for metric explanations
export function Hovercard({ metric, children }: { metric: string; children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={styles.hovercard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <span className={styles.hovercardContent}>
          {/* Metric explanation will be injected here */}
          {metric}
        </span>
      )}
    </span>
  );
}

