'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LeaderboardEntry } from '@/app/lib/types'

const MEDAL = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">Sports Brain</h1>
            <p className="text-sm font-semibold text-green-700 leading-tight">Premier League Edition</p>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            Play Today →
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4">All-Time Leaderboard</h2>

        {loading ? (
          <div className="text-center py-16 text-gray-400 animate-pulse">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏟</p>
            <p className="font-medium text-gray-600">No scores yet.</p>
            <p className="text-sm mt-1">Complete today&apos;s puzzle to get on the board.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, i) => (
              <div
                key={entry.playerId}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100"
              >
                <span className="text-xl w-7 text-center shrink-0">
                  {MEDAL[i] ?? <span className="text-sm font-bold text-gray-300">{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{entry.displayName}</p>
                  <p className="text-xs text-gray-400">
                    {entry.gamesPlayed} {entry.gamesPlayed === 1 ? 'game' : 'games'}
                    {entry.streak > 1 && <span className="ml-2 text-orange-500">🔥 {entry.streak} streak</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-gray-900">{entry.totalScore}</p>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
