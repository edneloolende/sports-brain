'use client'

import { useState, useRef, useEffect } from 'react'
import { useCallback } from 'react'

interface Props {
  onSubmit: (guess: string) => void
  onHint: () => void
  onSkip: () => void
  hintUsed: boolean
  hintText?: string      // e.g. "6 letters" — only shown after hint used
  disabled: boolean
  shake?: boolean
  errorMsg?: string
}

// Dynamically size slots to always fill the actual container width.
function slotStyle(len: number, containerWidth: number): React.CSSProperties {
  const padding = 16 // px-2 = 8px each side
  const cursorWidth = 10
  const gap = len >= 10 ? 2 : len >= 7 ? 3 : 6
  const available = containerWidth - padding - cursorWidth
  const raw = (available - (len - 1) * gap) / len
  const size = Math.min(64, Math.max(16, Math.floor(raw)))
  const fontSize = Math.max(8, Math.min(28, size - 8))
  return { width: size, height: size, fontSize, flexShrink: 0 }
}

function slotGap(len: number): string {
  if (len >= 10) return 'gap-0.5'
  if (len >= 7)  return 'gap-[3px]'
  return 'gap-1.5'
}

export default function GuessInput({
  onSubmit,
  onHint,
  onSkip,
  hintUsed,
  hintText,
  disabled,
  shake,
  errorMsg,
}: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [slotWidth, setSlotWidth] = useState(300)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const slotsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  // Measure the actual slot container width
  useEffect(() => {
    const el = slotsRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSlotWidth(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // When keyboard opens on mobile, scroll the input into view above it
  function handleFocus() {
    setFocused(true)
    setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const vv = window.visualViewport
      if (vv) {
        // Calculate how far the bottom of the input is below the visible area
        const rect = el.getBoundingClientRect()
        const visibleBottom = vv.offsetTop + vv.height
        const gap = 24 // breathing room above the keyboard
        if (rect.bottom > visibleBottom - gap) {
          window.scrollBy({ top: rect.bottom - visibleBottom + gap, behavior: 'smooth' })
        }
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 320)
  }

  function handleSubmit() {
    const cleaned = value.replace(/\s/g, '').trim()
    if (!cleaned) return
    onSubmit(cleaned)
    setValue('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-2">
      {/* Hint + Skip row */}
      <div className="flex items-center justify-between">
        {hintUsed ? (
          <span className="text-sm text-white/60 font-medium">💡 {hintText}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onHint}
              disabled={disabled}
              className="text-xs font-semibold text-white/50 hover:text-white/80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif' }}
            >
              ▸ Reveal letter count
            </button>
            <div className="relative group">
              <span className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-gray-400 text-[10px] leading-none cursor-default select-none">?</span>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-lg">
                Reveals how many letters are in the answer. Costs 1 point off your maximum for this question.
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onSkip}
          disabled={disabled}
          className="text-xs font-semibold text-white/50 hover:text-white/80 px-2 py-1 rounded hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Skip →
        </button>
      </div>

      {/* Slot-style input */}
      <div className={`flex gap-2 items-stretch ${shake ? 'animate-shake' : ''}`}>
        {/* Hidden real input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z ]/g, ''))}
          onKeyDown={handleKey}
          disabled={disabled}
          maxLength={30}
          className="sr-only"
          onFocus={handleFocus}
          onBlur={() => setFocused(false)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        {/* Visual slots */}
        <div
          ref={slotsRef}
          className={`flex-1 flex flex-nowrap ${slotGap(value.length)} min-h-[4rem] px-2 py-2 cursor-text items-end transition-all overflow-hidden`}
          onClick={() => inputRef.current?.focus()}
        >
          {value.length === 0 && !focused && (
            <span className="text-white/30 text-base font-normal pb-1">Type your answer…</span>
          )}
          {value.length === 0 && focused && (
            <div className="w-0.5 h-6 bg-white/60 animate-pulse rounded-full mb-1" />
          )}
          {value.toUpperCase().split('').map((letter, i) => (
            letter === ' ' ? (
              <div key={i} className="w-2 shrink-0" />
            ) : (
              <div
                key={i}
                className="flex items-center justify-center border-b-2 border-white/60 text-white font-bold bg-transparent"
                style={slotStyle(value.replace(/\s/g, '').length, slotWidth)}
              >
                {letter}
              </div>
            )
          ))}
          {value.length > 0 && (
            <div className="w-0.5 h-5 bg-white/60 animate-pulse rounded-full mb-1 shrink-0" />
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="px-5 bg-green-600 text-lg text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Submit
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="text-base text-red-400 font-medium">{errorMsg}</p>
      )}
    </div>
  )
}
