import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscriberEmails, getSubscriber, markSent } from '@/app/lib/subscribers'
import { sendReminderEmail, getLocalHourInTimezone, getLocalDateInTimezone } from '@/app/lib/email'

// Runs every hour via Vercel Cron (see vercel.json).
// Sends to subscribers where the local hour is currently 8 (8am–8:59am).

export async function GET(req: NextRequest) {
  // Protect the endpoint — Vercel sends the CRON_SECRET as a bearer token
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const emails = await getAllSubscriberEmails()
  let sent = 0
  let skipped = 0
  const errors: string[] = []

  for (const email of emails) {
    try {
      const sub = await getSubscriber(email)
      if (!sub) continue

      const localHour = getLocalHourInTimezone(sub.timezone)
      const localDate = getLocalDateInTimezone(sub.timezone)

      // Only send during the 8am hour and if we haven't already sent today
      if (localHour !== 8) { skipped++; continue }
      if (sub.lastSentDate === localDate) { skipped++; continue }

      const ok = await sendReminderEmail(email, sub.token, localDate)
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
