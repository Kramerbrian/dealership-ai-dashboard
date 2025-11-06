import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface BadgeEntry {
  month: string; // YYYY-MM format
  dealership: string;
  accuracy: number;
  awardedAt: string;
}

/**
 * POST /api/badges/top-forecaster
 * 
 * Awards monthly "Top Forecaster" badge based on leaderboard rankings
 * Body: { month: "2025-01", leaderboard: [{ name, accuracy }] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { month, leaderboard } = body;

    if (!month || !leaderboard || !Array.isArray(leaderboard) || leaderboard.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: month, leaderboard array" },
        { status: 400 }
      );
    }

    // Find top performer (highest accuracy)
    const topPerformer = leaderboard
      .sort((a, b) => b.accuracy - a.accuracy)
      [0];

    if (!topPerformer || topPerformer.accuracy < 70) {
      return NextResponse.json({
        status: "no_award",
        message: "No dealership meets minimum accuracy threshold (70%)",
      });
    }

    const badge: BadgeEntry = {
      month,
      dealership: topPerformer.name,
      accuracy: topPerformer.accuracy,
      awardedAt: new Date().toISOString(),
    };

    // Send Slack notification
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackWebhookUrl) {
      try {
        const monthName = new Date(month + "-01").toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        await fetch(slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🏆 *Top Forecaster Award - ${monthName}*`,
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: `🏆 Top Forecaster Award - ${monthName}`,
                  emoji: true,
                },
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*${topPerformer.name}* has earned the *Top Forecaster* badge for ${monthName}!\n\n*Accuracy:* ${topPerformer.accuracy.toFixed(1)}%\n*Rank:* #1 of ${leaderboard.length} dealerships`,
                },
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Top 3 Forecasters:*\n${leaderboard
                      .slice(0, 3)
                      .map((d, i) => `${i + 1}. ${d.name} (${d.accuracy.toFixed(1)}%)`)
                      .join("\n")}`,
                  },
                ],
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: "View Leaderboard",
                      emoji: true,
                    },
                    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://dealershipai.com"}/dashboard/compare`,
                    style: "primary",
                  },
                ],
              },
            ],
          }),
        });
      } catch (slackError) {
        console.error("Failed to send Slack badge notification:", slackError);
        // Don't fail the request if Slack fails
      }
    }

    return NextResponse.json({
      status: "awarded",
      badge,
      message: `Top Forecaster badge awarded to ${topPerformer.name} for ${month}`,
    });
  } catch (error: any) {
    console.error("Badge award error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to award badge" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/badges/top-forecaster?month=2025-01
 * 
 * Retrieves badge winners for a specific month
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    // In production, query database:
    // const badges = await db.badge.findMany({
    //   where: month ? { month } : undefined,
    //   orderBy: { awardedAt: "desc" },
    // });

    // For MVP, return empty array (badges stored client-side)
    return NextResponse.json({
      badges: [],
      message: "Badge history stored client-side. In production, this would query database.",
    });
  } catch (error: any) {
    console.error("Badge fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

