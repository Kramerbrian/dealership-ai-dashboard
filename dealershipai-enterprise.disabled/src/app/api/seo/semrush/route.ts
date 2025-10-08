import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    const database = searchParams.get('database') || 'us'
    const reportType = searchParams.get('reportType') || 'domain_ranks'

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.SEMRUSH_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SEMrush API key not configured' },
        { status: 500 }
      )
    }

    // Get domain overview
    const overviewUrl = `https://api.semrush.com/?type=domain_ranks&key=${apiKey}&domain=${domain}&database=${database}&export_columns=Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac,FKn,FKt,FKc`
    
    const overviewResponse = await fetch(overviewUrl)
    if (!overviewResponse.ok) {
      throw new Error(`SEMrush API error: ${overviewResponse.statusText}`)
    }

    const overviewData = await overviewResponse.text()
    const overviewRows = overviewData.trim().split('\n').slice(1) // Skip header

    // Get organic keywords
    const organicUrl = `https://api.semrush.com/?type=domain_organic&key=${apiKey}&domain=${domain}&database=${database}&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td`
    
    const organicResponse = await fetch(organicUrl)
    const organicData = organicResponse.ok ? await organicResponse.text() : ''
    const organicRows = organicData ? organicData.trim().split('\n').slice(1) : []

    // Get paid keywords
    const paidUrl = `https://api.semrush.com/?type=domain_adwords&key=${apiKey}&domain=${domain}&database=${database}&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td`
    
    const paidResponse = await fetch(paidUrl)
    const paidData = paidResponse.ok ? await paidResponse.text() : ''
    const paidRows = paidData ? paidData.trim().split('\n').slice(1) : []

    // Get backlinks
    const backlinksUrl = `https://api.semrush.com/?type=backlinks_overview&key=${apiKey}&target=${domain}&target_type=domain&export_columns=total_num,domains_num,urls_num,ip_num,ipclassc_num,follows_num,nofollows_num,sponsored_num,ugc_num,texts_num,images_num,forms_num,frames_num`
    
    const backlinksResponse = await fetch(backlinksUrl)
    const backlinksData = backlinksResponse.ok ? await backlinksResponse.text() : ''
    const backlinksRows = backlinksData ? backlinksData.trim().split('\n').slice(1) : []

    // Parse overview data
    const overview = overviewRows.length > 0 ? parseOverviewRow(overviewRows[0]) : null

    // Parse organic keywords (top 20)
    const organicKeywords = organicRows.slice(0, 20).map(row => parseKeywordRow(row))

    // Parse paid keywords (top 20)
    const paidKeywords = paidRows.slice(0, 20).map(row => parseKeywordRow(row))

    // Parse backlinks data
    const backlinks = backlinksRows.length > 0 ? parseBacklinksRow(backlinksRows[0]) : null

    return NextResponse.json({
      domain,
      database,
      overview,
      organicKeywords,
      paidKeywords,
      backlinks,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('SEMrush API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEMrush data', details: error.message },
      { status: 500 }
    )
  }
}

function parseOverviewRow(row: string) {
  const columns = row.split(';')
  return {
    database: columns[0],
    domain: columns[1],
    rank: parseInt(columns[2]) || 0,
    organicTraffic: parseInt(columns[3]) || 0,
    organicKeywords: parseInt(columns[4]) || 0,
    organicCost: parseFloat(columns[5]) || 0,
    adTraffic: parseInt(columns[6]) || 0,
    adKeywords: parseInt(columns[7]) || 0,
    adCost: parseFloat(columns[8]) || 0,
    featuredKeywords: parseInt(columns[9]) || 0,
    featuredTraffic: parseInt(columns[10]) || 0,
    featuredCost: parseFloat(columns[11]) || 0,
  }
}

function parseKeywordRow(row: string) {
  const columns = row.split(';')
  return {
    keyword: columns[0],
    position: parseInt(columns[1]) || 0,
    previousPosition: parseInt(columns[2]) || 0,
    searchVolume: parseInt(columns[3]) || 0,
    cpc: parseFloat(columns[4]) || 0,
    competition: parseFloat(columns[5]) || 0,
    url: columns[6],
    traffic: parseInt(columns[7]) || 0,
    trafficCost: parseFloat(columns[8]) || 0,
    competitionLevel: columns[9],
    numberOfResults: parseInt(columns[10]) || 0,
    trend: columns[11],
  }
}

function parseBacklinksRow(row: string) {
  const columns = row.split(';')
  return {
    totalBacklinks: parseInt(columns[0]) || 0,
    referringDomains: parseInt(columns[1]) || 0,
    referringUrls: parseInt(columns[2]) || 0,
    referringIps: parseInt(columns[3]) || 0,
    referringClassC: parseInt(columns[4]) || 0,
    followBacklinks: parseInt(columns[5]) || 0,
    nofollowBacklinks: parseInt(columns[6]) || 0,
    sponsoredBacklinks: parseInt(columns[7]) || 0,
    ugcBacklinks: parseInt(columns[8]) || 0,
    textBacklinks: parseInt(columns[9]) || 0,
    imageBacklinks: parseInt(columns[10]) || 0,
    formBacklinks: parseInt(columns[11]) || 0,
    frameBacklinks: parseInt(columns[12]) || 0,
  }
}
