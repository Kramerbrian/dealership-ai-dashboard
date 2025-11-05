/**
 * Enhanced Slack Update Service with Block Kit Progress Bars
 * 
 * Provides visual progress bars, threaded updates, and adaptive completion messages
 */

import fetch from "node-fetch";

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN!;
const PROM_URL = process.env.PROMETHEUS_URL || "http://localhost:9090";
const GRAFANA_URL = process.env.GRAFANA_URL || "https://grafana.dealershipai.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export type TaskStatus = "progress" | "completed" | "failed";

interface SlackUpdateOptions {
  progress?: number;
  error?: string;
  taskId?: string;
  grafanaUrl?: string;
  metrics?: {
    arrGain?: number;
    precision?: number;
    kpi?: string;
  };
}

/**
 * Update Slack message with progress bar and status
 */
export async function updateSlackProgress(
  channel: string,
  ts: string,
  task: string,
  dealer: string,
  status: TaskStatus,
  progress = 0,
  options?: SlackUpdateOptions
) {
  // Simple block-style bar
  const filled = "█".repeat(Math.floor(progress / 10));
  const empty = "░".repeat(10 - Math.floor(progress / 10));
  const bar = `${filled}${empty} ${progress}%`;

  let color = "#3AA3E3";
  let header = `⚙️  *${task}* for *${dealer}*`;
  let note = "";

  if (status === "completed") {
    color = "#36a64f";
    note = "✅ Completed successfully.";
    
    // Add metrics if available
    if (options?.metrics?.arrGain) {
      note += `\nARR Gain (1h): $${options.metrics.arrGain.toFixed(2)}`;
    }
    if (options?.metrics?.precision) {
      note += `\nPrecision: ${(options.metrics.precision * 100).toFixed(1)}%`;
    }
  } else if (status === "failed") {
    color = "#e01e5a";
    note = options?.error ? `❌ Failed: ${options.error}` : "❌ Failed. Check logs.";
  } else {
    note = "Running…";
  }

  // Build action buttons
  const actionButtons: any[] = [
    {
      type: "button",
      text: { type: "plain_text", text: "🔍 View Logs" },
      style: "primary",
      url: `${APP_URL}/logs/${dealer}`,
    },
    {
      type: "button",
      text: { type: "plain_text", text: "📊 Open Grafana" },
      style: "default",
      url: options?.grafanaUrl || `${GRAFANA_URL}/d/${dealer}`,
    },
  ];

  // Add retry button for failed tasks
  if (status === "failed") {
    actionButtons.push({
      type: "button",
      text: { type: "plain_text", text: "🔁 Retry Task" },
      style: "danger",
      value: JSON.stringify({ dealer, action: task }),
      action_id: "retry_task",
    });
  }

  const payload = {
    channel,
    ts,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `${header}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            status === "progress"
              ? `*${note}*\n\`${bar}\``
              : `*${note}*`,
        },
      },
      {
        type: "actions",
        elements: actionButtons,
      },
    ],
    attachments: [{ color }],
  };

  const res = await fetch("https://slack.com/api/chat.update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.ok) console.error("Slack update error:", data);
  return data.ok;
}

/**
 * Post threaded update to Slack message
 * Use this for incremental progress logs instead of replacing the main message
 */
export async function postSlackThreadUpdate(
  channel: string,
  thread_ts: string,
  text: string
): Promise<boolean> {
  if (!SLACK_BOT_TOKEN) {
    console.warn("[Slack] SLACK_BOT_TOKEN not configured");
    return false;
  }

  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      body: JSON.stringify({
        channel,
        thread_ts,
        text,
        unfurl_links: false,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Slack thread update error:", data);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to post Slack thread update:", error);
    return false;
  }
}

/**
 * Fetch metrics from Prometheus for completion summary
 */
export async function fetchCompletionMetrics(dealer: string): Promise<{
  arrGain?: number;
  precision?: number;
  kpi?: string;
}> {
  try {
    // Fetch ARR gain
    const arrRes = await fetch(
      `${PROM_URL}/api/v1/query?query=gnn_arr_gain_by_dealer{dealer="${dealer}"}`
    );
    const arrData = await arrRes.json();
    const arrGain = parseFloat(
      arrData?.data?.result?.[0]?.value?.[1] ?? "0"
    );

    // Fetch precision
    const precRes = await fetch(
      `${PROM_URL}/api/v1/query?query=gnn_precision_by_dealer{dealer="${dealer}"}`
    );
    const precData = await precRes.json();
    const precision = parseFloat(
      precData?.data?.result?.[0]?.value?.[1] ?? "0"
    );

    return {
      arrGain: arrGain > 0 ? arrGain : undefined,
      precision: precision > 0 ? precision : undefined,
      kpi: arrGain > 0 ? `ARR Gain: $${arrGain.toFixed(2)}` : undefined,
    };
  } catch (error) {
    console.error("Failed to fetch Prometheus metrics:", error);
    return {};
  }
}

/**
 * Post error summary to thread (for failed tasks)
 */
export async function postErrorSummary(
  channel: string,
  thread_ts: string,
  error: string,
  logTail?: string
): Promise<boolean> {
  let text = `❌ Error: ${error}`;
  
  if (logTail) {
    text += `\n\n\`\`\`\n${logTail}\n\`\`\``;
  }

  return postSlackThreadUpdate(channel, thread_ts, text);
}

/**
 * Post progress update to thread with step description
 */
export async function postProgressThread(
  channel: string,
  thread_ts: string,
  progress: number,
  step?: string
): Promise<boolean> {
  const text = step
    ? `Progress: ${progress}% – ${step}`
    : `Progress: ${progress}%`;
  
  return postSlackThreadUpdate(channel, thread_ts, text);
}

