import type { LetterState, Question, QuestionState } from './types'
import { PUZZLES } from '../data/puzzles'
import { WORDLIST } from '../data/wordlist'

// Set of all puzzle answers — always valid guesses
const ALL_ANSWERS = new Set(
  PUZZLES.flatMap((p) => p.questions.map((q) => q.answer.toUpperCase()))
)

/**
 * Evaluate a guess against the answer using Wordle rules:
 * 1. Mark exact matches (correct) first
 * 2. Of remaining letters, mark present if in remaining answer pool
 * 3. All others: absent
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const g = guess.toUpperCase().split('')
  const a = answer.toUpperCase().split('')
  const result: LetterState[] = new Array(g.length).fill('absent')
  const answerPool = [...a]

  // Pass 1: exact matches
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct'
      answerPool[i] = '' // consume this letter
    }
  }

  // Pass 2: present (wrong position)
  for (let i = 0; i < g.length; i++) {
    if (result[i] === 'correct') continue
    const idx = answerPool.indexOf(g[i])
    if (idx !== -1) {
      result[i] = 'present'
      answerPool[idx] = '' // consume
    }
  }

  return result
}

/**
 * Aggregate the best keyboard state for each letter across all guesses for a question.
 * Priority: correct > present > absent
 */
export function getKeyboardStates(
  guesses: string[],
  answer: string
): Record<string, LetterState> {
  const priority: Record<LetterState, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    empty: 0,
  }
  const states: Record<string, LetterState> = {}

  for (const guess of guesses) {
    const evaluation = evaluateGuess(guess, answer)
    guess.toUpperCase().split('').forEach((letter, i) => {
      const current = states[letter]
      const next = evaluation[i]
      if (!current || priority[next] > priority[current]) {
        states[letter] = next
      }
    })
  }

  return states
}

/**
 * Calculate points for a completed question.
 * 2pts: correct on first guess with no hint
 * 1pt:  correct on second guess, OR correct with hint used
 * 0pts: both guesses wrong
 */
export function calcQuestionScore(state: QuestionState): 0 | 1 | 2 {
  if (state.status !== 'won') return 0
  if (state.guesses.length === 1 && !state.hintUsed) return 2
  return 1
}

/**
 * Validate a guess before accepting it.
 * Proper nouns only require A-Z characters.
 * Regular words must be in the wordlist or be a puzzle answer.
 */
export function isValidGuess(guess: string, question: Question): boolean {
  const upper = guess.toUpperCase()
  if (!/^[A-Z]+$/.test(upper)) return false
  if (question.isProperNoun) return true
  return WORDLIST.has(upper) || ALL_ANSWERS.has(upper)
}
