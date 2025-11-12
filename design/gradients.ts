/**
 * Gradient Tokens
 * 
 * Unified gradient system for CTAs and accents
 */

export const GRADIENTS = {
  primary: "from-[#7c3aed] to-[#ec4899]",
  secondary: "from-[#66d1ff] to-[#8ef0df]",
  accent: "from-[#f5c16c] to-[#66d1ff]",
  success: "from-[#10b981] to-[#059669]",
  warning: "from-[#f59e0b] to-[#d97706]",
  danger: "from-[#ef4444] to-[#dc2626]",
} as const;

export const GRADIENT_SHADOWS = {
  primary: "shadow-[0_8px_20px_-6px_rgba(124,58,237,0.45)] hover:shadow-[0_10px_24px_-6px_rgba(124,58,237,0.55)]",
  secondary: "shadow-[0_8px_20px_-6px_rgba(102,209,255,0.45)] hover:shadow-[0_10px_24px_-6px_rgba(102,209,255,0.55)]",
} as const;

