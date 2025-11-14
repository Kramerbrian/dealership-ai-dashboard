/**
 * Pre-configured A/B Testing Experiments
 *
 * Ready-to-use experiment templates for common testing scenarios
 *
 * Phase 3: Context + Copilot Evolution - Week 2
 */

import { createExperiment, Experiment } from './engine';

/**
 * Theme Experiment: Test new urgent/celebratory mood colors
 */
export function createUrgentMoodThemeExperiment(): Experiment {
  return createExperiment(
    'Urgent Mood Theme Test',
    'Test new red color scheme for urgent mood vs existing blue',
    'theme',
    [
      {
        name: 'Control (Blue)',
        description: 'Current blue color scheme for urgent situations',
        is_control: true,
        allocation: 50,
        config: {
          mood: 'urgent',
          accent: '59 130 246', // blue
          glow: 'rgba(59,130,246,0.15)',
          brightness: '0.75',
        },
      },
      {
        name: 'Variant (Red)',
        description: 'New red color scheme for urgent mood',
        is_control: false,
        allocation: 50,
        config: {
          mood: 'urgent',
          accent: '239 68 68', // red
          glow: 'rgba(239,68,68,0.25)',
          brightness: '0.5',
        },
      },
    ],
    20 // 20% traffic
  );
}

/**
 * Theme Experiment: Test celebratory mood colors
 */
export function createCelebratoryMoodThemeExperiment(): Experiment {
  return createExperiment(
    'Celebratory Mood Theme Test',
    'Test new gold/yellow color scheme for celebratory mood',
    'theme',
    [
      {
        name: 'Control (Green)',
        description: 'Current green (positive) color scheme',
        is_control: true,
        allocation: 50,
        config: {
          mood: 'celebratory',
          accent: '34 197 94', // green
          glow: 'rgba(34,197,94,0.2)',
          brightness: '0.9',
        },
      },
      {
        name: 'Variant (Gold)',
        description: 'New gold/yellow color scheme for celebration',
        is_control: false,
        allocation: 50,
        config: {
          mood: 'celebratory',
          accent: '251 191 36', // gold
          glow: 'rgba(251,191,36,0.3)',
          brightness: '1.0',
        },
      },
    ],
    20 // 20% traffic
  );
}

/**
 * Copilot Experiment: Test regional tone variants
 */
export function createRegionalToneExperiment(): Experiment {
  return createExperiment(
    'Regional Tone Variants Test',
    'Test regional tone variants (southern, midwest, coastal) vs standard witty',
    'copilot',
    [
      {
        name: 'Control (Witty)',
        description: 'Standard witty tone for all regions',
        is_control: true,
        allocation: 40,
        config: {
          tone: 'witty',
          useRegionalVariants: false,
        },
      },
      {
        name: 'Variant (Regional)',
        description: 'Regional tone variants (southern/midwest/coastal)',
        is_control: false,
        allocation: 60,
        config: {
          tone: 'witty',
          useRegionalVariants: true,
        },
      },
    ],
    30 // 30% traffic
  );
}

/**
 * Copilot Experiment: Test new urgent/direct tone
 */
export function createUrgentToneExperiment(): Experiment {
  return createExperiment(
    'Urgent Tone Effectiveness Test',
    'Test new direct tone for urgent situations vs standard professional',
    'copilot',
    [
      {
        name: 'Control (Professional)',
        description: 'Standard professional tone for urgent situations',
        is_control: true,
        allocation: 50,
        config: {
          mood: 'urgent',
          tone: 'professional',
        },
      },
      {
        name: 'Variant (Direct)',
        description: 'New direct, no-nonsense tone for urgent situations',
        is_control: false,
        allocation: 50,
        config: {
          mood: 'urgent',
          tone: 'direct',
        },
      },
    ],
    25 // 25% traffic
  );
}

/**
 * Feature Experiment: Test weather context display
 */
export function createWeatherContextExperiment(): Experiment {
  return createExperiment(
    'Weather Context Display Test',
    'Test impact of showing weather context in insights',
    'feature',
    [
      {
        name: 'Control (No Weather)',
        description: 'Standard insights without weather context',
        is_control: true,
        allocation: 50,
        config: {
          showWeatherContext: false,
        },
      },
      {
        name: 'Variant (With Weather)',
        description: 'Insights with weather context and impact scoring',
        is_control: false,
        allocation: 50,
        config: {
          showWeatherContext: true,
        },
      },
    ],
    30 // 30% traffic
  );
}

/**
 * Feature Experiment: Test local events context
 */
export function createEventsContextExperiment(): Experiment {
  return createExperiment(
    'Local Events Context Test',
    'Test impact of showing local events (auto shows, festivals) in insights',
    'feature',
    [
      {
        name: 'Control (No Events)',
        description: 'Standard insights without local events',
        is_control: true,
        allocation: 50,
        config: {
          showEventsContext: false,
        },
      },
      {
        name: 'Variant (With Events)',
        description: 'Insights with local events and impact predictions',
        is_control: false,
        allocation: 50,
        config: {
          showEventsContext: true,
        },
      },
    ],
    25 // 25% traffic
  );
}

/**
 * UI Experiment: Test vignette brightness variations
 */
export function createVignetteBrightnessExperiment(): Experiment {
  return createExperiment(
    'Vignette Brightness Optimization',
    'Test different vignette brightness levels for readability and mood',
    'ui',
    [
      {
        name: 'Control (Current)',
        description: 'Current vignette brightness levels',
        is_control: true,
        allocation: 34,
        config: {
          positive: '0.9',
          neutral: '0.75',
          reflective: '0.6',
          urgent: '0.5',
          celebratory: '1.0',
        },
      },
      {
        name: 'Variant A (Brighter)',
        description: 'Increased brightness for better readability',
        is_control: false,
        allocation: 33,
        config: {
          positive: '1.0',
          neutral: '0.85',
          reflective: '0.7',
          urgent: '0.6',
          celebratory: '1.0',
        },
      },
      {
        name: 'Variant B (Darker)',
        description: 'Decreased brightness for more cinematic feel',
        is_control: false,
        allocation: 33,
        config: {
          positive: '0.8',
          neutral: '0.65',
          reflective: '0.5',
          urgent: '0.4',
          celebratory: '0.95',
        },
      },
    ],
    15 // 15% traffic
  );
}

/**
 * Get all pre-configured experiments
 */
export function getAllPresetExperiments(): Experiment[] {
  return [
    createUrgentMoodThemeExperiment(),
    createCelebratoryMoodThemeExperiment(),
    createRegionalToneExperiment(),
    createUrgentToneExperiment(),
    createWeatherContextExperiment(),
    createEventsContextExperiment(),
    createVignetteBrightnessExperiment(),
  ];
}

/**
 * Get experiments by target type
 */
export function getPresetExperimentsByTarget(
  target: 'theme' | 'copilot' | 'feature' | 'ui'
): Experiment[] {
  return getAllPresetExperiments().filter(exp => exp.target === target);
}
