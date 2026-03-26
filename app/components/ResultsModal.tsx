'use client'

import { useEffect, useState } from 'react'
import type { GameProgress, Question } from '@/app/lib/types'
import { calcQuestionScore } from '@/app/lib/gameLogic'

interface Props {
  progress: GameProgress
  questions: Question[]
  date: string
  streak: number
  onClose: () => void
}

export default function ResultsModal({ progress, questions, date, streak, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const totalScore = progress.questions.reduce(
    (sum, q) => sum + calcQuestionScore(q),
    0
  )
  const maxScore = questions.length * 2

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function buildShareText(): string {
    const lines: string[] = [
      `PL Daily ${date} · ${totalScore}/${maxScore} ⭐`,
    ]
    progress.questions.forEach((q, i) => {
      const score = calcQuestionScore(q)
      const hint = q.hintUsed ? '💡' : ''
      let outcome = ''
      if (q.status === 'won') {
        outcome = q.guesses.length === 1 ? '🟩' : '🟨🟩'
      } else {
        outcome = '❌'
      }
      lines.push(`Q${i + 1} ${hint}${outcome} ${score}pt`)
    })
    if (streak > 1) lines.push(`🔥 ${streak}-day streak`)
    return lines.join('\n')
  }

  function handleShare() {
    const text = buildShareText()
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
          <p className="text-4xl font-black text-gray-900">{totalScore}<span className="text-xl font-normal text-gray-400">/{maxScore}</span></p>
          <p className="text-sm text-gray-500 mt-0.5">points</p>
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
        {streak > 0 && (
          <div className="text-center text-sm font-medium text-orange-600">
            🔥 {streak}-day streak
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
          >
            {copied ? '✅ Copied!' : '📋 Share'}
          </button>
          <a
            href="/leaderboard"
            className="flex-1 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors text-sm text-center"
          >
            🏆 Leaderboard
          </a>
        </div>

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
