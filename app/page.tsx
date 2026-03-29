'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Use the user's local date so players in western timezones
    // don't see yesterday's puzzle after their local midnight.
    const d = new Date()
    const today = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
    router.replace(`/${today}`)
  }, [router])

  return null
}
