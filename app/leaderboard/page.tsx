import { getLeaderboard } from '@/app/lib/kv'
import type { LeaderboardEntry } from '@/app/lib/types'
import Link from 'next/link'

export const revalidate = 60 // refresh every 60s

export default async function LeaderboardPage() {
  let entries: LeaderboardEntry[] = []
  try {
    entries = await getLeaderboard(20)
  } catch {
    // KV not configured
  }

  return (
    <div className="min-h-screen bg-[#14161c] flex flex-col">
      {/* Header */}
      <header className="bg-[#14161c] border-b border-white/[0.07] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Sporty Genius</h1>
            <p className="text-sm font-semibold text-green-400">Leaderboard</p>
          </div>
          <Link
            href="/"
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Play today →
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-white/60 text-sm">No scores yet — be the first!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, i) => (
              <div
                key={entry.playerId}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${
                  i === 0
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : i === 1
                    ? 'bg-slate-400/10 border-slate-400/20'
                    : i === 2
                    ? 'bg-orange-700/10 border-orange-700/20'
                    : 'bg-white/[0.03] border-white/[0.07]'
                }`}
              >
                {/* Rank */}
                <span className="text-lg w-7 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </span>

                {/* Name + streak */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{entry.displayName}</p>
                  <p className="text-white/40 text-xs">
                    {entry.gamesPlayed} {entry.gamesPlayed === 1 ? 'game' : 'games'}
                    {entry.streak > 1 && (
                      <span className="ml-2 text-orange-400">🔥 {entry.streak}-day streak</span>
                    )}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-white font-black text-lg">{entry.totalScore}</p>
                  <p className="text-white/30 text-xs">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-8">
          Updates every minute · Save your name after completing a puzzle
        </p>
      </main>
    </div>
  )
}
