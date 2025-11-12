'use client';

import { useEffect, useRef } from 'react';
import { useHudStore } from '@/lib/store/hud';

export default function HotCorner() {
  const { setPulseOpen } = useHudStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const onEnter = () => setPulseOpen(true);
    el.addEventListener('mouseenter', onEnter);
    
    return () => el.removeEventListener('mouseenter', onEnter);
  }, [setPulseOpen]);

  // Invisible hover target at bottom-right
  return (
    <div
      ref={ref}
      className="fixed bottom-0 right-0 z-30"
      style={{ width: 60, height: 60 }}
      aria-hidden="true"
    />
  );
}

