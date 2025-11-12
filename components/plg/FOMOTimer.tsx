"use client";

import { useEffect, useState } from "react";
import { GRADIENTS } from "@/design/gradients";

export default function FOMOTimer() {
  const [scansLeft, setScansLeft] = useState(3);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('plg_scans_left');
      if (stored) {
        const count = Number(stored);
        setScansLeft(count);
      } else {
        // Initialize with 3 scans
        localStorage.setItem('plg_scans_left', '3');
        setScansLeft(3);
      }
    }
  }, []);

  // Update localStorage when scansLeft changes
  useEffect(() => {
    if (typeof window !== 'undefined' && scansLeft >= 0) {
      localStorage.setItem('plg_scans_left', String(scansLeft));
    }
  }, [scansLeft]);

  if (scansLeft <= 0) return null;

  return (
    <div className={`w-full bg-gradient-to-r ${GRADIENTS.primary} text-white text-sm`}>
      <div className="max-w-6xl mx-auto p-3 text-center">
        ⚡ <b>{scansLeft} free analyses left</b> — See how visible you are to AI search in 3 seconds
      </div>
    </div>
  );
}

