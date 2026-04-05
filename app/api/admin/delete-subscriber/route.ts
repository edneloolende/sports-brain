import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// Temporary admin endpoint — delete a subscriber so they can re-test the welcome email.
// Protected by CRON_SECRET. Remove this file when no longer needed.

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const kv = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const normalized = email.toLowerCase().trim()
  const data = await kv.get<string>(`email:sub:${normalized}`)
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sub = JSON.parse(data)
  await kv.del(`email:sub:${normalized}`)
  await kv.srem('email:subs', normalized)
  await kv.del(`email:token:${sub.token}`)

  return NextResponse.json({ ok: true, deleted: normalized })
}
