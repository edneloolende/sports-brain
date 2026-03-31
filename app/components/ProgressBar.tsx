'use client'

interface Props {
  total: number
  current: number          // 0-indexed active question
  statuses: Array<'playing' | 'won' | 'lost'>
}

export default function ProgressBar({ total, current, statuses }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const status = statuses[i]
        const isActive = i === current

        let cls = 'w-8 h-2 rounded-full transition-all '
        if (status === 'won')         cls += 'bg-[#F5A623]'
        else if (status === 'lost')   cls += 'bg-[#7B1034]'
        else if (isActive)            cls += 'bg-[#F5A623]/70 ring-1 ring-[#F5A623]/50'
        else                          cls += 'bg-white/20'

        const label =
          status === 'won' ? `Q${i + 1} correct` :
          status === 'lost' ? `Q${i + 1} incorrect` :
          isActive ? `Q${i + 1} current` : `Q${i + 1} upcoming`

        return <div key={i} className={cls} role="img" aria-label={label} />
      })}
      <span className="text-xs text-white/40 ml-1">
        Q{current + 1} of {total}
      </span>
    </div>
  )
}
