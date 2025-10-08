import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { businessName, location, website } = await request.json()

    if (!businessName || !location) {
      return NextResponse.json(
        { error: 'Business name and location are required' },
        { status: 400 }
      )
    }

    // Create a comprehensive prompt for AI analysis
    const prompt = `Analyze the AI visibility and citation potential for "${businessName}" located in "${location}".

Business Details:
- Name: ${businessName}
- Location: ${location}
- Website: ${website || 'Not provided'}

Please provide a comprehensive analysis including:

1. AI Citation Score (0-100): How likely is this business to be cited in AI responses?
2. Visibility Factors: What makes this business more or less likely to appear in AI results?
3. Optimization Opportunities: Specific recommendations to improve AI visibility
4. Competitive Analysis: How this business compares to competitors in AI search
5. Content Gaps: What information is missing that would help AI systems recommend this business
6. Local SEO Factors: Location-specific factors that affect AI visibility
7. Trust Signals: Elements that build credibility for AI systems
8. Action Items: Prioritized list of improvements

Format your response as a structured analysis with clear sections and actionable insights.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an AI visibility expert specializing in helping local businesses improve their presence in AI search results. Provide detailed, actionable analysis with specific recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const analysis = completion.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No analysis generated')
    }

    // Parse the analysis into structured data
    const structuredAnalysis = parseAnalysis(analysis)

    return NextResponse.json({
      businessName,
      location,
      website,
      analysis: structuredAnalysis,
      rawAnalysis: analysis,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze business', details: error.message },
      { status: 500 }
    )
  }
}

function parseAnalysis(analysis: string) {
  // Extract AI Citation Score
  const scoreMatch = analysis.match(/AI Citation Score[:\s]*(\d+)/i)
  const aiCitationScore = scoreMatch ? parseInt(scoreMatch[1]) : 0

  // Extract sections using regex patterns
  const sections = {
    aiCitationScore,
    visibilityFactors: extractSection(analysis, /visibility factors?/i),
    optimizationOpportunities: extractSection(analysis, /optimization opportunities?/i),
    competitiveAnalysis: extractSection(analysis, /competitive analysis/i),
    contentGaps: extractSection(analysis, /content gaps?/i),
    localSeoFactors: extractSection(analysis, /local seo factors?/i),
    trustSignals: extractSection(analysis, /trust signals?/i),
    actionItems: extractSection(analysis, /action items?/i),
  }

  return sections
}

function extractSection(text: string, pattern: RegExp): string {
  const match = text.match(new RegExp(`${pattern.source}[\\s\\S]*?(?=\\n\\n|$)`, 'i'))
  return match ? match[0].replace(pattern, '').trim() : ''
}
