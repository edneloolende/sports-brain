import type { Metadata } from 'next'
import { Inter, Bitter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const bitter = Bitter({ subsets: ['latin'], variable: '--font-lora' })

export const metadata: Metadata = {
  title: 'Sporty Genius — Men\'s Football',
  description: 'Daily football trivia — 5 questions, 2 guesses each',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bitter.variable} h-full bg-[#0c1018]`}>
      <body className="min-h-full antialiased font-[var(--font-inter)] flex flex-col bg-[#0c1018]">
        <div className="flex-1">{children}</div>
        <footer className="text-center py-4 text-xs text-white/25">
          Made by{' '}
          <a
            href="https://www.linkedin.com/in/olende/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-white/40 hover:text-white/60 transition-colors"
          >
            Roy Opata Olende
          </a>{' '}
          ⚽
        </footer>
      </body>
    </html>
  )
}
