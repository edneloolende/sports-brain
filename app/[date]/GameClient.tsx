'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import QuestionPanel from '@/app/components/QuestionPanel'
import CompletedQuestion from '@/app/components/CompletedQuestion'
import ProgressBar from '@/app/components/ProgressBar'
import type { DailyPuzzle, GameProgress, QuestionState, ScoreSubmission } from '@/app/lib/types'
import { calcQuestionScore } from '@/app/lib/gameLogic'
import { loadProgress, saveProgress, getPlayer } from '@/app/lib/storage'

const MAX_GUESSES = 2

function buildEmojiGrid(questions: GameProgress['questions']): string {
  return questions.map((q) => {
    if (q.status === 'lost') return '⬛⬛'
    if (q.guesses.length === 1 && !q.hintUsed) return '🟩🟩'
    if (q.guesses.length === 1 && q.hintUsed)  return '🟨🟩'
    return '🟨🟩'
  }).join('\n')
}

function ShareButton({ score, max, date, streak, questions }: {
  score: number; max: number; date: string; streak: number
  questions: GameProgress['questions']
}) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const grid = buildEmojiGrid(questions)
    const lines = [
      `⚽ Sports Brain — PL Edition`,
      formatDate(date),
      `${score}/${max} points`,
      '',
      grid,
    ]
    if (streak > 1) lines.push(``, `🔥 ${streak}-day streak`)
    lines.push('', 'sports-brain-delta.vercel.app')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleShare}
      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
    >
      {copied ? '✅ Copied!' : '📋 Share'}
    </button>
  )
}

function getNextPuzzleCountdown(date: string): string {
  const puzzleDate = new Date(date + 'T00:00:00Z')
  puzzleDate.setUTCDate(puzzleDate.getUTCDate() + 1)
  const now = new Date()
  const diff = puzzleDate.getTime() - now.getTime()
  if (diff <= 0) return 'Now'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

function Countdown({ date }: { date: string }) {
  const [time, setTime] = useState(() => getNextPuzzleCountdown(date))
  useEffect(() => {
    const interval = setInterval(() => setTime(getNextPuzzleCountdown(date)), 60000)
    return () => clearInterval(interval)
  }, [date])
  return <p className="text-lg font-black text-gray-700">{time}</p>
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface Props {
  puzzle: DailyPuzzle
}

export default function GameClient({ puzzle }: Props) {
  const [progress, setProgress] = useState<GameProgress>(() =>
    loadProgress(puzzle.date, puzzle.questions.length)
  )
  const [streak, setStreak] = useState(0)

  // Persist to localStorage on every change
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  // Submit score to server when game completes
  const submitScore = useCallback(async (finalProgress: GameProgress) => {
    const player = getPlayer()
    if (!player.id) return
    const totalScore = finalProgress.questions.reduce(
      (sum, q) => sum + calcQuestionScore(q),
      0
    )
    const submission: ScoreSubmission = {
      playerId: player.id,
      date: puzzle.date,
      score: totalScore,
      questions: finalProgress.questions.map((q) => ({
        won: q.status === 'won',
        hintUsed: q.hintUsed,
        guesses: q.guesses.length,
      })),
    }
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      })
      if (res.ok) {
        const data = await res.json()
        setStreak(data.streak ?? 0)
      }
    } catch {
      // Network error — streak stays 0, game still works
    }
  }, [puzzle.date])

  function updateQuestion(index: number, updater: (q: QuestionState) => QuestionState) {
    setProgress((prev) => {
      const questions = prev.questions.map((q, i) => i === index ? updater(q) : q)
      return { ...prev, questions }
    })
  }

  function handleGuessSubmit(guess: string) {
    const idx = progress.currentQuestion
    const question = puzzle.questions[idx]
    const current = progress.questions[idx]
    const isCorrect = guess.toUpperCase() === question.answer.toUpperCase()
    const newGuesses = [...current.guesses, guess.toUpperCase()]
    const isExhausted = newGuesses.length >= MAX_GUESSES
    const newStatus: QuestionState['status'] = isCorrect ? 'won' : isExhausted ? 'lost' : 'playing'

    updateQuestion(idx, () => ({
      ...current,
      guesses: newGuesses,
      status: newStatus,
    }))
  }

  function handleHintUsed() {
    const idx = progress.currentQuestion
    updateQuestion(idx, (q) => ({ ...q, hintUsed: true }))
  }

  function handleNext() {
    const nextIdx = progress.currentQuestion + 1
    const isLast = nextIdx >= puzzle.questions.length

    if (isLast) {
      // Game complete
      const finalProgress: GameProgress = {
        ...progress,
        completed: true,
      }
      setProgress(finalProgress)
      saveProgress(finalProgress)
      submitScore(finalProgress)
    } else {
      setProgress((prev) => ({ ...prev, currentQuestion: nextIdx }))
    }
  }

  const currentQ = progress.currentQuestion
  const currentState = progress.questions[currentQ]
  const currentQuestion = puzzle.questions[currentQ]

  const totalScore = progress.questions.reduce(
    (sum, q) => sum + calcQuestionScore(q),
    0
  )

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">Sports Brain</h1>
            <p className="text-sm font-semibold text-green-700 leading-tight">Premier League Edition</p>
            <p className="text-sm text-gray-500 mt-0.5">{formatDate(puzzle.date)}</p>
          </div>
          <ProgressBar
            total={puzzle.questions.length}
            current={progress.completed ? puzzle.questions.length - 1 : currentQ}
            statuses={progress.questions.map((q) => q.status)}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        {/* How to play */}
        {!progress.completed && (
          <p className="text-sm text-gray-400 text-center mb-5">
            One word answers. Two guesses per question. Correct answers earn points. Reveal the letter count for a clue, but it'll cost you one point.
          </p>
        )}
        {/* Completed questions history */}
        {(currentQ > 0 || progress.completed) && (
          <div className="flex flex-col gap-3 mb-6">
            {puzzle.questions.slice(0, progress.completed ? puzzle.questions.length : currentQ).map((q, i) => (
              <CompletedQuestion
                key={i}
                question={q}
                state={progress.questions[i]}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Final score + CTAs — shown after completion */}
        {progress.completed && (
          <div className="flex flex-col items-center gap-4 mt-2 mb-6">
            {/* Score */}
            <div className="text-center">
              <p className="font-black text-gray-900" style={{ fontSize: '3rem', lineHeight: 1.1 }}>
                {totalScore}
                <span className="font-normal text-gray-400" style={{ fontSize: '1.25rem' }}>/{puzzle.questions.length * 2}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">points</p>
            </div>

            {/* Streak */}
            {streak > 0 && (
              <p className="text-base font-semibold text-orange-500">
                🔥 {streak}-day streak
              </p>
            )}

            {/* Share + Leaderboard */}
            <div className="flex gap-3 w-full max-w-xs">
              <ShareButton
                score={totalScore}
                max={puzzle.questions.length * 2}
                date={puzzle.date}
                streak={streak}
                questions={progress.questions}
              />
              <Link
                href="/leaderboard"
                className="flex-1 py-3 text-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-sm"
              >
                🏆 Leaderboard
              </Link>
            </div>

            {/* Come back tomorrow */}
            <div className="text-center mt-2">
              <p className="text-xs text-gray-400">Next puzzle in</p>
              <Countdown date={puzzle.date} />
            </div>
          </div>
        )}

        {/* Active question */}
        {!progress.completed && (
          <QuestionPanel
            question={currentQuestion}
            questionIndex={currentQ}
            state={currentState}
            onGuessSubmit={handleGuessSubmit}
            onHintUsed={handleHintUsed}
            onNext={handleNext}
            isLast={currentQ === puzzle.questions.length - 1}
            totalScore={totalScore}
            maxScore={puzzle.questions.length * 2}
          />
        )}
      </main>

    </div>
  )
}
