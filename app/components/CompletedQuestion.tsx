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
    <div className="w-full bg-[#131927] rounded-2xl border border-white/[0.07] p-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90 leading-snug line-clamp-2">
            <span className="font-semibold text-white/50">Q{index + 1}</span>
            <span className="text-white/25 mx-1.5">—</span>
            {question.clue}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {state.status === 'won' ? (
            <span className="text-xs font-bold text-green-400 bg-green-900/40 px-2 py-0.5 rounded-full">
              +{score}pt
            </span>
          ) : (
            <span className="text-xs font-bold text-red-400 bg-red-900/40 px-2 py-0.5 rounded-full">
              0pt
            </span>
          )}
        </div>
      </div>

      {/* Tiles */}
      {state.status === 'lost' ? (
        <div className="flex gap-1.5 flex-wrap justify-center">
          {question.answer.toUpperCase().split('').map((letter, i) => (
            <div
              key={i}
              className="w-8 h-8 flex items-center justify-center rounded text-sm font-bold text-white bg-red-500"
            >
              {letter}
            </div>
          ))}
        </div>
      ) : (
        <GuessResult
          guess={state.guesses[state.guesses.length - 1]}
          answer={question.answer}
        />
      )}

      {state.hintUsed && <span className="text-xs text-white/30">💡 hint used</span>}
    </div>
  )
}
