import { NextRequest, NextResponse } from 'next/server';
import { cacheGet, cacheSet, cityKeyFromDomain } from '@/lib/cache';
import { rateLimit } from '@/lib/rateLimit';

function synthScore(seed:number){ const rand = (min:number,max:number)=> Math.floor(min + (max-min)*(Math.abs(Math.sin(seed+=0.73))%1)); return rand; }

// Pooled GEO approach: cache per cityKey for 24h, then apply ±5% dealer variance
export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url);
  const domain = (searchParams.get('domain')||'').trim();
  if (!domain) return NextResponse.json({ ok:false, error:'Missing domain' },{ status:400 });

  const ip = req.headers.get('x-forwarded-for') || 'anon';
  const rl = rateLimit(`analyze:${ip}`, 20, 60_000); // 20 req/min/IP
  if (!rl.allowed) return NextResponse.json({ ok:false, error:'Rate limit', retryIn: rl.retryIn }, { status:429 });

  const cityKey = cityKeyFromDomain(domain);
  const poolKey = `dai:pool:${cityKey}`;
  let pooled = await cacheGet(poolKey);

  if (!pooled){
    // build a pooled baseline once per cityKey
    let seed = cityKey.split('').reduce((a,c)=>a+c.charCodeAt(0), 0);
    const r = synthScore(seed);
    const mkPlatform = (name:string, min:number, max:number)=>({ name, score: r(min,max), status: (v=> v>=90?'Excellent': v>=80?'Good':'Fair') as any })(r(min,max));
    const platforms = [
      { name:'ChatGPT', score: r(88,95), status:'Excellent' },
      { name:'Claude', score: r(84,92), status:'Good' },
      { name:'Perplexity', score: r(78,88), status:'Good' },
      { name:'Gemini', score: r(72,86), status:'Fair' },
      { name:'Copilot', score: r(68,82), status:'Fair' }
    ];
    const issues = [
      { title:'Missing AutoDealer Schema', impact: r(7000,9500), effort:'2 hours' },
      { title:'Low Review Response Rate', impact: r(2500,3800), effort:'1 hour' },
      { title:'Incomplete FAQ Schema', impact: r(1800,3000), effort:'3 hours' }
    ];
    const overall = Math.round(platforms.reduce((s,p)=>s+p.score,0)/platforms.length);
    pooled = { overall, rank: 2, of: 8, platforms, issues };
    await cacheSet(poolKey, pooled, 60*60*24);
  }
  // Apply dealer-specific variance ±5%
  const variance = (domain.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%11 - 5) / 100; // -0.05..+0.05
  const vScore = (n:number)=> Math.max(60, Math.min(99, Math.round(n*(1+variance)) ));
  const vMoney = (n:number)=> Math.max(1200, Math.round(n*(1+variance)) );
  const result = {
    ok:true,
    dealership: domain.replace(/https?:\/\//,'').split('/')[0],
    location: cityKey.replace('us_','').replace(/_/g,' ').toUpperCase(),
    overall: vScore(pooled.overall),
    rank: pooled.rank, of: pooled.of,
    platforms: pooled.platforms.map((p:any)=> ({ ...p, score: vScore(p.score) })),
    issues: pooled.issues.map((i:any)=> ({ ...i, impact: vMoney(i.impact) }))
  };
  return NextResponse.json(result);
}
