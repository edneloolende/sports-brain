import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/app/lib/subscribers'

export async function POST(req: NextRequest) {
  try {
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

    const { alreadySubscribed } = await addSubscriber(email.toLowerCase().trim(), tz)

    return NextResponse.json({ ok: true, alreadySubscribed })
  } catch (err) {
    console.error('[subscribe]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
