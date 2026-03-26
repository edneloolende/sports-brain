import type { LeaderboardEntry, ScoreSubmission } from './types'

// Vercel KV is only available server-side. This module is imported only in API routes.
// We lazy-import to avoid bundling on the client.

async function getKV() {
  const { kv } = await import('@vercel/kv')
  return kv
}

// ─── Score Submission ─────────────────────────────────────────────────────────

export async function submitScore(submission: ScoreSubmission): Promise<void> {
  const kv = await getKV()
  const { playerId, date, score } = submission

  // Idempotency: don't process the same game twice
  const gameKey = `game:${date}:${playerId}`
  const alreadySubmitted = await kv.get(gameKey)
  if (alreadySubmitted) return

  // Save this game's result
  await kv.set(gameKey, JSON.stringify(submission))

  // Update player stats
  const totalScore = ((await kv.get<number>(`player:${playerId}:total_score`)) ?? 0) + score
  const totalGames = ((await kv.get<number>(`player:${playerId}:total_games`)) ?? 0) + 1
  await kv.set(`player:${playerId}:total_score`, totalScore)
  await kv.set(`player:${playerId}:total_games`, totalGames)

  // Streak logic
  const lastPlayed = await kv.get<string>(`player:${playerId}:last_played`)
  const yesterday = getPreviousUTCDate(date)
  let streak = (await kv.get<number>(`player:${playerId}:streak`)) ?? 0
  streak = lastPlayed === yesterday ? streak + 1 : 1
  const bestStreak = Math.max(streak, (await kv.get<number>(`player:${playerId}:best_streak`)) ?? 0)
  await kv.set(`player:${playerId}:streak`, streak)
  await kv.set(`player:${playerId}:best_streak`, bestStreak)
  await kv.set(`player:${playerId}:last_played`, date)

  // Leaderboard (sorted set by total score)
  await kv.zadd('leaderboard:alltime', { score: totalScore, member: playerId })
}

// ─── Player Name ──────────────────────────────────────────────────────────────

export async function setDisplayName(playerId: string, name: string): Promise<void> {
  const kv = await getKV()
  await kv.set(`player:${playerId}:name`, name.slice(0, 20))
}

export async function getPlayerStats(playerId: string) {
  const kv = await getKV()
  return {
    streak: (await kv.get<number>(`player:${playerId}:streak`)) ?? 0,
    bestStreak: (await kv.get<number>(`player:${playerId}:best_streak`)) ?? 0,
    totalScore: (await kv.get<number>(`player:${playerId}:total_score`)) ?? 0,
    totalGames: (await kv.get<number>(`player:${playerId}:total_games`)) ?? 0,
    displayName: (await kv.get<string>(`player:${playerId}:name`)) ?? undefined,
  }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const kv = await getKV()

  // Get top N player IDs by total score (descending)
  const results = await kv.zrange('leaderboard:alltime', 0, limit - 1, {
    rev: true,
    withScores: true,
  })

  const entries: LeaderboardEntry[] = []
  // results alternates: [member, score, member, score, ...]
  for (let i = 0; i < results.length; i += 2) {
    const playerId = results[i] as string
    const totalScore = results[i + 1] as number
    const [displayName, gamesPlayed, streak, bestStreak] = await Promise.all([
      kv.get<string>(`player:${playerId}:name`),
      kv.get<number>(`player:${playerId}:total_games`),
      kv.get<number>(`player:${playerId}:streak`),
      kv.get<number>(`player:${playerId}:best_streak`),
    ])
    entries.push({
      playerId,
      displayName: displayName ?? 'Anonymous',
      totalScore,
      gamesPlayed: gamesPlayed ?? 0,
      streak: streak ?? 0,
      bestStreak: bestStreak ?? 0,
    })
  }

  return entries
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPreviousUTCDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}
