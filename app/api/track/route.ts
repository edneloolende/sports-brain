import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Lightweight visit counter — called once per page load from the client.
// Stores daily totals in Redis as visits:YYYY-MM-DD.
// Stores unique visitors in Redis as visits:unique:YYYY-MM-DD (a Set of playerIds).

export async function POST(req: NextRequest) {
  try {
    const kv = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
    const { playerId } = await req.json().catch(() => ({}))

    await kv.incr(`visits:${today}`)
    if (playerId && typeof playerId === 'string') {
      await kv.sadd(`visits:unique:${today}`, playerId)
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Silently fail — never block the page for analytics
    return NextResponse.json({ ok: false })
  }
}
