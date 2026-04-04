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
      <head>
        {/* Disable scroll restoration so iOS Safari doesn't jump to a previous
            scroll position on refresh, which hides the top of the page */}
        <script dangerouslySetInnerHTML={{ __html: "if('scrollRestoration' in history) history.scrollRestoration='manual';" }} />
      </head>
      <body className="min-h-[100svh] antialiased font-[var(--font-inter)] flex flex-col bg-[#0c1018]">
        <div className="flex-1 pb-10">{children}</div>
        <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-4 py-3 text-xs text-white/25 bg-[#0c1018]">
          <span>Made by ROO</span>
          <a
            href="mailto:behindthearsenal@gmail.com?subject=Sporty Genius feedback"
            className="hover:text-white/50 transition-colors"
          >
            💬 Share Feedback
          </a>
        </footer>
      </body>
    </html>
  )
}
