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
    <html lang="en" className={`${inter.variable} ${bitter.variable} bg-[#0c1018]`}>
      <body className="min-h-dvh antialiased font-[var(--font-inter)] flex flex-col bg-[#0c1018]">
        <div className="flex-1 pb-10">{children}</div>
        <footer className="fixed bottom-0 left-0 right-0 text-center py-3 text-xs text-white/25 bg-[#0c1018]">
          Made by ROO ⚽
        </footer>
      </body>
    </html>
  )
}
