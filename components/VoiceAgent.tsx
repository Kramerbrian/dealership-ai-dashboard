// components/VoiceAgent.tsx

"use client";

import { useVoice } from "@/hooks/useVoice";

export function VoiceAgent() {
  useVoice((cmd) => {
    // route actions to dashboard
    // e.g., if cmd.action==='AIV_SCORE' -> open AIV modal
  });
  return null;
}

