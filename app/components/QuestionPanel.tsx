'use client'

import { useState, useCallback, useEffect } from 'react'
import GuessResult from './GuessResult'
import GuessInput from './GuessInput'
import type { Question, QuestionState } from '@/app/lib/types'
import { isValidGuess, calcQuestionScore } from '@/app/lib/gameLogic'

interface Props {
  question: Question
  questionIndex: number
  state: QuestionState
  onGuessSubmit: (guess: string) => void
  onHintUsed: () => void
  onNext: () => void
  isLast: boolean
  totalScore: number
  maxScore: number
}

const CATEGORY_LABEL: Record<Question['category'], string> = {
  player:  '⚽ Player',
  manager: '🧠 Manager',
  club:    '🏟 Club',
  stadium: '🏟 Stadium',
  trophy:  '🏆 Trophy',
  jargon:  '📖 Jargon',
}

// Auto-advance delays
const WIN_DELAY  = 600   // ms after correct answer
const LOSE_DELAY = 1200  // ms after running out of guesses (enough to read the answer)

export default function QuestionPanel({
  question,
  questionIndex,
  state,
  onGuessSubmit,
  onHintUsed,
  onNext,
  totalScore,
  maxScore,
}: Props) {
  const [shake, setShake] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | undefined>()
  // no countdown state needed

  const isPlaying = state.status === 'playing'
  const maxGuesses = 2
  const score = calcQuestionScore(state)

  // Auto-advance when question is resolved
  useEffect(() => {
    if (state.status === 'playing') return

    const delay = state.status === 'won' ? WIN_DELAY : LOSE_DELAY
    const timer = setTimeout(onNext, delay)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  const handleSubmit = useCallback((guess: string) => {
    if (!isValidGuess(guess)) {
      setErrorMsg('Letters only — no spaces or numbers.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
      setTimeout(() => setErrorMsg(undefined), 2500)
      return
    }
    setErrorMsg(undefined)
    onGuessSubmit(guess)
  }, [onGuessSubmit])

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      {/* Clue card */}
      <div className="rounded-2xl p-6 border border-green-100" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' }}>
        <p className="text-2xl font-normal text-gray-950 leading-snug" style={{ fontFamily: 'var(--font-lora), Georgia, serif' }}>Q{questionIndex + 1}. {question.clue}.</p>
      </div>

      {/* Guess results */}
      {state.guesses.length > 0 && (
        <div className="flex flex-col gap-2">
          {state.guesses.map((g, i) => (
            <GuessResult key={i} guess={g} answer={question.answer} />
          ))}
        </div>
      )}

      {/* Outcome banners — shown until auto-advance */}
      {state.status === 'lost' && (
        <div className="text-center py-3 px-4 bg-red-50 border-2 border-red-300 rounded-xl">
          <p className="text-base font-semibold text-red-700">The answer was</p>
          <p className="text-4xl font-black text-red-950 tracking-widest mt-1">{question.answer}</p>
        </div>
      )}


      {/* Input — only while playing */}
      {isPlaying && (
        <>
          <GuessInput
            onSubmit={handleSubmit}
            onHint={onHintUsed}
            onSkip={onNext}
            hintUsed={state.hintUsed}
            hintText={state.hintUsed ? `${question.answer.length} letters` : undefined}
            disabled={false}
            shake={shake}
            errorMsg={errorMsg}
          />
          <p className="text-center text-base font-medium text-gray-600">
            {maxGuesses - state.guesses.length} guess{maxGuesses - state.guesses.length === 1 ? '' : 'es'} remaining
          </p>
          <div className="text-center mt-2">
            <p className="font-black text-gray-900" style={{ fontSize: '3rem', lineHeight: 1.1 }}>
              {totalScore}
              <span className="font-normal text-gray-400" style={{ fontSize: '1.25rem' }}>/{maxScore}</span>
            </p>
            <p className="text-sm text-gray-500 -mt-1">points</p>
          </div>
        </>
      )}
    </div>
  )
}
