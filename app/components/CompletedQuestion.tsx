'use client'

import GuessResult from './GuessResult'
import type { Question, QuestionState } from '@/app/lib/types'
import { calcQuestionScore } from '@/app/lib/gameLogic'

interface Props {
  question: Question
  state: QuestionState
  index: number
}

export default function CompletedQuestion({ question, state, index }: Props) {
  const score = calcQuestionScore(state)

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
            <span className="font-semibold text-gray-500">Q{index + 1}</span>
            <span className="text-gray-400 mx-1.5">—</span>
            {question.clue}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {state.status === 'won' ? (
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              +{score}pt
            </span>
          ) : (
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              0pt
            </span>
          )}
        </div>
      </div>

      {/* Guess tiles */}
      <div className="flex flex-col gap-1.5">
        {state.guesses.map((g, i) => (
          <GuessResult key={i} guess={g} answer={question.answer} />
        ))}
      </div>

      {state.hintUsed && <span className="text-xs text-gray-400">💡 hint used</span>}
    </div>
  )
}
