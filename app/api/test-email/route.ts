import { NextRequest, NextResponse } from 'next/server'
import { sendReminderEmail } from '@/app/lib/email'

// Temporary endpoint to verify Resend is configured correctly.
// Remove after confirming emails work.
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to')
  if (!to) return NextResponse.json({ error: 'Missing ?to= param' }, { status: 400 })

  const today = new Date().toISOString().slice(0, 10)
  const ok = await sendReminderEmail(to, 'test-token', today)

  return NextResponse.json({ ok, to, date: today })
}
