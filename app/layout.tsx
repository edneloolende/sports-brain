import type { Metadata } from 'next'
import { Inter, Bitter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bitter = Bitter({ subsets: ['latin'], variable: '--font-lora' })

export const metadata: Metadata = {
  title: 'Sports Brain — Premier League Edition',
  description: 'Daily Premier League trivia — 5 questions, 2 guesses each',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable} h-full`}>
      <body className="min-h-full antialiased font-[var(--font-inter)]">{children}</body>
    </html>
  )
}
