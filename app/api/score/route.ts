import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { ScoreSubmission } from '@/app/lib/types'

function getRatelimit() {
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'rl:score',
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
      console.error('[score] ratelimit error (continuing):', rlErr)
    }

    const body = await req.json() as ScoreSubmission

    if (!body.playerId || !body.date || typeof body.score !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Basic bounds check — score can't exceed 2 points per question × 5 questions
    if (body.score < 0 || body.score > 10) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    // Vercel KV may not be configured yet (local dev without .env.local)
    // Gracefully fall back so the game still works without KV
    let streak = 0
    try {
      const { submitScore, getPlayerStats } = await import('@/app/lib/kv')
      await submitScore(body)
      const stats = await getPlayerStats(body.playerId)
      streak = stats.streak
    } catch {
      // KV not configured — game works, leaderboard won't
    }

    return NextResponse.json({ ok: true, streak })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
