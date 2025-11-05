/**
 * Metrics Events Tracking
 * Tracks client connections and event counts
 */

let clientCount = 0;
const metrics = {
  activeClients: 0,
  totalEvents: 0,
  eventsByType: {} as Record<string, number>,
};

export function incClients() {
  clientCount++;
  metrics.activeClients = clientCount;
}

export function decClients() {
  clientCount = Math.max(0, clientCount - 1);
  metrics.activeClients = clientCount;
}

export function trackEvent(type: string) {
  metrics.totalEvents++;
  metrics.eventsByType[type] = (metrics.eventsByType[type] || 0) + 1;
}

export { metrics };

