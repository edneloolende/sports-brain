import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getLeaderboard } = await import('@/app/lib/kv')
    const entries = await getLeaderboard(20)
    return NextResponse.json({ entries }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    // KV not configured
    return NextResponse.json({ entries: [] })
  }
}
