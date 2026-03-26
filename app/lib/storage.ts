import type { GameProgress, PlayerProfile, QuestionState } from './types'

const PROGRESS_PREFIX = 'plq-'
const PLAYER_KEY = 'plq-player'

// ─── Player Identity ─────────────────────────────────────────────────────────

export function getPlayer(): PlayerProfile {
  if (typeof window === 'undefined') return { id: '' }
  try {
    const stored = localStorage.getItem(PLAYER_KEY)
    if (stored) return JSON.parse(stored) as PlayerProfile
  } catch {}
  // First visit: generate UUID
  const id = crypto.randomUUID()
  const profile: PlayerProfile = { id }
  savePlayer(profile)
  return profile
}

export function savePlayer(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(profile))
  } catch {}
}

// ─── Game Progress ────────────────────────────────────────────────────────────

function progressKey(date: string): string {
  return `${PROGRESS_PREFIX}${date}`
}

export function emptyProgress(date: string, questionCount: number): GameProgress {
  const questions: QuestionState[] = Array.from({ length: questionCount }, () => ({
    guesses: [],
    hintUsed: false,
    status: 'playing',
  }))
  return { date, questions, currentQuestion: 0, completed: false }
}

export function loadProgress(date: string, questionCount: number): GameProgress {
  if (typeof window === 'undefined') return emptyProgress(date, questionCount)
  try {
    const stored = localStorage.getItem(progressKey(date))
    if (stored) {
      const parsed = JSON.parse(stored) as GameProgress
      // Validate shape
      if (parsed.date === date && Array.isArray(parsed.questions)) return parsed
    }
  } catch {}
  return emptyProgress(date, questionCount)
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(progressKey(progress.date), JSON.stringify(progress))
  } catch {}
}
