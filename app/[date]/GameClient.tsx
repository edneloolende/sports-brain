'use client'

import { useState, useEffect, useCallback } from 'react'
import QuestionPanel from '@/app/components/QuestionPanel'
import CompletedQuestion from '@/app/components/CompletedQuestion'
import ProgressBar from '@/app/components/ProgressBar'
import type { DailyPuzzle, GameProgress, Question, QuestionState, ScoreSubmission } from '@/app/lib/types'
import { calcQuestionScore, evaluateGuess } from '@/app/lib/gameLogic'
import { loadProgress, saveProgress, getPlayer } from '@/app/lib/storage'

const MAX_GUESSES = 2

// ─── Date helpers ────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Share image generator ───────────────────────────────────────────────────

const GREEN  = '#16a34a'
const YELLOW = '#eab308'
const ABSENT = '#e5e7eb'
const RED    = '#dc2626'

function generateShareImage(
  date: string,
  score: number,
  maxScore: number,
  questions: Question[],
  questionStates: GameProgress['questions'],
  streak: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const W = 600
    const H = 380
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
    const canvas = document.createElement('canvas')
    canvas.width  = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const PAD = 32
    const R   = 7   // bar border radius

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // ── Green top stripe ────────────────────────────────────────────────────
    ctx.fillStyle = GREEN
    ctx.fillRect(0, 0, W, 5)

    // ── App label ───────────────────────────────────────────────────────────
    ctx.fillStyle = '#6b7280'
    ctx.font = '13px system-ui, -apple-system, sans-serif'
    ctx.fillText('Sports Brain · Premier League', PAD, 36)

    // ── "PL Daily" ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
    ctx.fillText('PL Daily', PAD, 72)

    // ── Date ────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#374151'
    ctx.font = '15px system-ui, -apple-system, sans-serif'
    ctx.fillText(formatDate(date), PAD, 93)

    // ── Score (right-aligned) ───────────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
    const scoreText = `${score}/${maxScore}`
    const scoreW = ctx.measureText(scoreText).width
    ctx.fillText(scoreText, W - PAD - scoreW, 72)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px system-ui, sans-serif'
    const ptsW = ctx.measureText('points').width
    ctx.fillText('points', W - PAD - ptsW, 93)

    // ── Bars ────────────────────────────────────────────────────────────────
    const BAR_TOP = 118
    const BAR_H   = 30
    const BAR_GAP = 10
    const MAX_BAR_W = W - PAD * 2
    const maxLen = Math.max(...questions.map(q => q.answer.length))

    questions.forEach((question, i) => {
      const qState = questionStates[i]
      const y      = BAR_TOP + i * (BAR_H + BAR_GAP)
      const barW   = Math.round((question.answer.length / maxLen) * MAX_BAR_W)

      if (qState.status !== 'won') {
        // ── Solid red bar ────────────────────────────────────────────────
        ctx.beginPath()
        ctx.roundRect(PAD, y, barW, BAR_H, R)
        ctx.fillStyle = RED
        ctx.fill()
      } else {
        // ── Coloured segments for the winning guess ──────────────────────
        const winGuess = qState.guesses[qState.guesses.length - 1]
        const states   = evaluateGuess(winGuess, question.answer)
        const segW     = barW / states.length

        states.forEach((s, j) => {
          const x     = PAD + j * segW
          const color = s === 'correct' ? GREEN : s === 'present' ? YELLOW : ABSENT
          ctx.fillStyle = color

          const isFirst = j === 0
          const isLast  = j === states.length - 1

          ctx.beginPath()
          if (isFirst && isLast) {
            ctx.roundRect(x, y, segW, BAR_H, R)
          } else if (isFirst) {
            // Round left end only — extend 1px right to close sub-pixel gap
            ctx.roundRect(x, y, segW + 1, BAR_H, [R, 0, 0, R])
          } else if (isLast) {
            // Round right end only — extend 1px left
            ctx.roundRect(x - 1, y, segW + 1, BAR_H, [0, R, R, 0])
          } else {
            // Interior — extend slightly each side to eliminate sub-pixel gaps
            ctx.rect(x - 0.5, y, segW + 1, BAR_H)
          }
          ctx.fill()
        })
      }
    })

    // ── Footer ──────────────────────────────────────────────────────────────
    const footerY = BAR_TOP + 5 * (BAR_H + BAR_GAP) + 22

    if (streak > 1) {
      ctx.fillStyle = '#ea580c'
      ctx.font = 'bold 14px system-ui, sans-serif'
      ctx.fillText(`🔥 ${streak}-day streak`, PAD, footerY)
    }

    const urlText = 'plquiz.app'
    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px system-ui, sans-serif'
    const urlW = ctx.measureText(urlText).width
    ctx.fillText(urlText, W - PAD - urlW, footerY)

    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Canvas toBlob failed'))
    }, 'image/png')
  })
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({
  score, max, date, streak, questions, questionStates,
}: {
  score: number
  max: number
  date: string
  streak: number
  questions: Question[]
  questionStates: GameProgress['questions']
}) {
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle')

  async function handleShare() {
    setPhase('busy')
    try {
      const blob = await generateShareImage(date, score, max, questions, questionStates, streak)
      const file = new File([blob], `pl-daily-${date}.png`, { type: 'image/png' })

      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `pl-daily-${date}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
      setPhase('done')
    } catch {
      // User cancelled share or something went wrong — reset silently
      setPhase('idle')
      return
    }
    setTimeout(() => setPhase('idle'), 3000)
  }

  return (
    <button
      onClick={handleShare}
      disabled={phase === 'busy'}
      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-95 disabled:opacity-60 transition-all text-sm"
    >
      {phase === 'busy' ? 'Generating…' : phase === 'done' ? '✅ Shared!' : '🔗 Share result'}
    </button>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function getNextPuzzleCountdown(date: string): string {
  const puzzleDate = new Date(date + 'T00:00:00Z')
  puzzleDate.setUTCDate(puzzleDate.getUTCDate() + 1)
  const now  = new Date()
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

// ─── Main game component ──────────────────────────────────────────────────────

interface Props {
  puzzle: DailyPuzzle
}

export default function GameClient({ puzzle }: Props) {
  const [progress, setProgress] = useState<GameProgress>(() =>
    loadProgress(puzzle.date, puzzle.questions.length)
  )
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

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
    const idx      = progress.currentQuestion
    const question = puzzle.questions[idx]
    const current  = progress.questions[idx]
    const isCorrect  = guess.toUpperCase() === question.answer.toUpperCase()
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
    const isLast  = nextIdx >= puzzle.questions.length

    if (isLast) {
      const finalProgress: GameProgress = { ...progress, completed: true }
      setProgress(finalProgress)
      saveProgress(finalProgress)
      submitScore(finalProgress)
    } else {
      setProgress((prev) => ({ ...prev, currentQuestion: nextIdx }))
    }
  }

  const currentQ        = progress.currentQuestion
  const currentState    = progress.questions[currentQ]
  const currentQuestion = puzzle.questions[currentQ]
  const totalScore      = progress.questions.reduce((sum, q) => sum + calcQuestionScore(q), 0)

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
        {!progress.completed && (
          <p className="text-sm text-gray-400 text-center mb-5">
            One word answers. Two guesses per question. Correct answers earn points. Reveal the letter count for a clue, but it&apos;ll cost you one point.
          </p>
        )}

        {/* Completed questions */}
        {(currentQ > 0 || progress.completed) && (
          <div className="flex flex-col gap-3 mb-6">
            {puzzle.questions
              .slice(0, progress.completed ? puzzle.questions.length : currentQ)
              .map((q, i) => (
                <CompletedQuestion
                  key={i}
                  question={q}
                  state={progress.questions[i]}
                  index={i}
                />
              ))}
          </div>
        )}

        {/* End screen */}
        {progress.completed && (
          <div className="flex flex-col items-center gap-4 mt-2 mb-6">
            <div className="text-center">
              <p className="font-black text-gray-900" style={{ fontSize: '3rem', lineHeight: 1.1 }}>
                {totalScore}
                <span className="font-normal text-gray-400" style={{ fontSize: '1.25rem' }}>
                  /{puzzle.questions.length * 2}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">points</p>
            </div>

            {streak > 0 && (
              <p className="text-base font-semibold text-orange-500">🔥 {streak}-day streak</p>
            )}

            <div className="w-full max-w-xs">
              <ShareButton
                score={totalScore}
                max={puzzle.questions.length * 2}
                date={puzzle.date}
                streak={streak}
                questions={puzzle.questions}
                questionStates={progress.questions}
              />
            </div>

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
