import { useEffect, useRef, useState } from 'react'

// Wireframes: how the screens evolved, low-fi → mid-fi v1 → v2 → coded mid-fi → high-fi.
// Each step compares two versions of the same moment with a drag slider, plus what changed
// and the tradeoff. Developer / PM / Designer tabs switch which moment is compared.
const shots = import.meta.glob('../art/wf/*.webp', { eager: true, import: 'default' })
const img = (role, v) => shots[`../art/wf/${role}-${v}.webp`]

export const WIRE_STEPS = 3

export const WIRE_CAPTIONS = [
  'I started with grey boxes for one flow: a developer notices a mismatch, the PM decides, the designer hears about it. Mid-fi v1 turned the boxes into a real PRD. Drag to compare.',
  'v2 asked what it would take to feel like a living tool, so the PRD got a workspace and connections to the tools people already use.',
  'Then I moved the story to where people actually work. It now starts in Codex, with a scenario taken from my interviews.',
  'High-fi was about trust and realism: facts instead of AI opinions, the real Figma UI, and a longer PRD.',
]

const VERSIONS = [
  { id: 'low', label: 'Low-fi' },
  { id: 'mid1', label: 'Mid-fi v1' },
  { id: 'mid2', label: 'Mid-fi v2' },
  { id: 'mid4', label: 'Coded mid-fi' },
  { id: 'high', label: 'High-fi' },
]

const ROLES = [
  { id: 'dev', label: 'Developer' },
  { id: 'pm', label: 'PM' },
  { id: 'des', label: 'Designer' },
]

const PAIRS = [
  {
    role: 'pm',
    changes: [
      'The three-panel layout from my sketches stayed: doc in the middle, decision on the right.',
      'Requirements got numbers, owners and a status, so a change points at something specific.',
      'Role slices let each person see only their part.',
    ],
    tradeoff: 'One standalone tool kept the flow simple to test, but everyone had to come to it.',
  },
  {
    role: 'pm',
    changes: [
      'A workspace around the PRD: projects, inbox, and tools connected over MCP.',
      'Evidence links straight to the Teams call it came from.',
      'One approval also updates Jira, Figma and Teams.',
    ],
    tradeoff: 'More connected, but the PM panel got crowded and people still had to open the PRD to act.',
  },
  {
    role: 'dev',
    changes: [
      'Codex spots the gap and prints one quiet line instead of an alert.',
      'The scenario became R4: the PRD says every 15 minutes, the data only updates hourly.',
      'The PM can ask for more evidence, a moment of friction instead of an easy yes.',
    ],
    tradeoff: 'Living inside other tools means following their rules. Codex can read the PRD but can’t change it.',
  },
  {
    role: 'des',
    changes: [
      'Facts only: PRD and API side by side, without the AI deciding for the developer.',
      'Figma rebuilt as the real UI, with Relay as a plugin window and no banner.',
      'A longer PRD grouped by Jira epic, including an AI draft.',
    ],
    tradeoff: 'Taking out the AI’s reasoning asks a bit more of the developer, but the call stays theirs.',
  },
]

function Compare({ before, after, beforeLabel, afterLabel, sweepKey }) {
  const box = useRef(null)
  const [pos, setPos] = useState(50)
  const [sweep, setSweep] = useState(false)
  const drag = useRef(false)

  // each new pair opens with a quick sweep so it's clear the frame can be dragged
  useEffect(() => {
    setSweep(true)
    setPos(92)
    const a = setTimeout(() => setPos(50), 450)
    const b = setTimeout(() => setSweep(false), 1400)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [sweepKey])

  const moveTo = (clientX) => {
    const r = box.current.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }
  const down = (e) => {
    drag.current = true
    setSweep(false)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    moveTo(e.clientX)
  }
  const onKey = (e) => {
    const d = e.key === 'ArrowLeft' ? -5 : e.key === 'ArrowRight' ? 5 : 0
    if (!d) return
    e.preventDefault()
    e.stopPropagation()
    setSweep(false)
    setPos((p) => Math.min(100, Math.max(0, p + d)))
  }

  return (
    <div
      className={`wr-compare${sweep ? ' is-sweep' : ''}`}
      ref={box}
      onPointerDown={down}
      onPointerMove={(e) => drag.current && moveTo(e.clientX)}
      onPointerUp={() => { drag.current = false }}
      onPointerCancel={() => { drag.current = false }}
    >
      <img src={before} alt={`${beforeLabel} screen`} draggable="false" />
      <div className="wr-after" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img src={after} alt={`${afterLabel} screen`} draggable="false" />
      </div>
      <span className="wr-chip is-before" style={{ opacity: pos < 14 ? 0 : 1 }}>{beforeLabel}</span>
      <span className="wr-chip is-after" style={{ opacity: pos > 86 ? 0 : 1 }}>{afterLabel}</span>
      <div
        className="wr-handle"
        style={{ left: `${pos}%` }}
        role="slider"
        tabIndex={0}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKey}
      >
        <span className="wr-knob" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 7 L4 12 L9 17 M15 7 L20 12 L15 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      </div>
    </div>
  )
}

export default function WireframesSlide({ step }) {
  const pair = PAIRS[step] ?? PAIRS[0]
  const [role, setRole] = useState(pair.role)
  useEffect(() => { setRole(pair.role) }, [step])
  const a = VERSIONS[step]
  const b = VERSIONS[step + 1]

  return (
    <div className="wr">
      <ol className="wr-rail" aria-label="Versions">
        {VERSIONS.map((v, i) => (
          <li key={v.id} className={i === step ? 'is-before' : i === step + 1 ? 'is-after' : i < step ? 'is-past' : ''}>
            <i aria-hidden="true" />{v.label}
          </li>
        ))}
      </ol>

      <div className="wr-body">
        <div className="wr-left">
          <Compare
            before={img(role, a.id)}
            after={img(role, b.id)}
            beforeLabel={a.label}
            afterLabel={b.label}
            sweepKey={`${step}-${role}`}
          />
          <div className="wr-roles" role="tablist" aria-label="Which moment">
            <span>Compare the</span>
            {ROLES.map((r) => (
              <button key={r.id} type="button" role="tab" aria-selected={role === r.id} className={role === r.id ? 'is-on' : ''}
                onClick={(e) => { e.currentTarget.blur(); setRole(r.id) }}>
                {r.label}
              </button>
            ))}
            <span>view</span>
          </div>
        </div>

        <aside className="wr-notes" key={step}>
          <small>What changed</small>
          <ul>
            {pair.changes.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <div className="wr-trade">
            <small>Tradeoff</small>
            <p>{pair.tradeoff}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
