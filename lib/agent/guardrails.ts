import { AGENT_CONFIG } from './config';

export function isAllowed(text: string) {
  const avoid = new RegExp(AGENT_CONFIG.guardrails.topic_avoidance.join('|'), 'i');
  return !avoid.test(text);
}

