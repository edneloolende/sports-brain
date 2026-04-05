// Subscriber storage — backed by Upstash Redis KV

export interface Subscriber {
  email: string
  timezone: string       // IANA tz string e.g. "Europe/London"
  subscribedAt: string   // ISO timestamp
  token: string          // UUID for one-click unsubscribe
  lastSentDate?: string  // YYYY-MM-DD in subscriber's timezone — prevents double-send
}

async function getKV() {
  const { Redis } = await import('@upstash/redis')
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

function parseSub(raw: unknown): Subscriber | null {
  if (!raw) return null
  if (typeof raw === 'object') return raw as Subscriber
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as Subscriber } catch { return null }
  }
  return null
}

export async function addSubscriber(email: string, timezone: string): Promise<{ token: string; alreadySubscribed: boolean }> {
  const kv = await getKV()

  // Idempotent — if already subscribed return the existing token
  const existing = await kv.get(`email:sub:${email}`)
  if (existing) {
    const sub = parseSub(existing)
    if (sub?.token) return { token: sub.token, alreadySubscribed: true }
  }

  const token = crypto.randomUUID()
  const subscriber: Subscriber = {
    email,
    timezone,
    subscribedAt: new Date().toISOString(),
    token,
  }
  await kv.set(`email:sub:${email}`, JSON.stringify(subscriber))
  await kv.sadd('email:subs', email)
  await kv.set(`email:token:${token}`, email)
  return { token, alreadySubscribed: false }
}

export async function removeSubscriberByToken(token: string): Promise<boolean> {
  const kv = await getKV()
  const email = await kv.get<string>(`email:token:${token}`)
  if (!email) return false
  await kv.del(`email:sub:${email}`)
  await kv.srem('email:subs', email)
  await kv.del(`email:token:${token}`)
  return true
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  const kv = await getKV()
  const data = await kv.get(`email:sub:${email}`)
  return parseSub(data)
}

export async function getAllSubscriberEmails(): Promise<string[]> {
  const kv = await getKV()
  const members = await kv.smembers('email:subs')
  return members as string[]
}

export async function markSent(email: string, date: string): Promise<void> {
  const kv = await getKV()
  const data = await kv.get(`email:sub:${email}`)
  const sub = parseSub(data)
  if (!sub) return
  sub.lastSentDate = date
  await kv.set(`email:sub:${email}`, JSON.stringify(sub))
}
