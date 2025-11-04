#!/usr/bin/env node

/**
 * Generate Weekly AI Visibility Leaderboard
 * 
 * Fetches dealer metrics from database and generates leaderboard
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function generateLeaderboard() {
  try {
    console.log('📊 Generating weekly AI visibility leaderboard...');

    // Get date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Fetch dealer metrics
    // Note: Adjust query based on your actual schema
    const dealers = await prisma.dealer.findMany({
      include: {
        // Adjust based on your schema relationships
        // Example: aiScores, metrics, etc.
      },
    });

    // Calculate scores and rankings
    const leaderboard = dealers.map((dealer) => {
      // Calculate AI visibility score
      // This is a placeholder - adjust based on your actual metrics
      const aiVisibilityScore = Math.random() * 20 + 80; // 80-100 range for demo
      const revenueAtRisk = Math.random() * 50000 + 10000;
      const trend = (Math.random() - 0.3) * 10; // Slightly positive bias

      return {
        dealerId: dealer.id,
        dealerName: dealer.name || dealer.id,
        aiVisibilityScore: Math.round(aiVisibilityScore * 10) / 10,
        revenueAtRisk: Math.round(revenueAtRisk),
        trend: Math.round(trend * 10) / 10,
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by AI visibility score (descending)
    leaderboard.sort((a, b) => b.aiVisibilityScore - a.aiVisibilityScore);

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Get top 10
    const top10 = leaderboard.slice(0, 10);

    // Format leaderboard
    const week = getWeekNumber(new Date());
    const year = new Date().getFullYear();

    const leaderboardText = formatLeaderboardMarkdown(top10, week, year);

    // Save to file
    const outputDir = path.join(process.cwd(), 'leaderboards');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `leaderboard-w${week}-${year}.md`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, leaderboardText);

    // Also save JSON for programmatic access
    const jsonFilepath = path.join(outputDir, `leaderboard-w${week}-${year}.json`);
    fs.writeFileSync(jsonFilepath, JSON.stringify({ week, year, leaderboard: top10 }, null, 2));

    console.log(`✅ Leaderboard generated: ${filepath}`);
    console.log(`📊 Top dealer: ${top10[0].dealerName} (Score: ${top10[0].aiVisibilityScore}%)`);

    return { leaderboard: top10, week, year, text: leaderboardText };
  } catch (error) {
    console.error('❌ Error generating leaderboard:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function formatLeaderboardMarkdown(top10, week, year) {
  const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  
  let markdown = `# 🏆 AI Visibility Leaderboard - Week ${week}, ${year}\n\n`;
  markdown += `*Generated: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}*\n\n`;

  markdown += `## Top 10 Dealers\n\n`;
  markdown += `| Rank | Dealer | AI Visibility | Revenue at Risk | Trend |\n`;
  markdown += `|------|--------|---------------|-----------------|-------|\n`;

  top10.forEach((entry, index) => {
    const trendEmoji = entry.trend > 0 ? '📈' : entry.trend < 0 ? '📉' : '➡️';
    const trendText = entry.trend > 0 ? `+${entry.trend.toFixed(1)}%` : `${entry.trend.toFixed(1)}%`;
    
    markdown += `| ${emoji[index]} ${entry.rank} | **${entry.dealerName}** | ${entry.aiVisibilityScore.toFixed(1)}% | $${entry.revenueAtRisk.toLocaleString()} | ${trendEmoji} ${trendText} |\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `*Powered by DealershipAI Predictive Analytics*\n`;

  return markdown;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// Run if called directly
if (require.main === module) {
  generateLeaderboard()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { generateLeaderboard };
