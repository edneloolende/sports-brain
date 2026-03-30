'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import QuestionPanel from '@/app/components/QuestionPanel'
import CompletedQuestion from '@/app/components/CompletedQuestion'
import ProgressBar from '@/app/components/ProgressBar'
import type { DailyPuzzle, GameProgress, Question, QuestionState, ScoreSubmission } from '@/app/lib/types'
import { calcQuestionScore } from '@/app/lib/gameLogic'
import { loadProgress, saveProgress, getPlayer } from '@/app/lib/storage'
import { generateName, EXAMPLE_NAMES } from '@/app/lib/nameGenerator'

const MAX_GUESSES = 2

// ─── Reaction GIF collections ────────────────────────────────────────────────

const REACTION_GIFS = {
  sad: [
    'https://media.giphy.com/media/WEWD48R2iD7h0M4CAB/giphy.gif',
    'https://media.giphy.com/media/31dFkd4JqFTV8NPDac/giphy.gif',
    'https://media.giphy.com/media/pgzxnMDuL47DWL9cOT/giphy.gif',
    'https://media.giphy.com/media/jZnOF0UoupsvKT0gKl/giphy.gif',
    'https://media.giphy.com/media/kJgJ5yAHmwvoF4tHOP/giphy.gif',
    'https://media.giphy.com/media/lt3MSXKrYbC1xLdbWK/giphy.gif',
    'https://media.giphy.com/media/JuWFEGk9S1Ijc31G4m/giphy.gif',
    'https://media.giphy.com/media/Nuk8ZhBtEsS6kMBNCb/giphy.gif',
    'https://media.giphy.com/media/w0fMRH5k4Lle5bEDmm/giphy.gif',
    'https://media.giphy.com/media/gnsun0tUuGPC7zFxvb/giphy.gif',
    'https://media.giphy.com/media/PSgHSGT9TNDaGabr93/giphy.gif',
    'https://media.giphy.com/media/l41YcOkS6GDDcSHe0/giphy.gif',
    'https://media.giphy.com/media/EdvpJAFMMkPiqlk8qs/giphy.gif',
    'https://media.giphy.com/media/sHdYAD7phzWwukq7he/giphy.gif',
    'https://media.giphy.com/media/MrMmyed3mt69FQWMPg/giphy.gif',
    'https://media.giphy.com/media/lRVdcJd1GxF1sgBfDM/giphy.gif',
    'https://media.giphy.com/media/UoS6dnqoou9fJjXOQM/giphy.gif',
    'https://media.giphy.com/media/Kff0fPT41Scs2W0hCv/giphy.gif',
    'https://media.giphy.com/media/STw0vIAWLPtvWmKvFz/giphy.gif',
    'https://media.giphy.com/media/rJiX9OThdA1YCXKJHT/giphy.gif',
    'https://media.giphy.com/media/1sM6QUhlRbsROjLtAA/giphy.gif',
    'https://media.giphy.com/media/7zSMm7b8veuZdutAFx/giphy.gif',
    'https://media.giphy.com/media/XV5fNGqepMPBzo4e2g/giphy.gif',
    'https://media.giphy.com/media/9uIRSOBMEkOXeYxmj8/giphy.gif',
    'https://media.giphy.com/media/gkFPLRwoljl8iAUhdF/giphy.gif',
  ],
  meh: [
    'https://media.giphy.com/media/kxUhZ0TY46X1Dk48ru/giphy.gif',
    'https://media.giphy.com/media/OUmYyDhj7XP1dwgiKF/giphy.gif',
    'https://media.giphy.com/media/HOlAmhvTznJzddhmda/giphy.gif',
    'https://media.giphy.com/media/ZYW42FuMuOHYhZvMhV/giphy.gif',
    'https://media.giphy.com/media/bLkHHJkDdrwJxfIQJ0/giphy.gif',
    'https://media.giphy.com/media/KEluHQ24vy6ctcsMCh/giphy.gif',
    'https://media.giphy.com/media/jtWTIBuukkc38Eeorj/giphy.gif',
    'https://media.giphy.com/media/QxYmNVZxpCIJOC3IKD/giphy.gif',
    'https://media.giphy.com/media/LAVbxWBYetxKTxsLjD/giphy.gif',
    'https://media.giphy.com/media/3sa2mriMk9SkMLCnyL/giphy.gif',
    'https://media.giphy.com/media/HSqJKKUvbzLtRsdROo/giphy.gif',
    'https://media.giphy.com/media/mWFYprULhLdb3pVtGU/giphy.gif',
    'https://media.giphy.com/media/lRrf5vv50RN0fakVfe/giphy.gif',
    'https://media.giphy.com/media/Q3VzQlPOvK4ewyIIgn/giphy.gif',
    'https://media.giphy.com/media/0FEIAhbCvnL5jRpXZe/giphy.gif',
    'https://media.giphy.com/media/OeKTyWUYygAkw6O3Pr/giphy.gif',
    'https://media.giphy.com/media/qmU61BkHHwSTRuiGZW/giphy.gif',
    'https://media.giphy.com/media/jnJmYcETDM0EC1vV14/giphy.gif',
    'https://media.giphy.com/media/pYD9tNSVusX28WGyD5/giphy.gif',
    'https://media.giphy.com/media/0vrVOkEwRFdbyDKqZN/giphy.gif',
    'https://media.giphy.com/media/VaqgTXeyXf1nBoqYZ7/giphy.gif',
    'https://media.giphy.com/media/3o7WIxwxpkLt8uHTfW/giphy.gif',
  ],
  celebrate: [
    'https://media.giphy.com/media/TjAcxImn74uoDYVxFl/giphy.gif',
    'https://media.giphy.com/media/bJrwFC7SAk6EkeojAF/giphy.gif',
    'https://media.giphy.com/media/WoCkBJcDiaN0IZYvV0/giphy.gif',
    'https://media.giphy.com/media/RMHmOe6wyezrLQtVD5/giphy.gif',
    'https://media.giphy.com/media/5BKj2Rgz2U9vJ8QzYN/giphy.gif',
    'https://media.giphy.com/media/kQg7fQMvVD5Ha/giphy.gif',
    'https://media.giphy.com/media/SOJBmp8r0wHwUkpYxW/giphy.gif',
    'https://media.giphy.com/media/yjDgQD6gIw0UHQzZQz/giphy.gif',
    'https://media.giphy.com/media/e12fJTytzGTbEHkJ2l/giphy.gif',
    'https://media.giphy.com/media/SSWDmOtwTQ3X5nNBRN/giphy.gif',
    'https://media.giphy.com/media/maYHFjRpJxR3RXObug/giphy.gif',
    'https://media.giphy.com/media/1fbR6mVzwHoTXXcew2/giphy.gif',
    'https://media.giphy.com/media/3o7bu2D938PkrKrcYw/giphy.gif',
    'https://media.giphy.com/media/Ql28EA1PSFUwxcq9U5/giphy.gif',
    'https://media.giphy.com/media/AYr5jQPHtJ5oRezDv8/giphy.gif',
    'https://media.giphy.com/media/qj2ZdhPhkpM7YZS137/giphy.gif',
    'https://media.giphy.com/media/9UHMJaqyUjOv646OsT/giphy.gif',
    'https://media.giphy.com/media/yvAco8XNqJafSfLmBP/giphy.gif',
    'https://media.giphy.com/media/1AIgscEMDAprsbQSQV/giphy.gif',
    'https://media.giphy.com/media/Kd5XaUvCn9XkFwHL3P/giphy.gif',
    'https://media.giphy.com/media/dt0Z71lHe9WXjauXDL/giphy.gif',
    'https://media.giphy.com/media/NqiE7mIiXNAhYVUaZD/giphy.gif',
    'https://media.giphy.com/media/40KfwvNwBjJZuj2OYP/giphy.gif',
    'https://media.giphy.com/media/cMqnAnGOP9BmWvG7tn/giphy.gif',
    'https://media.giphy.com/media/3JUJtJpwgLRxejQvAb/giphy.gif',
  ],
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ─── Score reaction lines ─────────────────────────────────────────────────────

const REACTION_LINES = {
  low: [
    "Sacked in the morning. Sacked in the morning. You're getting sacked in the morning.",
    "Relegated on goal difference. Somehow that's worse.",
    "Derby County called. They want their scorecard back.",
    "You played like a team managed by their director of football.",
    "Maradona's lawyer has filed a complaint on behalf of football.",
    "Even VAR couldn't find anything to save you here.",
    "That's a pre-season friendly performance. In January.",
    "The tifosi are throwing their scarves. Not in celebration.",
    "You've been offered a contract. By the bottom club. In the fourth division.",
    "El Clásico has seen better individual performances than this.",
    "The committee has voted. You're not getting the bronze statue outside the stadium.",
    "You told them you knew football. Football has seen the results.",
    "This is giving 'friendly against a lower league side, lost on penalties.'",
  ],
  mid: [
    "Solid. Professional. Utterly forgettable. Like a 0-0 at Stoke.",
    "A backs-against-the-wall performance. The gaffer's not happy but he's not sacking you either.",
    "You'll do. Probably. Maybe. Ask us again after the international break.",
    "The analytics team says you're statistically average. They mean it as a compliment.",
    "Respectable. Like finishing third in your group and still going through.",
    "You're the kind of player who wins Man of the Match in a 1-1 draw.",
    "Not bad. Not great. A wonderfully unremarkable display.",
    "You've qualified for the Europa League. Congratulations. Sorry.",
    "The scout in the stands has closed his notebook. Hasn't left though.",
    "A workmanlike performance. No highlights reel. No shame either.",
    "You're in the squad. Probably starting. Definitely being subbed off on 65.",
    "A performance so balanced it could referee its own game.",
    "This is a result that gets polite applause in the press conference.",
  ],
  high: [
    "Outrageous. Someone call the tribunal — this result wasn't in the budget.",
    "That's not football knowledge, that's a criminal record.",
    "Mbappé's agent is on the phone. They want you in their squad.",
    "The federation has opened an inquiry. This level of knowledge is suspicious.",
    "Your contract has a release clause. Every top club is circling.",
    "Inter, Barça, and Bayern have all submitted bids. You're choosing the project.",
    "Pep wants a word. Something about 'the system.'",
    "The stadium announcer just read your name. The crowd went delirious.",
    "You didn't just win — you made it look easy. That's the most dangerous thing.",
    "The opposition manager has resigned. Citing 'insurmountable quality.'",
    "This result has been sent to FIFA as evidence that some people know too much.",
    "The press are calling it a masterclass. They're not wrong.",
    "Somewhere, a commentator just said your name in hushed, reverential tones.",
  ],
}

// ─── Date helpers ────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

// roundRect polyfill — ctx.roundRect is unavailable in older Safari/WebKit
function canvasRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }
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
    ctx.fillText('Sporty Genius', PAD, 38)

    ctx.fillStyle = '#15803d'
    ctx.font = '600 14px system-ui, -apple-system, sans-serif'
    ctx.fillText('Men\'s Football', PAD, 57)

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
      canvasRoundRect(ctx, BAR_X, midY - BAR_H / 2, barW, BAR_H, R)
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
      className="w-full py-3.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 active:scale-95 disabled:opacity-60 transition-all text-sm"
    >
      {phase === 'busy' ? 'Generating…' : phase === 'done' ? '✅ Shared!' : '🔗 Share result'}
    </button>
  )
}

// ─── Email signup ─────────────────────────────────────────────────────────────

function EmailSignup() {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setPhase('busy')
    setErrorMsg('')

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), timezone }),
      })
      const data = await res.json()
      if (res.ok) {
        setPhase('done')
      } else {
        setErrorMsg(data.error ?? 'Something went wrong')
        setPhase('error')
      }
    } catch {
      setErrorMsg('Check your connection and try again')
      setPhase('error')
    }
  }

  if (phase === 'done') {
    return (
      <div className="w-full py-3.5 bg-green-900/30 border border-green-700/40 rounded-xl text-center">
        <p className="text-sm font-semibold text-green-400">✅ You&apos;re in! Reminder at 8am tomorrow.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setPhase('idle'); setErrorMsg('') }}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={phase === 'busy'}
          className="px-4 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {phase === 'busy' ? '…' : '📧 Remind me'}
        </button>
      </div>
      {phase === 'error' && (
        <p className="text-xs text-red-400 px-1">{errorMsg}</p>
      )}
    </form>
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
  const [displayName, setDisplayName] = useState(() => generateName())
  const [nameSaved, setNameSaved] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)
  const [scoreStatus, setScoreStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [quizCopied, setQuizCopied] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Pick a random GIF once per session (stable across re-renders)
  const reactionGif = useMemo(() => {
    const max = puzzle.questions.length * 2
    // We don't know totalScore yet at mount, so we derive it lazily below
    return { sad: pickRandom(REACTION_GIFS.sad), meh: pickRandom(REACTION_GIFS.meh), celebrate: pickRandom(REACTION_GIFS.celebrate) }
  }, [puzzle.questions.length])

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

    setScoreStatus('saving')

    // Try up to 3 times with a short delay between attempts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission),
        })
        if (res.ok) {
          const data = await res.json()
          setStreak(data.streak ?? 0)
          setScoreStatus('saved')
          return
        }
      } catch {
        // Network error — wait before retry
      }
      if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt))
    }

    // All attempts failed
    setScoreStatus('error')
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

  const reactionLine = useMemo(() => {
    if (!progress.completed) return ''
    const max = puzzle.questions.length * 2
    if (totalScore <= Math.round(max * 0.3)) return pickRandom(REACTION_LINES.low)
    if (totalScore <= Math.round(max * 0.7)) return pickRandom(REACTION_LINES.mid)
    return pickRandom(REACTION_LINES.high)
  }, [progress.completed, totalScore, puzzle.questions.length])

  async function saveName() {
    const player = getPlayer()
    if (!player.id || !displayName || nameSaved) return
    setNameLoading(true)
    try {
      await fetch('/api/name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, name: displayName }),
      })
      setNameSaved(true)
    } catch {}
    setNameLoading(false)
  }

    return (
    <div className="min-h-screen bg-[#0c1018] flex flex-col">
      {/* Header */}
      <header className="bg-[#0c1018] border-b border-white/[0.07] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight">Sporty Genius</h1>
            <p className="text-sm font-semibold text-green-400 leading-tight">Men&apos;s Football</p>
            <p className="text-sm text-white/40 mt-0.5">{formatDate(puzzle.date)}</p>
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
          <div className="text-sm text-white/40 text-center mb-5 space-y-1">
            <p className="font-semibold text-white/60">Instructions</p>
            <ul className="space-y-1">
              <li>• One word answers. For multi-word names, type without spaces (e.g. VANBASTEN).</li>
              <li>• Two guesses per question.</li>
              <li>• Reveal the letter count for a clue, but it&apos;ll cost you one point.</li>
            </ul>
          </div>
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
              <p className="font-black text-white" style={{ fontSize: '3rem', lineHeight: 1.1 }}>
                {totalScore}
                <span className="font-normal text-white/40" style={{ fontSize: '1.25rem' }}>
                  /{puzzle.questions.length * 2}
                </span>
              </p>
              <p className="text-sm text-white/40 mt-1">points</p>
            </div>

            {streak > 0 && (
              <p className="text-base font-semibold text-orange-500">🔥 {streak}-day streak</p>
            )}

            {/* Score save status */}
            {scoreStatus === 'saving' && (
              <p className="text-xs text-white/30 animate-pulse">Saving result…</p>
            )}
            {scoreStatus === 'error' && (
              <p className="text-xs text-red-400">
                Couldn&apos;t save your score — check your connection and try refreshing.
              </p>
            )}

            {/* Score reaction GIF */}
            {(() => {
              const max = puzzle.questions.length * 2
              let gifUrl: string
              let caption: string
              if (totalScore <= Math.round(max * 0.3)) {
                gifUrl = reactionGif.sad
                caption = reactionLine
              } else if (totalScore <= Math.round(max * 0.7)) {
                gifUrl = reactionGif.meh
                caption = reactionLine
              } else {
                gifUrl = reactionGif.celebrate
                caption = reactionLine
              }
              return (
                <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                  <p className="text-sm font-semibold text-white/50 text-center">{caption}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={gifUrl}
                    alt={caption}
                    className="w-full rounded-2xl object-cover"
                    style={{ maxHeight: '220px' }}
                  />
                </div>
              )
            })()}

            {/* CTAs */}
            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
              <p className="text-sm text-white/50 text-center">Get tomorrow&apos;s quiz in your inbox. Unsubscribe anytime.</p>
              <EmailSignup />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/' + puzzle.date)
                  setQuizCopied(true)
                  setTimeout(() => setQuizCopied(false), 2000)
                }}
                className="w-full py-3 bg-white/10 border border-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/15 transition-colors"
              >
                {quizCopied ? '✓ Link copied!' : '🔗 Share Quiz'}
              </button>
              {showLeaderboard && (
                <div className="w-full max-w-sm">
                  <p className="text-xs text-white/40 text-center mb-2">
                    Your leaderboard name — e.g. {EXAMPLE_NAMES.join(', ')}
                  </p>
                  {nameSaved ? (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-600/20 border border-green-600/40 rounded-xl">
                      <span className="text-green-400 text-sm font-semibold">✓ {displayName}</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center px-3 py-2.5 bg-white/5 border border-white/20 rounded-xl">
                        <span className="text-white font-semibold text-sm truncate">{displayName}</span>
                      </div>
                      <button
                        onClick={() => setDisplayName(generateName())}
                        className="px-3 py-2.5 text-white/50 hover:text-white/80 bg-white/5 border border-white/20 rounded-xl transition-colors text-sm"
                        title="Re-roll name"
                      >
                        🎲
                      </button>
                      <button
                        onClick={saveName}
                        disabled={nameLoading}
                        className="px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {nameLoading ? '…' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!showLeaderboard ? (
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="text-center text-sm text-white/40 hover:text-white/70 transition-colors py-1 w-full"
                >
                  🏆 View leaderboard
                </button>
              ) : (
                <a
                  href="/leaderboard"
                  className="text-center text-sm text-white/40 hover:text-white/70 transition-colors py-1"
                >
                  Go to leaderboard →
                </a>
              )}
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
