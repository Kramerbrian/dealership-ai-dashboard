import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const intents = (searchParams.get('q')||'buy,service,trade').split(',');
  
  // synthetic inclusion rate per intent
  const details = intents.map(i=>({ 
    intent: i.trim(), 
    included: Math.random()>.4, 
    lastSeen: new Date().toISOString() 
  }));
  
  const includedCount = details.filter(d=>d.included).length;
  
  return NextResponse.json({ 
    intentsTested: details.length, 
    includedCount, 
    inclusionRate: Math.round(100*includedCount/details.length), 
    details, 
    sampledAt: new Date().toISOString() 
  });
}
