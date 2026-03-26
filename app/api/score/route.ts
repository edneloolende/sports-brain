import { NextRequest, NextResponse } from 'next/server'
import type { ScoreSubmission } from '@/app/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ScoreSubmission

    if (!body.playerId || !body.date || typeof body.score !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
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
