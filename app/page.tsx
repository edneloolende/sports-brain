import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to today's puzzle using UTC date
  const today = new Date().toISOString().slice(0, 10)
  redirect(`/${today}`)
}
