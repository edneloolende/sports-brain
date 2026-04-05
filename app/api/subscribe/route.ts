import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { addSubscriber } from '@/app/lib/subscribers'
import { sendWelcomeEmail } from '@/app/lib/email'

function getRatelimit() {
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:subscribe',
  })
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP — max 3 attempts per IP per hour
    // Wrapped defensively so a ratelimit failure never blocks a real subscriber
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
      const { success } = await getRatelimit().limit(ip)
      if (!success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    } catch (rlErr) {
      console.error('[subscribe] ratelimit error (continuing):', rlErr)
    }

    const { email, timezone } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const tz = (typeof timezone === 'string' && timezone.length > 0)
      ? timezone
      : 'UTC'

    const { token, alreadySubscribed } = await addSubscriber(email.toLowerCase().trim(), tz)

    // Send welcome email to new subscribers only
    if (!alreadySubscribed) {
      try {
        await sendWelcomeEmail(email.toLowerCase().trim(), token)
      } catch (e) {
        console.error('[subscribe] welcome email error:', e)
      }
    }

    return NextResponse.json({ ok: true, alreadySubscribed })
  } catch (err) {
    console.error('[subscribe]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
