'use client'

import { useState, useEffect, useCallback } from 'react'
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

// Truncate text to fit within maxWidth, appending ellipsis if needed
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) {
    t = t.slice(0, -1)
  }
  return t + '…'
}

function generateShareImage(
  date: string,
  score: number,
  maxScore: number,
  questions: Question[],
  questionStates: GameProgress['questions'],
  streak: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const W   = 600
    const H   = 320
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1
    const canvas = document.createElement('canvas')
    canvas.width  = W * dpr
    canvas.height = H * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    const PAD = 32
    const R   = 5   // bar border radius

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // ── Green top stripe ────────────────────────────────────────────────────
    ctx.fillStyle = GREEN
    ctx.fillRect(0, 0, W, 5)

    // ── Header ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
    ctx.fillText('Sports Brain', PAD, 38)

    ctx.fillStyle = '#15803d'
    ctx.font = '600 14px system-ui, -apple-system, sans-serif'
    ctx.fillText('Premier League Edition', PAD, 57)

    ctx.fillStyle = '#6b7280'
    ctx.font = '14px system-ui, -apple-system, sans-serif'
    ctx.fillText(formatDate(date), PAD, 76)

    // ── Score (right-aligned) ───────────────────────────────────────────────
    ctx.fillStyle = '#111827'
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif'
    const scoreText = `${score}/${maxScore}`
    ctx.fillText(scoreText, W - PAD - ctx.measureText(scoreText).width, 57)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('points', W - PAD - ctx.measureText('points').width, 76)

    // ── Question rows: clue left, bar right ─────────────────────────────────
    const ROW_TOP  = 102
    const ROW_H    = 26   // total row height
    const ROW_GAP  = 8
    const BAR_H    = 16   // thinner bar to leave room for text
    const TEXT_W   = 230  // max width for clue column
    const BAR_X    = PAD + TEXT_W + 16
    const MAX_BAR_W = W - PAD - BAR_X  // ≈ 290px
    const maxLen   = Math.max(...questions.map(q => q.answer.length))

    questions.forEach((question, i) => {
      const qState  = questionStates[i]
      const rowY    = ROW_TOP + i * (ROW_H + ROW_GAP)
      const midY    = rowY + ROW_H / 2

      // Question label
      ctx.fillStyle = '#9ca3af'
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif'
      ctx.fillText(`Q${i + 1}`, PAD, midY + 4)

      // Clue text (truncated)
      ctx.fillStyle = '#374151'
      ctx.font = '11px system-ui, -apple-system, sans-serif'
      const clue = truncateText(ctx, question.clue, TEXT_W - 24)
      ctx.fillText(clue, PAD + 24, midY + 4)

      // Coloured bar
      const barW = Math.round((question.answer.length / maxLen) * MAX_BAR_W)
      ctx.fillStyle = qState.status === 'won' ? GREEN : RED
      ctx.beginPath()
      ctx.roundRect(BAR_X, midY - BAR_H / 2, barW, BAR_H, R)
      ctx.fill()
    })

    // ── Footer ──────────────────────────────────────────────────────────────
    const footerY = ROW_TOP + 5 * (ROW_H + ROW_GAP) + 16

    if (streak > 1) {
      ctx.fillStyle = '#ea580c'
      ctx.font = 'bold 13px system-ui, sans-serif'
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

// ─── Remind button ────────────────────────────────────────────────────────────

function RemindButton({ currentDate }: { currentDate: string }) {
  const [done, setDone] = useState(false)

  function handleRemind() {
    // Build tomorrow's date string
    const [y, m, d] = currentDate.split('-').map(Number)
    const tomorrow = new Date(y, m - 1, d + 1)
    const pad = (n: number) => String(n).padStart(2, '0')
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`

    // Recurring daily event at 9am (floating/local time)
    const dtBase = `${tomorrow.getFullYear()}${pad(tomorrow.getMonth() + 1)}${pad(tomorrow.getDate())}`
    const dtStart = `${dtBase}T090000`
    const dtEnd   = `${dtBase}T091500`

    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const nextUrl = `${origin}/${tomorrowStr}`

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sports Brain//PL Daily//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'RRULE:FREQ=DAILY',
      'SUMMARY:⚽ Sports Brain — Daily PL Quiz',
      `URL:${origin}`,
      `DESCRIPTION:Your daily Premier League quiz is ready!\\n\\n👉 ${nextUrl}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:⚽ Time for your Sports Brain quiz!',
      'TRIGGER:PT0S',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'sports-brain-daily.ics'
    a.click()
    URL.revokeObjectURL(url)
    setDone(true)
  }

  return (
    <button
      onClick={handleRemind}
      className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all text-base"
    >
      {done ? '📅 Added to calendar!' : '🔔 Remind me tomorrow'}
    </button>
  )
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

            <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
              <ShareButton
                score={totalScore}
                max={puzzle.questions.length * 2}
                date={puzzle.date}
                streak={streak}
                questions={puzzle.questions}
                questionStates={progress.questions}
              />
              <RemindButton currentDate={puzzle.date} />
            </div>

            {/* Score reaction GIF */}
            {(() => {
              const max = puzzle.questions.length * 2
              let gif: { url: string; caption: string }
              if (totalScore <= Math.round(max * 0.3)) {
                gif = {
                  url: 'https://media.giphy.com/media/gkFPLRwoljl8iAUhdF/giphy.gif',
                  caption: 'Better luck tomorrow 😬',
                }
              } else if (totalScore <= Math.round(max * 0.7)) {
                gif = {
                  url: 'https://media.giphy.com/media/3o7WIxwxpkLt8uHTfW/giphy.gif',
                  caption: 'Not bad, not great 🤷',
                }
              } else {
                gif = {
                  url: 'https://media.giphy.com/media/3JUJtJpwgLRxejQvAb/giphy.gif',
                  caption: 'Get in! 🔥',
                }
              }
              return (
                <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                  <p className="text-sm font-semibold text-gray-500">{gif.caption}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gif.url}
                    alt={gif.caption}
                    className="w-full rounded-2xl object-cover"
                    style={{ maxHeight: '240px' }}
                  />
                </div>
              )
            })()}

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
