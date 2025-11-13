/**
 * Deterministic Brand Hue Generator
 * Generates consistent brand accent colors based on seed
 */

/**
 * Generate a deterministic brand hue color from a seed string
 * @param seed - Organization ID, User ID, or any string identifier
 * @returns Hex color string (e.g., "#8b5cf6")
 */
export function generateBrandHue(seed: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use hash to generate hue (0-360 degrees)
  // Constrain to vibrant range (avoid grays)
  const hue = Math.abs(hash) % 360;
  
  // Prefer vibrant colors (avoid 0-30, 180-210 ranges which are less vibrant)
  // Map to preferred ranges: purple, blue, pink, cyan, green
  const preferredRanges = [
    { start: 240, end: 300 }, // Purple to Magenta
    { start: 200, end: 240 },  // Cyan to Blue
    { start: 300, end: 330 },  // Magenta to Pink
    { start: 150, end: 200 },  // Green to Cyan
    { start: 330, end: 360 },  // Pink to Red
  ];

  // Find which range this hue falls into, or map to nearest
  let mappedHue = hue;
  let inRange = false;
  
  for (const range of preferredRanges) {
    if (hue >= range.start && hue <= range.end) {
      inRange = true;
      break;
    }
  }
  
  if (!inRange) {
    // Map to nearest preferred range
    const distances = preferredRanges.map((range) => {
      const mid = (range.start + range.end) / 2;
      return Math.abs(hue - mid);
    });
    const nearestIdx = distances.indexOf(Math.min(...distances));
    const nearestRange = preferredRanges[nearestIdx];
    mappedHue = nearestRange.start + (Math.abs(hash) % (nearestRange.end - nearestRange.start));
  }

  // Convert HSL to RGB
  // Use high saturation (70-90%) and medium lightness (50-60%) for vibrant colors
  const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
  const lightness = 50 + (Math.abs(hash) % 10);   // 50-60%

  return hslToHex(mappedHue, saturation, lightness);
}

/**
 * Convert HSL to Hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Get brand tint variations
 */
export function getBrandTintVariations(baseHue: string): {
  light: string;
  base: string;
  dark: string;
  alpha: string;
} {
  // Extract RGB from hex
  const r = parseInt(baseHue.slice(1, 3), 16);
  const g = parseInt(baseHue.slice(3, 5), 16);
  const b = parseInt(baseHue.slice(5, 7), 16);

  // Light variation (lighter)
  const light = `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, b + 40)})`;
  
  // Base (original)
  const base = baseHue;
  
  // Dark variation (darker)
  const dark = `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
  
  // Alpha variation (with transparency)
  const alpha = `rgba(${r}, ${g}, ${b}, 0.1)`;

  return { light, base, dark, alpha };
}

