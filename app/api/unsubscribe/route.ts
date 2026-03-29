import { NextRequest, NextResponse } from 'next/server'
import { removeSubscriberByToken } from '@/app/lib/subscribers'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/unsubscribe?error=missing', req.url))
  }

  try {
    const removed = await removeSubscriberByToken(token)
    const status = removed ? 'success' : 'notfound'
    return NextResponse.redirect(new URL(`/unsubscribe?status=${status}`, req.url))
  } catch (err) {
    console.error('[unsubscribe]', err)
    return NextResponse.redirect(new URL('/unsubscribe?error=server', req.url))
  }
}
