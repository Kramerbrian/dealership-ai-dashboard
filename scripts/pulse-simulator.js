#!/usr/bin/env node
/**
 * Pulse Event Simulator
 * Generates realistic pulse events for testing the decision inbox
 *
 * Usage:
 *   node scripts/pulse-simulator.js                    # Generate 5 random events
 *   node scripts/pulse-simulator.js --count 10         # Generate 10 events
 *   node scripts/pulse-simulator.js --scenario alpha   # Alpha deployment scenario
 *   node scripts/pulse-simulator.js --live             # Send to live API
 */

const SCENARIOS = {
  alpha: [
    {
      level: 'high',
      kind: 'kpi_delta',
      title: 'AIV dropped 8 points',
      detail: 'Visibility score declined across all segments',
      delta: -8,
      thread: { type: 'kpi', id: 'aiv-trend-2025' },
      actions: ['open', 'fix', 'snooze'],
      dedupe_key: `aiv-drop-${Date.now()}`,
      ttl_sec: 86400,
      context: { kpi: 'AIV', segment: 'all', source: 'schema_scan' },
      receipts: [
        { label: 'Before', kpi: 'AIV', before: 72 },
        { label: 'After', kpi: 'AIV', after: 64 }
      ]
    },
    {
      level: 'medium',
      kind: 'market_signal',
      title: 'Competitor launched enhanced inventory',
      detail: 'Smith Ford added 45 new vehicles with rich schema',
      thread: { type: 'market', id: 'smith-ford-activity' },
      actions: ['open'],
      dedupe_key: `smith-ford-inv-${Date.now()}`,
      ttl_sec: 604800,
      context: { source: 'competitor_monitor', competitor: 'Smith Ford' }
    },
    {
      level: 'info',
      kind: 'system_health',
      title: 'Schema scan completed',
      detail: '23/25 schema types detected (+2 from last scan)',
      actions: ['open'],
      dedupe_key: `schema-scan-${Date.now()}`,
      ttl_sec: 43200,
      context: { scan_id: `scan-${Date.now()}`, types_found: 23 }
    },
    {
      level: 'critical',
      kind: 'sla_breach',
      title: 'Response time SLA breach',
      detail: 'Average page load time exceeded 3s threshold',
      actions: ['open', 'assign'],
      dedupe_key: `sla-latency-${Date.now()}`,
      ttl_sec: 3600,
      context: { metric: 'page_load_time', threshold: 3000, actual: 3800 }
    },
    {
      level: 'info',
      kind: 'auto_fix',
      title: 'LocalBusiness schema auto-fixed',
      detail: 'Missing address field added automatically',
      thread: { type: 'incident', id: 'inc-schema-001' },
      actions: ['open'],
      dedupe_key: `autofix-localbiz-${Date.now()}`,
      ttl_sec: 86400,
      context: { fix_type: 'schema_addition', field: 'address' },
      receipts: [
        { label: 'Schema Coverage', kpi: 'Coverage', before: 88, after: 92 }
      ]
    }
  ],

  beta: [
    {
      level: 'high',
      kind: 'kpi_delta',
      title: 'Trust score improved +12 points',
      detail: 'E-E-A-T signals strengthened across 3 stores',
      delta: 12,
      thread: { type: 'kpi', id: 'trust-trend-beta' },
      actions: ['open'],
      dedupe_key: `trust-up-${Date.now()}`,
      ttl_sec: 86400,
      context: { kpi: 'ATI', mesh_nodes: ['naples-fl', 'fort-myers', 'miami-fl'] },
      receipts: [
        { label: 'Naples FL', kpi: 'Trust', before: 78, after: 85 },
        { label: 'Fort Myers', kpi: 'Trust', before: 73, after: 82 },
        { label: 'Miami', kpi: 'Trust', before: 71, after: 86 }
      ]
    },
    {
      level: 'medium',
      kind: 'incident_opened',
      title: 'Cross-store schema inconsistency',
      detail: '2 stores missing Product schema that others have',
      thread: { type: 'incident', id: 'inc-consistency-001' },
      actions: ['open', 'fix', 'assign'],
      dedupe_key: `inc-schema-consistency-${Date.now()}`,
      ttl_sec: 172800,
      context: { affected_stores: ['fort-myers', 'miami-fl'] }
    },
    {
      level: 'info',
      kind: 'market_signal',
      title: 'Regional visibility shift detected',
      detail: 'FL-South market showing 15% average visibility increase',
      thread: { type: 'market', id: 'fl-south-trends' },
      actions: ['open'],
      dedupe_key: `market-shift-fl-${Date.now()}`,
      ttl_sec: 604800,
      context: { region: 'FL-South', delta: 15, store_count: 5 }
    }
  ],

  gamma: [
    {
      level: 'critical',
      kind: 'incident_opened',
      title: 'Network-wide latency spike',
      detail: 'Average API response time increased 240% nationwide',
      thread: { type: 'incident', id: 'inc-latency-national' },
      actions: ['open', 'assign'],
      dedupe_key: `inc-latency-national-${Date.now()}`,
      ttl_sec: 7200,
      context: { affected_stores: 23, avg_latency_ms: 840, threshold_ms: 250 }
    },
    {
      level: 'high',
      kind: 'kpi_delta',
      title: 'Collective intelligence milestone',
      detail: 'Network predictive accuracy reached 87%',
      delta: 7,
      thread: { type: 'kpi', id: 'predictive-accuracy' },
      actions: ['open'],
      dedupe_key: `milestone-predictive-${Date.now()}`,
      ttl_sec: 86400,
      context: { kpi: 'Predictive Accuracy', network_size: 24 },
      receipts: [
        { label: 'Target', kpi: 'Accuracy', before: 80, after: 87 }
      ]
    },
    {
      level: 'info',
      kind: 'incident_resolved',
      title: 'FL-South mesh optimization complete',
      detail: 'All 5 stores now at 100% schema consistency',
      thread: { type: 'incident', id: 'inc-consistency-001' },
      actions: ['open'],
      dedupe_key: `resolved-consistency-${Date.now()}`,
      ttl_sec: 86400,
      context: { region: 'FL-South', stores_affected: 5 }
    }
  ]
};

// Random event templates
const RANDOM_TEMPLATES = [
  {
    level: 'medium',
    kind: 'kpi_delta',
    title: 'Schema coverage increased',
    detail: 'New schema types detected',
    delta: () => Math.floor(Math.random() * 5) + 1,
    ttl_sec: 86400
  },
  {
    level: 'low',
    kind: 'system_health',
    title: 'Daily health check passed',
    detail: 'All systems operational',
    ttl_sec: 43200
  },
  {
    level: 'medium',
    kind: 'market_signal',
    title: 'Competitor activity detected',
    detail: 'New content published by nearby dealer',
    ttl_sec: 604800
  }
];

function generateRandomEvent() {
  const template = RANDOM_TEMPLATES[Math.floor(Math.random() * RANDOM_TEMPLATES.length)];
  return {
    level: template.level,
    kind: template.kind,
    title: template.title,
    detail: template.detail,
    delta: typeof template.delta === 'function' ? template.delta() : undefined,
    actions: ['open'],
    dedupe_key: `random-${template.kind}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ttl_sec: template.ttl_sec,
    context: { generated: true, timestamp: new Date().toISOString() }
  };
}

async function sendToAPI(events, dealerId = 'demo-tenant') {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const url = `${apiUrl}/api/pulse?dealerId=${dealerId}`;

  console.log(`\n📡 Sending ${events.length} events to ${url}...\n`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(events)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log(`   Cards ingested: ${result.cardsIngested}/${result.cardsReceived}`);
      console.log(`   Incidents promoted: ${result.promotedIncidents}`);
      if (result.incidents?.length > 0) {
        console.log('\n   Promoted Incidents:');
        result.incidents.forEach(inc => {
          console.log(`   - ${inc.title} (${inc.urgency})`);
        });
      }
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Failed to send events:', error.message);
  }
}

function displayEvents(events) {
  console.log('\n📋 Generated Events:\n');
  events.forEach((event, index) => {
    const levelEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
      info: '🔵'
    }[event.level] || '⚪';

    console.log(`${levelEmoji} [${event.kind.toUpperCase()}] ${event.title}`);
    console.log(`   ${event.detail || '(no details)'}`);
    if (event.delta !== undefined) {
      console.log(`   Delta: ${event.delta > 0 ? '+' : ''}${event.delta}`);
    }
    if (event.thread) {
      console.log(`   Thread: ${event.thread.type}/${event.thread.id}`);
    }
    console.log(`   Actions: ${event.actions?.join(', ') || 'none'}`);
    console.log(`   TTL: ${event.ttl_sec}s (${(event.ttl_sec / 3600).toFixed(1)}h)`);
    console.log('');
  });
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    count: 5,
    scenario: null,
    live: false,
    dealerId: 'demo-tenant'
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      options.count = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--scenario' && args[i + 1]) {
      options.scenario = args[i + 1];
      i++;
    } else if (args[i] === '--live') {
      options.live = true;
    } else if (args[i] === '--dealer' && args[i + 1]) {
      options.dealerId = args[i + 1];
      i++;
    }
  }

  return options;
}

// Main execution
async function main() {
  console.log('\n🌊 Pulse Event Simulator\n');

  const options = parseArgs();
  let events = [];

  if (options.scenario && SCENARIOS[options.scenario]) {
    console.log(`📦 Loading ${options.scenario} scenario...`);
    events = SCENARIOS[options.scenario];
  } else {
    console.log(`🎲 Generating ${options.count} random events...`);
    for (let i = 0; i < options.count; i++) {
      events.push(generateRandomEvent());
    }
  }

  displayEvents(events);

  if (options.live) {
    await sendToAPI(events, options.dealerId);
  } else {
    console.log('\n💡 Tip: Use --live flag to send events to API');
    console.log('   Example: node scripts/pulse-simulator.js --scenario alpha --live\n');
  }
}

main().catch(console.error);
