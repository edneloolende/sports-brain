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
      <body className="min-h-full antialiased font-[var(--font-inter)] flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="text-center py-4 text-xs text-gray-400">
          made by Roy Opata Olende ⚽
        </footer>
      </body>
    </html>
  )
}
