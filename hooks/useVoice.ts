// hooks/useVoice.ts

"use client";

import { useEffect } from "react";
import { VOICE } from "@/lib/voiceCommands";

export function useVoice(onCommand: (cmd: { action: string; arg?: string }) => void) {
  useEffect(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).slice(-1)[0][0].transcript.toLowerCase().trim();
      const key = Object.keys(VOICE).find(k => text.includes(k));
      if (key) onCommand(VOICE[key as keyof typeof VOICE] as any);
    };
    rec.start(); return () => rec.stop();
  }, [onCommand]);
}

