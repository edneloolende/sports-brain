'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import QuestionPanel from '@/app/components/QuestionPanel'
import CompletedQuestion from '@/app/components/CompletedQuestion'
import ProgressBar from '@/app/components/ProgressBar'
import type { DailyPuzzle, GameProgress, Question, QuestionState, ScoreSubmission } from '@/app/lib/types'
import { calcQuestionScore } from '@/app/lib/gameLogic'
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

const GREEN = '#16a34a'
const RED   = '#dc2626'

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

    // ── Header — mirrors the in-app header exactly ──────────────────────────
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
    ctx.fillText('Sports Brain', PAD, 38)

    ctx.fillStyle = '#15803d'  // green-700, matches app
    ctx.font = '600 14px system-ui, -apple-system, sans-serif'
    ctx.fillText('Premier League Edition', PAD, 57)

    ctx.fillStyle = '#6b7280'
    ctx.font = '14px system-ui, -apple-system, sans-serif'
    ctx.fillText(formatDate(date), PAD, 76)

    // ── Score (right-aligned, matches header height) ────────────────────────
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
    const scoreText = `${score}/${maxScore}`
    const scoreW = ctx.measureText(scoreText).width
    ctx.fillText(scoreText, W - PAD - scoreW, 57)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px system-ui, sans-serif'
    const ptsW = ctx.measureText('points').width
    ctx.fillText('points', W - PAD - ptsW, 76)

    // ── Bars ────────────────────────────────────────────────────────────────
    const BAR_TOP = 104
    const BAR_H   = 30
    const BAR_GAP = 10
    const MAX_BAR_W = W - PAD * 2
    const maxLen = Math.max(...questions.map(q => q.answer.length))

    questions.forEach((question, i) => {
      const qState = questionStates[i]
      const y      = BAR_TOP + i * (BAR_H + BAR_GAP)
      const barW   = Math.round((question.answer.length / maxLen) * MAX_BAR_W)

      // Solid green = correct, solid red = wrong — no segments
      ctx.fillStyle = qState.status === 'won' ? GREEN : RED
      ctx.beginPath()
      ctx.roundRect(PAD, y, barW, BAR_H, R)
      ctx.fill()
    })

    // ── Footer ──────────────────────────────────────────────────────────────
    const footerY = BAR_TOP + 5 * (BAR_H + BAR_GAP) + 22

    if (streak > 1) {
      ctx.fillStyle = '#ea580c'
      ctx.font = 'bold 14px system-ui, sans-serif'
      ctx.fillText(`🔥 ${streak}-day streak`, PAD, footerY)
    }

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
      className="w-full py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-95 disabled:opacity-60 transition-all text-base"
    >
      {phase === 'busy' ? 'Generating…' : phase === 'done' ? '✅ Shared!' : '🔗 Share result'}
    </button>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────

// ─── Main game component ──────────────────────────────────────────────────────

interface Props {
  puzzle: DailyPuzzle
}

export default function GameClient({ puzzle }: Props) {
  const [progress, setProgress] = useState<GameProgress>(() =>
    loadProgress(puzzle.date, puzzle.questions.length)
  )
  const [streak, setStreak] = useState(0)

  // Collapse animation — instant for returning users, animated for fresh completions
  const initiallyCompleted = useRef(progress.completed)
  const [cardsCollapsed, setCardsCollapsed]   = useState(progress.completed)
  const [showEndScreen,  setShowEndScreen]    = useState(progress.completed)

  useEffect(() => {
    if (progress.completed && !initiallyCompleted.current) {
      const n = puzzle.questions.length
      // Cards start collapsing 600ms after the last answer is shown
      const collapseStart    = 600
      // Last card finishes: collapseStart + (n-1)*80ms stagger + 320ms animation
      const allDone          = collapseStart + (n - 1) * 80 + 320
      const t1 = setTimeout(() => setCardsCollapsed(true),  collapseStart)
      const t2 = setTimeout(() => setShowEndScreen(true),   allDone + 150)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completed])

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

  function handleSkip() {
    const idx = progress.currentQuestion
    // Mark as lost so the red answer banner shows before auto-advancing
    updateQuestion(idx, (q) => ({ ...q, status: 'lost' }))
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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
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
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {!progress.completed && (
          <p className="text-sm text-gray-400 text-center mb-5">
            One word answers. Two guesses per question. Correct answers earn points. Reveal the letter count for a clue, but it&apos;ll cost you one point.
          </p>
        )}

        {/* Completed questions */}
        {(currentQ > 0 || progress.completed) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: cardsCollapsed ? '6px' : '12px',
              transition: 'gap 320ms ease',
              marginBottom: '24px',
            }}
          >
            {puzzle.questions
              .slice(0, progress.completed ? puzzle.questions.length : currentQ)
              .map((q, i) => (
                <CompletedQuestion
                  key={i}
                  question={q}
                  state={progress.questions[i]}
                  index={i}
                  collapsed={cardsCollapsed}
                  collapseDelay={i * 80}
                />
              ))}
          </div>
        )}

        {/* End screen */}
        {showEndScreen && (
          <div
            className={`flex flex-col items-center gap-4 mt-2 mb-6 ${!initiallyCompleted.current ? 'animate-fade-slide-up' : ''}`}
          >
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

            <div className="w-full max-w-sm mx-auto">
              <ShareButton
                score={totalScore}
                max={puzzle.questions.length * 2}
                date={puzzle.date}
                streak={streak}
                questions={puzzle.questions}
                questionStates={progress.questions}
              />
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
            onSkip={handleSkip}
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
