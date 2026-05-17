import { notFound } from 'next/navigation'
import { PUZZLES } from '@/app/data/puzzles'
import GameClient from './GameClient'

interface Props {
  params: Promise<{ date: string }>
}

export default async function PuzzlePage({ params }: Props) {
  const { date } = await params

  // Validate format and that it's a real calendar date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()
  const parsed = new Date(`${date}T00:00:00`)
  if (isNaN(parsed.getTime())) notFound()

  const puzzle = PUZZLES.find((p) => p.date === date)

  // No puzzle for this date — show a friendly message instead of a raw 404
  if (!puzzle) {
    const today = new Date()
    const todayStr = [
      today.getUTCFullYear(),
      String(today.getUTCMonth() + 1).padStart(2, '0'),
      String(today.getUTCDate()).padStart(2, '0'),
    ].join('-')
    const isFuture = date > todayStr
    return (
      <div className="min-h-screen bg-[#14161c] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">{isFuture ? '⏳' : '📭'}</p>
        <h1 className="text-xl font-black text-white">
          {isFuture ? "This puzzle isn't ready yet" : 'No puzzle for this date'}
        </h1>
        <p className="text-sm text-white/50">
          {isFuture
            ? 'Come back on the day to play.'
            : "We don't have a puzzle for that date."}
        </p>
        <a
          href={`/${todayStr}`}
          className="mt-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
        >
          Play today&apos;s puzzle
        </a>
      </div>
    )
  }

  return <GameClient puzzle={puzzle} />
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params
  return {
    title: `Sporty Genius · ${date}`,
    description: 'Daily football trivia — 5 questions, 2 guesses each',
  }
}
