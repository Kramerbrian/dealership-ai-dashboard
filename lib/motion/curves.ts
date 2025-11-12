export const Motion = {
  duration: { fast: 0.12, base: 0.2, slow: 0.32 },
  easing: {
    cupertino: [0.25, 0.1, 0.25, 1],
    springy: [0.2, 0.8, 0.2, 1]
  },
  presets: {
    fadeIn: { opacity: [0,1], duration: 0.2, ease: 'cupertino' as const },
    slideUp: { y: [12,0], opacity: [0,1], duration: 0.24, ease: 'cupertino' as const },
    drawer: { x: [480,0], opacity: [0,1], duration: 0.28, ease: 'springy' as const }
  }
};
