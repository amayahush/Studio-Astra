import { useEffect, useState } from 'react'

// Headline types itself in on load. Every character is rendered from the start
// (just invisible), so the line breaks and the page height never shift while typing.
export default function TypedHeadline({ segments, startDelay = 350, charMs = 26, triggerProps }) {
  const SEGMENTS = segments
  const FULL = SEGMENTS.map((s) => s.text).join('')
  const START_DELAY = startDelay
  const CHAR_MS = charMs
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduceMotion ? FULL.length : 0)
  const done = count >= FULL.length

  useEffect(() => {
    if (reduceMotion) return
    let timer
    const start = setTimeout(() => {
      timer = setInterval(() => {
        setCount((c) => {
          if (c + 1 >= FULL.length) clearInterval(timer)
          return Math.min(c + 1, FULL.length)
        })
      }, CHAR_MS)
    }, START_DELAY)
    return () => {
      clearTimeout(start)
      clearInterval(timer)
    }
  }, [reduceMotion, FULL, START_DELAY, CHAR_MS])

  // Characters are grouped into words that can't break internally. Without this, the
  // caret (an inline-block) became a line-break point and words split mid-typing.
  let i = 0
  const renderChar = (ch) => {
    const idx = i++
    return (
      <span key={idx}>
        <span className={idx < count ? 'ch' : 'ch ch-hidden'}>{ch}</span>
        {idx === count - 1 && <Caret done={done} />}
      </span>
    )
  }
  return (
    <h1 className="headline" aria-label={FULL}>
      <span aria-hidden>
        {count === 0 && <Caret />}
        {SEGMENTS.map((seg, s) => (
          <span
            key={s}
            className={[seg.muted && 'headline-muted', seg.trigger && 'flip-trigger'].filter(Boolean).join(' ') || undefined}
            {...(seg.trigger ? triggerProps : {})}
          >
            {seg.text.split(/( )/).map((tok, t) =>
              tok === ' ' ? (
                renderChar(' ')
              ) : tok ? (
                <span key={`w${s}-${t}`} className="word">
                  {[...tok].map(renderChar)}
                </span>
              ) : null,
            )}
          </span>
        ))}
      </span>
    </h1>
  )
}

function Caret({ done }) {
  return <span className={done ? 'caret caret-done' : 'caret'} />
}
