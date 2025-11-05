"use client";
import { useEffect, useState } from 'react';

export default function MemoryCoach() {
  const [tips, setTips] = useState<string[]>([]);
  
  useEffect(() => { 
    setTips([
      'Schema improved last session — ready to tackle FAQ?',
      'Competitor gained 5pts yesterday — review the battle plan?',
    ]); 
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-xl bg-white/10 border border-white/20 text-sm text-white/80 backdrop-blur">
      <div className="font-semibold mb-1">AI Dealer Coach</div>
      <ul className="list-disc ml-4 space-y-1">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
