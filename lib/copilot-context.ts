// Utility: derives mood, tone and predictive hints from live metrics + feedback
// Phase 3 Week 2: Expanded moods + regional tone variants

export interface CopilotMood {
  mood: "positive" | "neutral" | "reflective" | "urgent" | "celebratory";
  tone: "professional" | "witty" | "cinematic" | "direct" | "enthusiastic" | "southern" | "midwest" | "coastal";
  prediction?: string;
  region?: "south" | "midwest" | "west" | "northeast" | "default";
}

/**
 * Derive mood and tone based on KPI trends, feedback sentiment, local time, and region.
 * Phase 3 Week 2: Enhanced with urgent/celebratory moods + regional tones
 */
export function deriveCopilotMood({
  metrics,
  feedbackScore,
  localTime,
  region = "default"
}: {
  metrics: { forecastChange?: number; aiv?: number };
  feedbackScore: number;
  localTime: Date;
  region?: CopilotMood["region"];
}): CopilotMood {
  const hour = localTime.getHours();
  const aiv = metrics.aiv ?? 75;
  const forecast = metrics.forecastChange ?? 0;

  // Determine mood (5 moods: positive, neutral, reflective, urgent, celebratory)
  let mood: CopilotMood["mood"] = "neutral";

  // URGENT: Metrics declining sharply - immediate action needed
  if (forecast < -15 || aiv < 50) {
    mood = "urgent";
  }
  // CELEBRATORY: Major breakthrough - celebrate and amplify
  else if (forecast > 20 && aiv > 90) {
    mood = "celebratory";
  }
  // POSITIVE: Good progress - maintain momentum
  else if (forecast > 5 || aiv > 80) {
    mood = "positive";
  }
  // REFLECTIVE: Underperforming - strategic rethink needed
  else if (forecast < -8 || aiv < 65) {
    mood = "reflective";
  }

  // Determine tone based on mood, feedback, time, and region
  let tone: CopilotMood["tone"] = "professional";

  if (mood === "urgent") {
    // Urgent = Direct, no-nonsense communication
    tone = "direct";
  } else if (mood === "celebratory") {
    // Celebratory = Enthusiastic, energetic
    tone = "enthusiastic";
  } else if (mood === "positive") {
    // Positive = Personality based on feedback and region
    if (feedbackScore > 0.6) {
      tone = applyRegionalTone("witty", region);
    } else {
      tone = "professional";
    }
  } else if (mood === "reflective") {
    // Reflective = Thoughtful, cinematic at night
    if (hour > 18) {
      tone = "cinematic";
    } else {
      tone = "professional";
    }
  }

  // Predictive coaching cue
  const prediction =
    forecast < -15
      ? "⚠️ Critical decline detected - immediate action required to reverse trend."
      : forecast < -10
      ? "📉 Forecast dip predicted - consider running an AI visibility scan."
      : forecast > 20
      ? "🎉 Exceptional growth! Momentum is accelerating - double down on what's working."
      : forecast > 10
      ? "📈 Momentum is trending upward - capitalize on this cycle."
      : undefined;

  return { mood, tone, prediction, region };
}

/**
 * Apply regional flavor to tone
 * Phase 3 Week 2: Regional personality variants
 */
function applyRegionalTone(
  baseTone: CopilotMood["tone"],
  region: CopilotMood["region"]
): CopilotMood["tone"] {
  if (baseTone !== "witty") return baseTone;

  switch (region) {
    case "south":
      return "southern"; // Warm, hospitable, "y'all" friendly
    case "midwest":
      return "midwest"; // Down-to-earth, practical, "folks" casual
    case "west":
    case "northeast":
      return "coastal"; // Fast-paced, direct, trendy
    default:
      return baseTone;
  }
}

/**
 * Detect dealer region from location
 * Phase 3 Week 2: Geographic personality detection
 */
export function detectRegion(state: string): CopilotMood["region"] {
  const southStates = [
    "AL", "AR", "FL", "GA", "KY", "LA", "MS", "NC", "SC", "TN", "TX", "VA", "WV"
  ];
  const midwestStates = [
    "IL", "IN", "IA", "KS", "MI", "MN", "MO", "NE", "ND", "OH", "SD", "WI"
  ];
  const westStates = [
    "AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NV", "NM", "OR", "UT", "WA", "WY"
  ];
  const northeastStates = [
    "CT", "DE", "ME", "MD", "MA", "NH", "NJ", "NY", "PA", "RI", "VT"
  ];

  const upper = state.toUpperCase();
  if (southStates.includes(upper)) return "south";
  if (midwestStates.includes(upper)) return "midwest";
  if (westStates.includes(upper)) return "west";
  if (northeastStates.includes(upper)) return "northeast";
  return "default";
}

