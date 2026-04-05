import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscriberEmails, getSubscriber, markSent } from '@/app/lib/subscribers'
import { sendReminderEmail, getLocalDateInTimezone } from '@/app/lib/email'

// Runs daily at 8am UTC via Vercel Cron (see vercel.json).
// Sends to all subscribers who haven't received today's puzzle yet.

export async function GET(req: NextRequest) {
  // Protect the endpoint — Vercel sends the CRON_SECRET as a bearer token
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
  const emails = await getAllSubscriberEmails()
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const email of emails) {
    try {
      const sub = await getSubscriber(email)
      if (!sub) continue

      // Skip if already sent today
      const localDate = getLocalDateInTimezone(sub.timezone)
      if (sub.lastSentDate === localDate) { skipped++; continue }

      const ok = await sendReminderEmail(email, sub.token, today)
      if (ok) {
        await markSent(email, localDate)
        sent++
      } else {
        errors.push(email)
      }
    } catch (err) {
      console.error(`[cron] Error processing ${email}:`, err)
      errors.push(email)
    }
  }

  console.log(`[cron] sent=${sent} skipped=${skipped} errors=${errors.length}`)
  return NextResponse.json({ ok: true, sent, skipped, errors })
}
