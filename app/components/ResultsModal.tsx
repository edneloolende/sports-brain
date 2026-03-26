'use client'

import { useEffect, useState } from 'react'
import type { GameProgress, Question } from '@/app/lib/types'
import { calcQuestionScore, evaluateGuess } from '@/app/lib/gameLogic'

interface Props {
  progress: GameProgress
  questions: Question[]
  date: string
  streak: number
  onClose: () => void
}

const SITE_URL = 'plquiz.app'

export default function ResultsModal({ progress, questions, date, streak, onClose }: Props) {
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>('idle')

  const totalScore = progress.questions.reduce(
    (sum, q) => sum + calcQuestionScore(q),
    0
  )
  const maxScore = questions.length * 2

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  /**
   * Build a colour bar for one question.
   * Correct answer → coloured squares from the winning guess (green/yellow/white).
   * Wrong answer   → solid red bar, answer-length wide.
   * Squares are joined with no space so they read as a continuous strip.
   */
  function buildBar(qIndex: number): string {
    const q = progress.questions[qIndex]
    const answer = questions[qIndex].answer

    if (q.status !== 'won') {
      // Lost: flat red bar
      return '🟥'.repeat(answer.length)
    }

    // Won: evaluate the winning guess for its colour distribution
    const winningGuess = q.guesses[q.guesses.length - 1]
    const states = evaluateGuess(winningGuess, answer)
    return states
      .map((s) => s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬜')
      .join('')
  }

  function buildShareText(): string {
    const lines: string[] = [
      `⚽ PL Daily — ${date}`,
      `${totalScore}/${maxScore}`,
      '',
    ]

    // One bar per question
    progress.questions.forEach((_, i) => {
      lines.push(buildBar(i))
    })

    lines.push('')
    if (streak > 1) lines.push(`🔥 ${streak}-day streak`)
    lines.push(SITE_URL)

    return lines.join('\n')
  }

  async function handleShare() {
    const text = buildShareText()

    // Use native share sheet on mobile if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text })
        setShareState('shared')
        setTimeout(() => setShareState('idle'), 2500)
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2500)
    } catch {
      // Clipboard blocked (rare) — do nothing
    }
  }

  const shareLabel =
    shareState === 'copied' ? '✅ Copied!' :
    shareState === 'shared' ? '✅ Shared!' :
    '🔗 Share result'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">PL Daily</h2>
          <p className="text-sm text-gray-500">{date}</p>
        </div>

        {/* Score */}
        <div className="text-center py-3 bg-gray-50 rounded-xl">
          <p className="text-4xl font-black text-gray-900">
            {totalScore}
            <span className="text-xl font-normal text-gray-400">/{maxScore}</span>
          </p>
          <p className="text-sm text-gray-400 mt-0.5">points</p>
        </div>

        {/* Per-question breakdown */}
        <div className="flex flex-col gap-2">
          {progress.questions.map((q, i) => {
            const score = calcQuestionScore(q)
            const answer = questions[i].answer
            return (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium text-gray-400 shrink-0">Q{i + 1}</span>
                  {q.status === 'won' ? (
                    <span className="text-sm font-black text-green-800 tracking-wider truncate">{answer}</span>
                  ) : (
                    <span className="text-sm font-black text-red-800 tracking-wider truncate">{answer}</span>
                  )}
                  {q.hintUsed && <span className="text-xs">💡</span>}
                </div>
                <span className={`text-xs font-semibold shrink-0 ml-2 ${score === 2 ? 'text-green-600' : score === 1 ? 'text-yellow-600' : 'text-red-400'}`}>
                  {q.status === 'won' ? `+${score}pt` : '0pt'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Streak */}
        {streak > 1 && (
          <div className="text-center text-sm font-semibold text-orange-600">
            🔥 {streak}-day streak
          </div>
        )}

        {/* Share — full width */}
        <button
          onClick={handleShare}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-95 transition-all text-sm"
        >
          {shareLabel}
        </button>

        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
