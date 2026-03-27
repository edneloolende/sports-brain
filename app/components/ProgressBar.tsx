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
        if (status === 'won')         cls += 'bg-green-500'
        else if (status === 'lost')   cls += 'bg-red-400'
        else if (isActive)            cls += 'bg-yellow-400 ring-2 ring-yellow-300'
        else                          cls += 'bg-white/20'

        return <div key={i} className={cls} />
      })}
      <span className="text-xs text-white/40 ml-1">
        Q{current + 1} of {total}
      </span>
    </div>
  )
}
