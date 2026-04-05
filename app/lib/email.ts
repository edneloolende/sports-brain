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

export async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string,
): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const unsubscribeUrl = `${origin}/unsubscribe?token=${unsubscribeToken}`

  const { error } = await resend.emails.send({
    from: 'Sporty Genius <quiz@sportygenius.com>',
    to: email,
    subject: "⚽ You're in — Sporty Genius",
    html: buildWelcomeHtml(unsubscribeUrl),
  })

  if (error) console.error('[email] Welcome send failed:', error)
  return !error
}

export async function sendStatsEmail(stats: {
  date: string
  visitsToday: number
  visitsYesterday: number
  uniqueToday: number
  uniqueYesterday: number
  totalSubscribers: number
  newSubscribersToday: number
}): Promise<boolean> {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'Sporty Genius <quiz@sportygenius.com>',
    to: 'behindthearsenal@gmail.com',
    subject: `📊 Sporty Genius stats — ${stats.date}`,
    html: buildStatsHtml(stats),
  })

  if (error) console.error('[email] Stats send failed:', error)
  return !error
}

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

// ─── Daily taglines ───────────────────────────────────────────────────────────

const TAGLINES = [
  'Football heritage.',
  'Can you do it on a cold night in Stoke?',
  'The beautiful game. The brutal quiz.',
  'Form is temporary. Trivia is forever.',
  'No VAR. No replays. Just you.',
  'Taxi for the uninformed.',
  'The table never lies.',
  "Lads, it's Sunday morning.",
  'Do I not like that.',
  "The gaffer's watching.",
  'Who are ya?',
  'Five questions. No excuses.',
  'Prove you were watching.',
  "History doesn't forget. Do you?",
  "It's a game of two halves. This is one of them.",
  'The pitch is yours.',
  'No substitutions allowed.',
  'Show your work.',
  'Some people are on the pitch…',
  "Warm-up's over.",
  'The whistle\'s blown.',
  'Glory awaits the knowledgeable.',
  'Settle it. Once and for all.',
  'The dugout wants answers.',
  "You'll never guess alone.",
  'Name a better feeling. We\'ll wait.',
  'Extra time? Not today.',
  "Legends never fade. Do you remember them?",
  'Time to earn your stripes.',
]

function getDailyTagline(date: string): string {
  // Derive a stable day index from the date string (YYYY-MM-DD)
  const [year, month, day] = date.split('-').map(Number)
  // Simple deterministic hash: days since a fixed epoch
  const epoch = new Date(2026, 2, 25) // 2026-03-25, day 0
  const d = new Date(year, month - 1, day)
  const dayIndex = Math.round((d.getTime() - epoch.getTime()) / 86_400_000)
  return TAGLINES[((dayIndex % TAGLINES.length) + TAGLINES.length) % TAGLINES.length]
}

// ─── Templates ────────────────────────────────────────────────────────────────

function buildWelcomeHtml(unsubscribeUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>You're in — Sporty Genius</title>
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
              <p style="margin:0 0 4px;font-size:19px;font-weight:700;color:#ffffff;line-height:1.35;">
                You're in.
              </p>
              <p style="margin:0 0 6px;font-size:16px;font-weight:500;color:rgba(255,255,255,0.55);line-height:1.5;">
                Your daily Sporty Genius puzzle arrives at the same time each day.
              </p>
              <p style="margin:0 0 28px;font-size:16px;font-weight:500;color:rgba(255,255,255,0.55);line-height:1.5;">
                Five questions. Two guesses each. Get in.
              </p>
              <p style="margin:0 0 28px;font-size:13px;color:rgba(255,255,255,0.3);line-height:1.6;">
                On Gmail? Drag this email to your Primary tab — it tells Google you want it there, and keeps future puzzles out of spam.
              </p>
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

function buildStatsHtml(stats: {
  date: string
  visitsToday: number
  visitsYesterday: number
  uniqueToday: number
  uniqueYesterday: number
  totalSubscribers: number
  newSubscribersToday: number
}): string {
  const formattedDate = new Date(`${stats.date}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  function row(label: string, value: number, highlight = false): string {
    return `
      <tr>
        <td style="padding:10px 0;font-size:14px;color:rgba(255,255,255,0.5);border-bottom:1px solid rgba(255,255,255,0.05);">${label}</td>
        <td style="padding:10px 0;font-size:${highlight ? '20' : '16'}px;font-weight:${highlight ? '700' : '600'};color:${highlight ? '#4ade80' : '#ffffff'};text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${value.toLocaleString()}</td>
      </tr>`
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sporty Genius stats</title>
</head>
<body style="margin:0;padding:0;background:#0c1018;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c1018;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#131927;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">

          <tr><td style="background:#16a34a;height:4px;font-size:0;">&nbsp;</td></tr>

          <tr>
            <td style="padding:32px 32px 0 32px;">
              <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Sporty Genius</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:#4ade80;">Daily stats</p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 0 32px;">
              <p style="margin:0 0 20px;font-size:13px;color:rgba(255,255,255,0.4);">${formattedDate}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Unique visitors today', stats.uniqueToday, true)}
                ${row('Total visits today', stats.visitsToday)}
                ${row('Unique visitors yesterday', stats.uniqueYesterday)}
                ${row('Total visits yesterday', stats.visitsYesterday)}
                ${row('New subscribers today', stats.newSubscribersToday)}
                ${row('Total subscribers', stats.totalSubscribers)}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 16px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">Sporty Genius · sent automatically each morning</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildEmailHtml(puzzleUrl: string, date: string, unsubscribeUrl: string): string {
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const tagline = getDailyTagline(date)

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
              <p style="margin:0 0 4px;font-size:19px;font-weight:700;color:#ffffff;line-height:1.35;">
                Today's puzzle is ready.
              </p>
              <p style="margin:0 0 28px;font-size:16px;font-weight:500;color:rgba(255,255,255,0.55);line-height:1.4;">
                ${tagline}
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
