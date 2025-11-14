// Utility: derives mood, tone and predictive hints from live metrics + feedback

export interface CopilotMood {
  mood: "positive" | "neutral" | "reflective";
  tone: "professional" | "witty" | "cinematic";
  prediction?: string;
}

/**
 * Derive mood and tone based on KPI trends, feedback sentiment and local time.
 */
export function deriveCopilotMood({
  metrics,
  feedbackScore,
  localTime
}: {
  metrics: { forecastChange?: number; aiv?: number };
  feedbackScore: number;
  localTime: Date;
}): CopilotMood {
  const hour = localTime.getHours();
  const aiv = metrics.aiv ?? 75;
  const forecast = metrics.forecastChange ?? 0;

  let mood: CopilotMood["mood"] = "neutral";
  if (forecast > 5 || aiv > 80) mood = "positive";
  if (forecast < -8 || aiv < 65) mood = "reflective";

  // default tone
  let tone: CopilotMood["tone"] = "professional";
  if (feedbackScore > 0.6 && mood === "positive") tone = "witty";
  if (mood === "reflective" && hour > 18) tone = "cinematic";

  // predictive coaching cue
  const prediction =
    forecast < -10
      ? "Forecast dip predicted — consider running an AI visibility scan."
      : forecast > 10
      ? "Momentum is trending upward — capitalize on this cycle."
      : undefined;

  return { mood, tone, prediction };
}

