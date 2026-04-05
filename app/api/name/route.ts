import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function getRatelimit() {
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'rl:name',
  })
}

export async function POST(req: NextRequest) {
  try {
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
      const { success } = await getRatelimit().limit(ip)
      if (!success) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
    } catch (rlErr) {
      console.error('[name] ratelimit error (continuing):', rlErr)
    }

    const { playerId, name } = await req.json()

    if (!playerId || !name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const cleaned = name.trim().slice(0, 40)

    try {
      const { setDisplayName } = await import('@/app/lib/kv')
      await setDisplayName(playerId, cleaned)
    } catch {
      // KV not configured — graceful fallback
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
