import { Resend } from 'resend'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLocalDateInTimezone(timezone: string): string {
  // Returns YYYY-MM-DD in the given timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function getLocalHourInTimezone(timezone: string): number {
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10,
  )
}

// ─── Send ─────────────────────────────────────────────────────────────────────

export async function sendReminderEmail(
  email: string,
  unsubscribeToken: string,
  puzzleDate: string,
): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const puzzleUrl = `${origin}/${puzzleDate}`
  const unsubscribeUrl = `${origin}/unsubscribe?token=${unsubscribeToken}`

  const { error } = await resend.emails.send({
    from: 'Sporty Genius <quiz@sportygenius.com>',
    to: email,
    subject: "⚽ Today's Sporty Genius puzzle is live",
    html: buildEmailHtml(puzzleUrl, puzzleDate, unsubscribeUrl),
  })

  if (error) console.error('[email] Send failed:', error)
  return !error
}

// ─── Template ─────────────────────────────────────────────────────────────────

function buildEmailHtml(puzzleUrl: string, date: string, unsubscribeUrl: string): string {
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Today's Sporty Genius puzzle is live</title>
</head>
<body style="margin:0;padding:0;background:#0c1018;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c1018;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#131927;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">

          <!-- Green stripe -->
          <tr><td style="background:#16a34a;height:4px;font-size:0;">&nbsp;</td></tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Sporty Genius</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#4ade80;">Men's Football</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.4);">${formattedDate}</p>
              <p style="margin:0 0 28px;font-size:19px;font-weight:700;color:#ffffff;line-height:1.35;">
                Today's puzzle is ready.<br>Five questions. Two guesses each.
              </p>
              <a href="${puzzleUrl}"
                 style="display:inline-block;background:#16a34a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:12px;letter-spacing:0.1px;">
                Play now &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 20px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.6;">
                You signed up for daily puzzle reminders from Sporty Genius.<br>
                <a href="${unsubscribeUrl}" style="color:rgba(255,255,255,0.35);text-decoration:underline;">
                  Unsubscribe in one click
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
