/**
 * DealershipAI Orchestrator v3.4 — Theme Configuration
 * Enables adaptive theming (dark/light/system) and dealership-level brand overrides.
 */

const DEFAULT_THEME = {
  mode: "system", // options: "light", "dark", or "system"
  palette: {
    primary: "#1b75bb",
    accent: "#00c896",
    light: "#ffffff",
    dark: "#101820",
    textPrimary: "#1f1f1f",
    textSecondary: "#6f6f6f",
    borderLight: "#e5e7eb",
    borderDark: "#2b2f36",
  },
  font: {
    family: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    weightNormal: 400,
    weightBold: 600,
  },
  borderRadius: "8px",
  animation: "0.25s ease-in-out",
};

/**
 * Fetch dealership-level theme overrides from the Orchestrator API
 * (auto-populates on login or onboarding)
 */
export async function fetchDealerTheme(dealerId: string) {
  try {
    const response = await fetch(`/api/v1/theme/${dealerId}`);
    if (!response.ok) throw new Error("Theme fetch failed");
    const overrides = await response.json();
    return { ...DEFAULT_THEME, ...overrides };
  } catch (err) {
    console.warn("Falling back to default theme:", err);
    return DEFAULT_THEME;
  }
}

/**
 * Detect user preferred color scheme (system preference)
 */
export function detectColorMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

/**
 * Apply current theme to document root (CSS variables)
 */
export function applyTheme(theme = DEFAULT_THEME, mode = detectColorMode()) {
  const root = document.documentElement;
  const activeMode = theme.mode === "system" ? mode : theme.mode;

  const palette = theme.palette;
  const setVar = (name: string, value: string) => root.style.setProperty(name, value);

  // Apply core variables
  setVar("--brand-primary", palette.primary);
  setVar("--brand-accent", palette.accent);
  setVar("--text-primary", palette.textPrimary);
  setVar("--text-secondary", palette.textSecondary);
  setVar("--radius", theme.borderRadius);
  setVar("--transition", theme.animation);

  if (activeMode === "dark") {
    setVar("--bg-light", palette.dark);
    setVar("--border-light", palette.borderDark);
    root.setAttribute("data-theme", "dark");
  } else {
    setVar("--bg-light", palette.light);
    setVar("--border-light", palette.borderLight);
    root.setAttribute("data-theme", "light");
  }
}

/**
 * Initialize theme flow (fetch + apply)
 */
export async function initTheme(dealerId: string) {
  const theme = await fetchDealerTheme(dealerId);
  const mode = detectColorMode();
  applyTheme(theme, mode);
  return theme;
}

