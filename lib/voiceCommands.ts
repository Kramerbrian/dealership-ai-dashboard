// lib/voiceCommands.ts

export const VOICE = {
  "what's my aiv score": { action: "AIV_SCORE" },
  "show me what naples toyota is doing": { action: "OPEN_COMPETITOR", arg: "Naples Toyota" },
  "deploy the schema strategy": { action: "DEPLOY_SCHEMA" },
  "remind me to check results tomorrow at 9am": { action: "REMINDER", arg: "tomorrow 09:00" },
} as const;

