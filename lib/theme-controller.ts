// Connect Copilot mood → UI variables and audio state

type Mood = "positive" | "neutral" | "reflective";
type Tone = "professional" | "witty" | "cinematic";

interface ThemeSignal {
  mood: Mood;
  tone: Tone;
}

/**
 * Updates CSS variables and optional audio filters based on Copilot mood.
 * This runs client-side; call it whenever mood changes.
 */
export function applyThemeSignal({ mood, tone }: ThemeSignal) {
  if (typeof document === 'undefined') return; // SSR safety
  
  const root = document.documentElement;

  // --- Color logic
  let accent = "59 130 246"; // blue
  let glow = "rgba(59,130,246,0.15)";
  if (mood === "positive") {
    accent = "34 197 94"; // green
    glow = "rgba(34,197,94,0.2)";
  }
  if (mood === "reflective") {
    accent = "139 92 246"; // purple
    glow = "rgba(139,92,246,0.1)";
  }

  root.style.setProperty("--accent-rgb", accent);
  root.style.setProperty("--accent-glow", glow);

  // --- Background vignette brightness
  const brightness =
    mood === "positive" ? "0.9" : mood === "reflective" ? "0.6" : "0.75";
  root.style.setProperty("--vignette-brightness", brightness);

  // --- Typography weight modulation (slight)
  const weight =
    tone === "witty" ? "500" : tone === "cinematic" ? "400" : "450";
  root.style.setProperty("--heading-weight", weight);

  // --- Optional audio modulation (if ambient hum loaded globally)
  const audioEl = document.getElementById("ambient-hum") as HTMLAudioElement | null;
  if (audioEl) {
    const gain = mood === "reflective" ? 0.15 : 0.25;
    audioEl.volume = gain;
  }
}

