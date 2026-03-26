'use client'

import { evaluateGuess } from '@/app/lib/gameLogic'
import type { LetterState } from '@/app/lib/types'

interface Props {
  guess: string
  answer: string
  revealed?: boolean // animate reveal
}

const tileStyle: Record<LetterState, string> = {
  correct: 'bg-green-600 border-green-600 text-white',
  present: 'bg-yellow-400 border-yellow-400 text-gray-900',
  absent:  'bg-gray-700 border-gray-700 text-white',
  empty:   'bg-white border-gray-400 text-gray-900',
}

export default function GuessResult({ guess, answer }: Props) {
  const states = evaluateGuess(guess, answer)

  return (
    <div className="flex gap-1.5 justify-center">
      {guess.toUpperCase().split('').map((letter, i) => (
        <div
          key={i}
          className={`w-10 h-10 flex items-center justify-center text-sm font-bold uppercase rounded border-2 ${tileStyle[states[i]]}`}
        >
          {letter}
        </div>
      ))}
    </div>
  )
}
