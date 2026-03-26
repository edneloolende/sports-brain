import { notFound } from 'next/navigation'
import { PUZZLES } from '@/app/data/puzzles'
import GameClient from './GameClient'

interface Props {
  params: Promise<{ date: string }>
}

export default async function PuzzlePage({ params }: Props) {
  const { date } = await params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound()

  const puzzle = PUZZLES.find((p) => p.date === date)
  if (!puzzle) notFound()

  return <GameClient puzzle={puzzle} />
}

export async function generateMetadata({ params }: Props) {
  const { date } = await params
  return {
    title: `PL Daily · ${date}`,
    description: 'Daily Premier League trivia — 5 questions, 2 guesses each',
  }
}
