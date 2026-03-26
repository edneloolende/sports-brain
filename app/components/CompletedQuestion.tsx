'use client'

import GuessResult from './GuessResult'
import type { Question, QuestionState } from '@/app/lib/types'
import { calcQuestionScore } from '@/app/lib/gameLogic'

interface Props {
  question: Question
  state: QuestionState
  index: number
  collapsed?: boolean
  collapseDelay?: number
}

export default function CompletedQuestion({
  question,
  state,
  index,
  collapsed = false,
  collapseDelay = 0,
}: Props) {
  const score = calcQuestionScore(state)
  const d = `${collapseDelay}ms`

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: collapsed ? 'transparent' : '#ffffff',
        borderRadius: collapsed ? '8px' : '16px',
        border: `1px solid ${collapsed ? 'transparent' : '#f3f4f6'}`,
        boxShadow: collapsed ? 'none' : '0 1px 2px 0 rgba(0,0,0,0.05)',
        padding: collapsed ? '2px 0' : '16px',
        gap: collapsed ? '0' : '12px',
        transition: [
          `background-color 320ms ease ${d}`,
          `border-color 320ms ease ${d}`,
          `box-shadow 320ms ease ${d}`,
          `padding 320ms ease ${d}`,
          `border-radius 320ms ease ${d}`,
        ].join(', '),
      }}
    >
      {/* Clue + badge — collapses away */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: collapsed ? '0fr' : '1fr',
          opacity: collapsed ? 0 : 1,
          transition: `grid-template-rows 320ms ease ${d}, opacity 220ms ease ${d}`,
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', paddingBottom: '4px' }}>
            <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2" style={{ flex: 1, minWidth: 0 }}>
              <span className="font-semibold text-gray-500">Q{index + 1}</span>
              <span className="text-gray-400" style={{ margin: '0 6px' }}>—</span>
              {question.clue}
            </p>
            <div style={{ flexShrink: 0 }}>
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
          {state.hintUsed && (
            <span className="text-xs text-gray-400">💡 hint used</span>
          )}
        </div>
      </div>

      {/* Tiles — always visible */}
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
    </div>
  )
}
