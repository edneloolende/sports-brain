import type { GameProgress, PlayerProfile, QuestionState } from './types'

const PROGRESS_PREFIX = 'plq-'
const PLAYER_KEY = 'plq-player'

const VALID_STATUSES = new Set(['playing', 'won', 'lost'])

// ─── Player Identity ─────────────────────────────────────────────────────────

export function getPlayer(): PlayerProfile {
  if (typeof window === 'undefined') return { id: '' }
  try {
    const stored = localStorage.getItem(PLAYER_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed.id === 'string' && parsed.id.length > 0) {
        return parsed as PlayerProfile
      }
    }
  } catch {}
  // First visit or corrupted data: generate UUID
  const id = crypto.randomUUID()
  const profile: PlayerProfile = { id }
  savePlayer(profile)
  return profile
}

export function savePlayer(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLAYER_KEY, JSON.stringify(profile))
  } catch (e) {
    console.warn('[storage] Failed to save player profile:', e)
  }
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

function isValidProgress(parsed: unknown, date: string, questionCount: number): parsed is GameProgress {
  if (!parsed || typeof parsed !== 'object') return false
  const p = parsed as Record<string, unknown>
  if (p.date !== date) return false
  if (typeof p.completed !== 'boolean') return false
  if (typeof p.currentQuestion !== 'number') return false
  if (!Array.isArray(p.questions)) return false
  if (p.questions.length !== questionCount) return false
  for (const q of p.questions) {
    if (!q || typeof q !== 'object') return false
    const qs = q as Record<string, unknown>
    if (!Array.isArray(qs.guesses)) return false
    if (!qs.guesses.every((g: unknown) => typeof g === 'string')) return false
    if (typeof qs.hintUsed !== 'boolean') return false
    if (!VALID_STATUSES.has(qs.status as string)) return false
  }
  return true
}

export function loadProgress(date: string, questionCount: number): GameProgress {
  if (typeof window === 'undefined') return emptyProgress(date, questionCount)
  try {
    const stored = localStorage.getItem(progressKey(date))
    if (stored) {
      const parsed = JSON.parse(stored)
      if (isValidProgress(parsed, date, questionCount)) return parsed
      // Corrupted — clear it so we don't keep loading bad data
      localStorage.removeItem(progressKey(date))
    }
  } catch {}
  return emptyProgress(date, questionCount)
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(progressKey(progress.date), JSON.stringify(progress))
  } catch (e) {
    console.warn('[storage] Failed to save game progress:', e)
  }
}
