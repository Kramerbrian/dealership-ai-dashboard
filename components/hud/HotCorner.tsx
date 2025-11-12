'use client';
import { useEffect, useState } from 'react';
import { useHudStore } from '@/lib/store/hud';
import { playSonic } from '@/lib/sound/palette';
import { tap } from '@/lib/sound/haptics';

/**
 * HotCorner - Bottom-right corner hover detector
 * Auto-toggles Pulse Dock when hovering over hot zone (80x80px)
 */
export function HotCorner() {
  const { pulseDockOpen, setPulseDock } = useHudStore();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const threshold = 80; // 80px from bottom-right corner
    let hoverTimeout: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const x = window.innerWidth - e.clientX;
      const y = window.innerHeight - e.clientY;

      const inHotZone = x <= threshold && y <= threshold;

      if (inHotZone && !isHovering) {
        setIsHovering(true);

        // Auto-open Pulse Dock after 300ms hover
        hoverTimeout = setTimeout(() => {
          if (!pulseDockOpen) {
            playSonic('open');
            tap();
            setPulseDock(true);
          }
        }, 300);
      } else if (!inHotZone && isHovering) {
        setIsHovering(false);
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [isHovering, pulseDockOpen, setPulseDock]);

  // Visual indicator (subtle glow)
  return (
    <div
      className="fixed bottom-0 right-0 pointer-events-none z-30 transition-opacity duration-300"
      style={{
        width: '80px',
        height: '80px',
        opacity: isHovering ? 0.3 : 0.08,
        background: 'radial-gradient(circle at bottom right, rgba(6, 182, 212, 0.4), transparent 70%)',
      }}
      aria-hidden="true"
    />
  );
}
