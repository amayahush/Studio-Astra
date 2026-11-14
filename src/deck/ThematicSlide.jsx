import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { NOTES, TAGS, GROUPS, SET_ASIDE, THEMES } from './thematicData.js'

// Thematic analysis: every note from the interviews, then → tags them, groups the tags,
// rebuilds the groups as themes, and ends on the thematic map of who hands what to whom.
export const THEMATIC_STEPS = 4

export const THEMATIC_CAPTIONS = [
  `${NOTES.length} notes from the interviews, one idea each. Hover any of them to read it.`,
  'I tagged every note. Sixteen tags answered my research question. Six didn’t, so I set them aside.',
  'Then I grouped the tags by where they sit in a requirement’s life: where it starts, how it’s handed off, how it changes, and where AI fits.',
  'The groups didn’t hold as findings, so I rebuilt them into themes. Some tags crossed groups, and two didn’t make it in.',
  'Mapped back onto the people, the themes show where requirements actually travel, and where AI sits in the middle.',
]

const W = 1000
const H = 640
const NW = 50
const NH = 38

// small seeded random so the wall looks the same every time
function rand(seed) {
  let s = seed * 9301 + 49297
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

const TAG_IDS = Object.keys(TAGS)
const THEME_OF = {}
THEMES.forEach((t) => t.tags.forEach((g) => (THEME_OF[g] = t)))

// --- layouts: each returns { [tagId]: [x, y] } pile centers ---
function step1Piles() {
  const order = [...TAG_IDS].sort((a, b) => TAGS[b].used - TAGS[a].used)
  const out = {}
  order.forEach((id, i) => {
    const col = i % 6
    const row = Math.floor(i / 6)
    out[id] = [95 + col * 162, 95 + row * 150]
  })
  return out
}
const COLS = [125, 375, 625, 875]
function step2Piles() {
  const out = {}
  GROUPS.forEach((g, c) => g.tags.forEach((id, r) => (out[id] = [COLS[c], 150 + r * 128])))
  SET_ASIDE.forEach((id) => (out[id] = [W / 2, H + 120]))
  return out
}
function step3Piles() {
  const out = { ...step2Piles() }
  THEMES.forEach((t, c) => t.tags.forEach((id, r) => (out[id] = [COLS[c], 200 + r * 104])))
  out.O4 = [COLS[0] + 20, H + 120]
  out.C2 = [COLS[2] + 20, H + 120]
  return out
}

function useLayout() {
  return useMemo(() => {
    const r = rand(7)
    const cols = 17
    const cw = W / cols
    const ch = H / Math.ceil(NOTES.length / cols)
    const wall = NOTES.map((_, i) => {
      const c = i % cols
      const row = Math.floor(i / cols)
      return [cw * c + cw / 2 + (r() - 0.5) * 10, ch * row + ch / 2 + (r() - 0.5) * 12, (r() - 0.5) * 12]
    })
    const idxInTag = {}
    const pileJitter = NOTES.map((n) => {
      const k = (idxInTag[n.tag] = (idxInTag[n.tag] ?? -1) + 1)
      const shown = Math.min(k, 6)
      return { k, dx: (r() - 0.5) * 8 + shown * 1.2, dy: -shown * 2.2, rot: (r() - 0.5) * 9 }
    })
    return { wall, pileJitter, piles: [null, step1Piles(), step2Piles(), step3Piles()] }
  }, [])
}

function noteStyle(i, n, step, L) {
  if (step === 0) {
    const [x, y, rot] = L.wall[i]
    return { transform: `translate(${x - NW / 2}px, ${y - NH / 2}px) rotate(${rot}deg)`, zIndex: 1 }
  }
  const s = Math.min(step, 3)
  const [px, py] = L.piles[s][n.tag]
  const j = L.pileJitter[i]
  const z = 100 - j.k
  if (step >= 4) {
    return { transform: `translate(${W / 2 - NW / 2}px, ${H / 2 - NH / 2}px) rotate(${j.rot}deg) scale(0.2)`, opacity: 0, zIndex: z }
  }
  return { transform: `translate(${px - NW / 2 + j.dx}px, ${py - NH / 2 + j.dy}px) rotate(${j.rot}deg)`, zIndex: z }
}

function noteColor(n, step) {
  if (step === 1 && TAGS[n.tag].group === 'X') return '#d6d6d6'
  if (step === 3) return THEME_OF[n.tag]?.color ?? '#fff'
  return '#fff'
}

export default function ThematicSlide({ step }) {
  const L = useLayout()
  const boxRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [hover, setHover] = useState(null)

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pileLabels = step >= 1 && step <= 3 ? L.piles[step] : null

  return (
    <div className="ta">
      <div className={`ta-stage is-step-${step}`} ref={boxRef}>
        <div className="ta-canvas" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${scale})` }}>
          {/* group headers (step 2) */}
          {GROUPS.map((g, c) => (
            <span key={g.id} className={`ta-head hand${step === 2 ? ' is-on' : ''}`} style={{ left: COLS[c], top: 48 }}>{g.name}</span>
          ))}
          {/* theme headers (step 3) */}
          {THEMES.map((t, c) => (
            <div key={t.id} className={`ta-theme${step === 3 ? ' is-on' : ''}`} style={{ left: COLS[c], top: 24, '--ink': t.ink, '--d': `${c * 90}ms` }}>
              <span className="hand">Theme {c + 1}</span>
              <b>{t.name}</b>
            </div>
          ))}
          {step === 1 && <span className="ta-aside-note hand" style={{ left: 95 + 3 * 162, top: 95 + 3 * 150 + 78 }}>grey = outside my research question</span>}
          {step === 3 && <span className="ta-aside-note hand is-bottom">Ticket anatomy and Feasibility negotiation didn’t fit a theme</span>}

          {NOTES.map((n, i) => (
            <div
              key={i}
              className={`ta-note${step === 0 ? ' is-wall' : ''}${step >= 2 && TAGS[n.tag].group === 'X' ? ' is-gone' : ''}${step === 3 && !THEME_OF[n.tag] ? ' is-gone' : ''}`}
              style={{ ...noteStyle(i, n, step, L), background: noteColor(n, step), '--d': `${(i % 40) * 9}ms` }}
              onMouseEnter={step === 0 ? () => setHover(i) : undefined}
              onMouseLeave={step === 0 ? () => setHover(null) : undefined}
            >
              <span>{n.text}</span>
            </div>
          ))}

          {pileLabels && TAG_IDS.map((id) => {
            const [x, y] = pileLabels[id]
            const gone = (step >= 2 && TAGS[id].group === 'X') || (step === 3 && !THEME_OF[id])
            return (
              <span key={id} className={`ta-label${TAGS[id].group === 'X' ? ' is-aside' : ''}${gone ? ' is-gone' : ''}`} style={{ left: x, top: y + 34 }}>
                {TAGS[id].name} <i>{TAGS[id].used}</i>
              </span>
            )
          })}

          <ThematicMap on={step >= 4} />

          {hover !== null && step === 0 && (
            <div className="ta-peek" style={{ left: L.wall[hover][0], top: L.wall[hover][1] }}>
              <b className="hand">{NOTES[hover].p}</b> {NOTES[hover].text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// The thematic map: PM, designer and developer as overlapping circles, AI tools in the middle,
// and the paths requirements actually take between them.
const PEOPLE = {
  pm: { x: 375, y: 300, r: 205, fill: '#ffd76a', label: 'Product Manager (PM)', lx: 270, ly: 262, pill: '#f6c54a', ink: '#3a2c00' },
  ds: { x: 620, y: 285, r: 205, fill: '#f6a6dd', label: 'Designer', lx: 700, ly: 262, pill: '#e159bd', ink: '#fff' },
  dv: { x: 500, y: 455, r: 205, fill: '#a9e3b4', label: 'Developer', lx: 500, ly: 585, pill: '#69c97c', ink: '#0d3315' },
}
const EDGES = [
  { d: 'M 455 52 C 300 70 270 150 270 245', label: 'Gives strict orders on what has to be done', lx: 250, ly: 120 },
  { d: 'M 700 245 C 700 150 640 70 545 52', label: 'Walkthrough feedback', lx: 700, ly: 120, both: true },
  { d: 'M 345 262 L 650 262', label: 'Problem and jobs to be done', lx: 500, ly: 250 },
  { d: 'M 230 278 C 200 330 300 360 470 345', label: 'Visualize solutions quickly', lx: 235, ly: 318 },
  { d: 'M 210 270 C 120 360 220 560 440 585', label: 'Create Jira stories', lx: 150, ly: 450 },
  { d: 'M 760 278 C 840 380 760 560 560 585', label: 'Handoff, mostly one-way', lx: 830, ly: 450 },
  { d: 'M 500 568 L 500 362', label: 'Scoping out a task', lx: 500, ly: 470 },
]

function ThematicMap({ on }) {
  return (
    <div className={`tm${on ? ' is-on' : ''}`} aria-hidden={!on}>
      <svg className="tm-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <marker id="tm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#5b5b5b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {Object.entries(PEOPLE).map(([k, p], i) => (
          <circle key={k} className="tm-circle" cx={p.x} cy={p.y} r={p.r} fill={p.fill} style={{ '--d': `${i * 160}ms` }} />
        ))}
        {EDGES.map((e, i) => (
          <path key={i} className="tm-edge" d={e.d} pathLength="1" markerEnd="url(#tm-arrow)" markerStart={e.both ? 'url(#tm-arrow)' : undefined} style={{ '--d': `${700 + i * 140}ms` }} />
        ))}
      </svg>
      {Object.entries(PEOPLE).map(([k, p], i) => (
        <span key={k} className="tm-pill" style={{ left: p.lx, top: p.ly, background: p.pill, color: p.ink, '--d': `${400 + i * 120}ms` }}>{p.label}</span>
      ))}
      <span className="tm-pill is-ai" style={{ left: 500, top: 345, '--d': '700ms' }}>AI tools</span>
      <span className="tm-pill is-bl" style={{ left: 500, top: 40, '--d': '600ms' }}>Business leaders<br />&amp; customers</span>
      {EDGES.map((e, i) => (
        <span key={i} className="tm-edge-label" style={{ left: e.lx, top: e.ly, '--d': `${1000 + i * 140}ms` }}>{e.label}</span>
      ))}
    </div>
  )
}
