#!/usr/bin/env node

/**
 * Post Weekly Leaderboard to Slack
 * 
 * Reads the generated leaderboard and posts it to Slack
 */

const fs = require('fs');
const path = require('path');

async function postLeaderboardToSlack() {
  try {
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    const SLACK_CHANNEL = process.env.SLACK_CHANNEL || '#ai-ops';

    if (!SLACK_WEBHOOK_URL) {
      console.error('❌ SLACK_WEBHOOK_URL not set');
      process.exit(1);
    }

    console.log('📤 Posting leaderboard to Slack...');

    // Find latest leaderboard file
    const leaderboardDir = path.join(process.cwd(), 'leaderboards');
    if (!fs.existsSync(leaderboardDir)) {
      console.error('❌ Leaderboards directory not found. Run generate-leaderboard.js first.');
      process.exit(1);
    }

    const files = fs.readdirSync(leaderboardDir)
      .filter(file => file.startsWith('leaderboard-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      console.error('❌ No leaderboard files found');
      process.exit(1);
    }

    const latestFile = files[0];
    const filepath = path.join(leaderboardDir, latestFile);
    const leaderboardData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    // Format Slack message
    const { leaderboard, week, year } = leaderboardData;
    const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    let slackText = `*🏆 AI Visibility Leaderboard - Week ${week}, ${year}*\n\n`;
    slackText += `*Top 10 Dealers*\n\n`;

    leaderboard.forEach((entry, index) => {
      const trendEmoji = entry.trend > 0 ? '📈' : entry.trend < 0 ? '📉' : '➡️';
      const trendText = entry.trend > 0 ? `+${entry.trend.toFixed(1)}%` : `${entry.trend.toFixed(1)}%`;
      
      slackText += `${emoji[index]} *${entry.rank}. ${entry.dealerName}*\n`;
      slackText += `   • AI Visibility: *${entry.aiVisibilityScore.toFixed(1)}%*\n`;
      slackText += `   • Revenue at Risk: $${entry.revenueAtRisk.toLocaleString()}\n`;
      slackText += `   • Trend: ${trendEmoji} ${trendText}\n\n`;
    });

    slackText += `_Powered by DealershipAI Predictive Analytics_`;

    // Post to Slack
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: SLACK_CHANNEL,
        username: 'DealershipAI Leaderboard',
        icon_emoji: ':trophy:',
        text: slackText,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API error: ${response.status} ${errorText}`);
    }

    console.log(`✅ Leaderboard posted to ${SLACK_CHANNEL}`);
    console.log(`📊 Top dealer: ${leaderboard[0].dealerName} (Score: ${leaderboard[0].aiVisibilityScore}%)`);
  } catch (error) {
    console.error('❌ Error posting to Slack:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  postLeaderboardToSlack()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { postLeaderboardToSlack };

