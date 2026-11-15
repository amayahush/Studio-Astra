import { useState } from 'react'
import TypedHeadline from './TypedHeadline.jsx'

// Two things the header can say. The grey lead-in is the switch: click it to flip.
const VERSIONS = {
  brief: [
    { text: 'As designers, we were asked to examine', muted: true, trigger: true },
    { text: ' how engineers actually work with agentic AI today and how this collaboration could be enhanced for tomorrow.' },
  ],
  insight: [
    { text: 'Requirements surface mid-build from scattered conversations,', muted: true, trigger: true },
    { text: " so I built Astra, a living source of truth that keeps engineers’ specs current: AI tracks every change, people decide what ships." },
  ],
}

export default function Headline() {
  const [mode, setMode] = useState('brief')
  const [flipped, setFlipped] = useState(false)
  const [hint, setHint] = useState(false) // shows the "click to flip" note beside the meta line

  const flip = () => {
    setFlipped(true)
    setMode((m) => (m === 'brief' ? 'insight' : 'brief'))
  }
  const triggerProps = {
    role: 'button',
    tabIndex: 0,
    'aria-label': mode === 'brief' ? 'Flip to what I found' : 'Flip back to the brief',
    onClick: flip,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        flip()
      }
    },
    onMouseEnter: () => setHint(true),
    onMouseLeave: () => setHint(false),
    onFocus: () => setHint(true),
    onBlur: () => setHint(false),
  }

  return (
    <>
      <p className="meta">
        Amaya Hush // GD 503 Studio // Fall 2026
        <span className={`flip-hint${hint ? ' is-on' : ''}`} aria-hidden>
          ↻ click to flip
        </span>
      </p>
      {/* Both versions sit invisibly in the same grid cell so the header keeps the
          height of the longer one and the cards never jump when you flip. */}
      <div className="headline-stack">
        {Object.entries(VERSIONS).map(([key, segs]) => (
          <p key={key} className="headline headline-ghost" aria-hidden>
            {segs.map((s, i) => (
              <span key={i} className={s.muted ? 'headline-muted' : undefined}>{s.text}</span>
            ))}
          </p>
        ))}
        <TypedHeadline
          key={mode}
          segments={VERSIONS[mode]}
          startDelay={flipped ? 120 : 350}
          charMs={flipped ? 20 : 26}
          triggerProps={triggerProps}
        />
      </div>
    </>
  )
}
