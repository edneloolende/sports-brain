import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
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
