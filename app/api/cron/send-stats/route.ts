import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { getAllSubscriberEmails } from '@/app/lib/subscribers'
import { sendStatsEmail } from '@/app/lib/email'

// Runs every morning via Vercel Cron (see vercel.json).
// Sends a daily stats digest to the site owner.

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const kv = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)

  const [visitsToday, visitsYesterday, uniqueToday, uniqueYesterday, allEmails] = await Promise.all([
    kv.get<number>(`visits:${today}`).then((v) => v ?? 0),
    kv.get<number>(`visits:${yesterday}`).then((v) => v ?? 0),
    kv.scard(`visits:unique:${today}`).then((v) => v ?? 0),
    kv.scard(`visits:unique:${yesterday}`).then((v) => v ?? 0),
    getAllSubscriberEmails(),
  ])

  // Count new subscribers today by checking their subscribedAt date
  let newSubscribersToday = 0
  for (const email of allEmails) {
    const data = await kv.get(`email:sub:${email}`)
    if (data) {
      const sub = typeof data === 'string' ? JSON.parse(data) : data as { subscribedAt?: string }
      if (sub.subscribedAt?.startsWith(today)) newSubscribersToday++
    }
  }

  await sendStatsEmail({
    date: today,
    visitsToday,
    visitsYesterday,
    uniqueToday,
    uniqueYesterday,
    totalSubscribers: allEmails.length,
    newSubscribersToday,
  })

  return NextResponse.json({ ok: true })
}
