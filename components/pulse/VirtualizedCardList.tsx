'use client';

/**
 * Virtualized Card List for Performance
 * Handles 10,000+ cards efficiently using windowing
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { PulseCard } from '@/lib/types/pulse';

interface VirtualizedCardListProps {
  cards: PulseCard[];
  renderCard: (card: PulseCard, index: number) => React.ReactNode;
  itemHeight?: number;
  overscan?: number;
  className?: string;
}

const DEFAULT_ITEM_HEIGHT = 120; // Approximate card height in pixels
const DEFAULT_OVERSCAN = 5; // Render 5 extra items above/below viewport

export default function VirtualizedCardList({
  cards,
  renderCard,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  className = '',
}: VirtualizedCardListProps) {
  const [containerHeight, setContainerHeight] = useState(800);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Calculate visible range
  const { startIndex, endIndex, totalHeight, offsetY } = useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      cards.length - 1,
      startIndex + visibleCount + overscan * 2
    );

    const totalHeight = cards.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return { startIndex, endIndex, totalHeight, offsetY };
  }, [scrollTop, containerHeight, itemHeight, cards.length, overscan]);

  // Visible cards
  const visibleCards = useMemo(() => {
    return cards.slice(startIndex, endIndex + 1);
  }, [cards, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      {/* Spacer for items above viewport */}
      <div style={{ height: offsetY }} />

      {/* Visible items */}
      <div>
        {visibleCards.map((card, index) => (
          <div key={card.id} style={{ minHeight: itemHeight }}>
            {renderCard(card, startIndex + index)}
          </div>
        ))}
      </div>

      {/* Spacer for items below viewport */}
      <div style={{ height: totalHeight - offsetY - visibleCards.length * itemHeight }} />
    </div>
  );
}

