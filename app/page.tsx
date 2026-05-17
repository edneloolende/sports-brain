import { PUZZLES } from '@/app/data/puzzles'
import GameClient from './[date]/GameClient'

function getTodayStr() {
  const d = new Date()
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-')
}

export default function Home() {
  const today = getTodayStr()
  const puzzle = PUZZLES.find((p) => p.date === today)

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-[#14161c] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">📭</p>
        <h1 className="text-xl font-black text-white">No puzzle today</h1>
        <p className="text-sm text-white/50">Check back tomorrow.</p>
      </div>
    )
  }

  return <GameClient puzzle={puzzle} />
}

export const metadata = {
  title: "Sporty Genius — Daily Football Quiz",
  description: 'Daily football trivia — 5 questions, 2 guesses each',
}
