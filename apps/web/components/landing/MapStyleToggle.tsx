'use client';

type MapStyleToggleProps = {
  mode: 'night' | 'day';
  onToggle: (mode: 'night' | 'day') => void;
};

export function MapStyleToggle({ mode, onToggle }: MapStyleToggleProps) {
  return (
    <div className="inline-flex rounded-full border border-white/20 bg-black/40 text-xs text-white/70 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle('night')}
        className={`px-3 py-1 transition-colors ${
          mode === 'night' ? 'bg-white text-black' : 'hover:bg-white/10'
        }`}
      >
        Night
      </button>
      <button
        type="button"
        onClick={() => onToggle('day')}
        className={`px-3 py-1 transition-colors ${
          mode === 'day' ? 'bg-white text-black' : 'hover:bg-white/10'
        }`}
      >
        Day
      </button>
    </div>
  );
}

