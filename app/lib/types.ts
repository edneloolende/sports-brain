// Shared types for PL Daily

export type LetterState = 'correct' | 'present' | 'absent' | 'empty'

export interface Question {
  clue: string
  answer: string          // UPPERCASE, single word, no spaces
  category: 'player' | 'manager' | 'club' | 'stadium' | 'trophy' | 'jargon'
  difficulty: 1 | 2 | 3 | 4 | 5
  isProperNoun: boolean   // if true, skips dictionary validation
}

export interface DailyPuzzle {
  date: string            // "2026-03-25"
  questions: Question[]   // exactly 5
}

// Per-question state
export interface QuestionState {
  guesses: string[]                    // submitted guesses (0, 1, or 2)
  hintUsed: boolean
  status: 'playing' | 'won' | 'lost'
}

// Full game progress (stored in localStorage)
export interface GameProgress {
  date: string
  questions: QuestionState[]           // always length 5
  currentQuestion: number              // 0–4
  completed: boolean
}

// Player identity (stored in localStorage)
export interface PlayerProfile {
  id: string            // UUID, generated on first visit
  displayName?: string  // chosen name for leaderboard
}

// Leaderboard entry returned from API
export interface LeaderboardEntry {
  playerId: string
  displayName: string
  totalScore: number
  gamesPlayed: number
  streak: number
  bestStreak: number
}

// Payload sent to /api/score on game completion
export interface ScoreSubmission {
  playerId: string
  date: string
  score: number           // 0–10
  questions: Array<{
    won: boolean
    hintUsed: boolean
    guesses: number
  }>
}
