import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!
})

export async function GET() {
  const [
    pageViews,
    quickAudits,
    formStarts,
    formCompletes,
    exitIntentShows,
    exitIntentConverts
  ] = await Promise.all([
    redis.get('metrics:page_views'),
    redis.get('metrics:quick_audits'),
    redis.get('metrics:form_starts'),
    redis.get('metrics:form_completes'),
    redis.get('metrics:exit_intent_shows'),
    redis.get('metrics:exit_intent_converts')
  ])

  const metrics = {
    page_views: Number(pageViews || 0),
    quick_audit_rate: Number(quickAudits || 0) / Number(pageViews || 1),
    form_start_rate: Number(formStarts || 0) / Number(pageViews || 1),
    form_completion_rate: Number(formCompletes || 0) / Number(formStarts || 1),
    exit_intent_conversion: Number(exitIntentConverts || 0) / Number(exitIntentShows || 1),
    overall_conversion: Number(formCompletes || 0) / Number(pageViews || 1)
  }

  return NextResponse.json(metrics)
}