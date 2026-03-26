'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { LeaderboardEntry } from '@/app/lib/types'

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gray-900">PL Daily</h1>
            <p className="text-xs text-gray-400">Leaderboard</p>
          </div>
          <Link href="/" className="text-sm text-green-600 font-medium hover:underline">
            Play Today →
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 All-Time Top Scores</h2>

        {loading ? (
          <div className="text-center py-16 text-gray-400 animate-pulse">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏟</p>
            <p className="font-medium">No scores yet.</p>
            <p className="text-sm mt-1">Complete today&apos;s puzzle to get on the board!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.map((entry, i) => (
              <div
                key={entry.playerId}
                className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100"
              >
                <span className={`text-lg font-black w-6 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{entry.displayName}</p>
                  <p className="text-xs text-gray-400">{entry.gamesPlayed} games played</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{entry.totalScore} pts</p>
                  {entry.streak > 1 && (
                    <p className="text-xs text-orange-500">🔥 {entry.streak} streak</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
