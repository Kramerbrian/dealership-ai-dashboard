"use client";

import { useEffect, useState } from "react";

export default function FOMOTimer() {
  const [scansLeft, setScansLeft] = useState(3);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('plg_scans_left');
      if (stored) {
        setScansLeft(Number(stored));
      }
    }
  }, []);

  if (scansLeft <= 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white text-sm">
      <div className="max-w-6xl mx-auto p-3 text-center">
        ⚡ <b>{scansLeft} free analyses left</b> — See how visible you are to AI search in 3 seconds
      </div>
    </div>
  );
}

