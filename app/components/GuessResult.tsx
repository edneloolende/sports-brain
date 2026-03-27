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
  empty:   'bg-transparent border-white/25 text-transparent',
}

export default function GuessResult({ guess, answer }: Props) {
  const states = evaluateGuess(guess, answer)
  const letters = guess.toUpperCase().split('')

  // Always render answer.length boxes.
  // - Positions within the guess: show the letter + colour.
  // - Positions beyond the guess (short guess): empty outlined slot ('empty' state).
  // - Guess letters beyond answer.length are clipped silently.
  return (
    <div className="flex gap-1.5 justify-center">
      {states.map((state, i) => (
        <div
          key={i}
          className={`w-10 h-10 flex items-center justify-center text-sm font-bold uppercase rounded border-2 ${tileStyle[state]}`}
        >
          {i < letters.length ? letters[i] : ''}
        </div>
      ))}
    </div>
  )
}
