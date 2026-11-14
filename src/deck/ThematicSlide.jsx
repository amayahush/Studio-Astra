import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { NOTES, TAGS, GROUPS, SET_ASIDE, THEMES } from './thematicData.js'

// Thematic analysis: every note from the interviews, then → tags them, groups the tags,
// rebuilds the groups as themes, and ends on the thematic map of who hands what to whom.
export const THEMATIC_STEPS = 4

export const THEMATIC_CAPTIONS = [
  `${NOTES.length} notes from the interviews, one idea each. Hover any of them to read it.`,
  'I tagged every note. Sixteen tags answered my research question. Six didn’t, so I set them aside.',
  'Then I grouped the tags by where they sit in a requirement’s life: where it starts, how it’s handed off, how it changes, and where AI fits.',
  'The groups didn’t hold as findings, so I rebuilt them into themes. Some tags crossed groups, and two didn’t make it in.',
  'Requirements start with business leaders and pass through the PM to design and development. Each number marks where one of my themes breaks that relay. Click one to see its path.',
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
            <div
              className={`ta-peek${L.wall[hover][1] > H * 0.55 ? ' is-above' : ''}`}
              style={{ left: Math.min(Math.max(L.wall[hover][0], 115), W - 115), top: L.wall[hover][1] }}
            >
              <b className="hand">{NOTES[hover].p}</b> {NOTES[hover].text}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// The thematic map: PM, designer and developer as overlapping pencil circles, AI tools in the
// middle, and the paths requirements actually take between them.
const STAR = 'M8.1 0.6C8.5 -0.2 9.7 -0.2 10.0 0.6L11.9 5.7C12.0 5.9 12.2 6.2 12.5 6.3L17.5 8.1C18.4 8.5 18.4 9.7 17.5 10.0L12.5 11.9C12.2 12.0 12.0 12.2 11.9 12.5L10.0 17.5C9.7 18.4 8.5 18.4 8.1 17.5L6.3 12.5C6.2 12.2 5.9 12.0 5.7 11.9L0.6 10.0C-0.2 9.7 -0.2 8.5 0.6 8.1L5.7 6.3C5.9 6.2 6.2 5.9 6.3 5.7L8.1 0.6Z'

// a pencil loop: lumpy circle that overshoots where it started
function pencil(cx, cy, r, seed) {
  const pts = []
  const steps = 64
  for (let s = 0; s <= steps; s++) {
    const t = (s / steps) * Math.PI * 2 * 1.04 - Math.PI / 2 + seed
    const rr = r + Math.sin(t * 3 + seed * 2) * 2.4 + Math.cos(t * 5 + seed) * 1.6 + (s / steps) * 4
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr])
  }
  return pts.map(([x, y], n) => `${n ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
}

const CIRCLES = [
  { id: 'pm', x: 385, y: 290, r: 175, seed: 0.4, tint: '#ffe08a', ink: '#8a6400' },
  { id: 'ds', x: 615, y: 290, r: 175, seed: 2.1, tint: '#ffb3e4', ink: '#b0328a' },
  { id: 'dv', x: 500, y: 445, r: 175, seed: 4.0, tint: '#a8e3b6', ink: '#2c8a45' },
]
const ROLES = [
  { text: 'Product Manager', x: 262, y: 250, bg: '#ffd75e', fg: '#3d2c00' },
  { text: 'Designer', x: 738, y: 250, bg: '#f28bd0', fg: '#3b0a2c' },
  { text: 'Developer', x: 500, y: 566, bg: '#7fd496', fg: '#0d3317' },
]
const EDGES = [
  { d: 'M 448 52 C 330 56 268 120 262 228', label: 'Gives strict orders on what has to be done', lx: 228, ly: 108 },
  { d: 'M 552 52 C 670 56 732 120 738 228', label: 'Walkthrough feedback', lx: 790, ly: 108, both: true },
  { d: 'M 350 252 C 440 244 560 244 652 252', label: 'Problem and jobs to be done', lx: 500, ly: 228 },
  { d: 'M 285 270 C 300 340 400 352 458 356', label: 'Visualize solutions quickly', lx: 318, ly: 372 },
  { d: 'M 232 272 C 140 400 250 566 440 568', label: 'Create Jira stories', lx: 168, ly: 470 },
  { d: 'M 768 272 C 860 400 750 566 560 568', label: 'Handoff, mostly one-way', lx: 838, ly: 470 },
  { d: 'M 500 546 C 498 480 502 420 500 380', label: 'Scoping out a task', lx: 566, ly: 450 },
]

// where each theme shows up on the relay (my reading of the map)
// edges = indexes into EDGES, roles = which tags stay lit when the callout is clicked
const CALLOUTS = [
  { n: 1, x: 122, y: 352, text: 'Requirements show up only after building starts', edges: [0, 4], roles: ['bl', 'pm', 'dv'] },
  { n: 2, x: 845, y: 395, text: 'The why gets lost in a one-way handoff', edges: [4, 5], roles: ['pm', 'ds', 'dv'] },
  { n: 3, x: 500, y: 168, text: 'The real coordination happens in conversation', edges: [1, 2], roles: ['bl', 'pm', 'ds'] },
  { n: 4, x: 660, y: 360, text: 'AI executes, people still define', edges: [3, 6], roles: ['pm', 'dv', 'ai'] },
]
const ROLE_IDS = ['pm', 'ds', 'dv']

function ThematicMap({ on }) {
  const [active, setActive] = useState(null)
  useEffect(() => { if (!on) setActive(null) }, [on])
  const act = CALLOUTS.find((c) => c.n === active)
  const litEdge = (i) => (act ? (act.edges.includes(i) ? ' is-hl' : ' is-dim') : '')
  const litRole = (id) => (act ? (act.roles.includes(id) ? '' : ' is-dim') : '')
  return (
    <div className={`tm${on ? ' is-on' : ''}${act ? ' has-active' : ''}`} aria-hidden={!on} style={act ? { '--hl': THEMES[act.n - 1].ink } : undefined}>
      {on && act && <button type="button" className="tm-clear" aria-label="Clear highlight" onClick={() => setActive(null)} />}
      <svg className="tm-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <defs>
          <marker id="tm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 1.5 1.5 L 8.5 5 L 1.5 8.5" fill="none" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {CIRCLES.map((c, i) => (
          <g key={c.id} style={{ '--d': `${i * 220}ms` }}>
            <circle className="tm-fill" cx={c.x} cy={c.y} r={c.r} fill={c.tint} />
            <path className="tm-circle" d={pencil(c.x, c.y, c.r, c.seed)} pathLength="1" />
            <path className="tm-circle is-ghost" d={pencil(c.x + 1.5, c.y - 1, c.r - 1.5, c.seed + 0.7)} pathLength="1" />
          </g>
        ))}
        {EDGES.map((e, i) => (
          <path key={i} className={`tm-edge${litEdge(i)}`} d={e.d} pathLength="1" markerEnd="url(#tm-arrow)" markerStart={e.both ? 'url(#tm-arrow)' : undefined} style={{ '--d': `${900 + i * 150}ms` }} />
        ))}
      </svg>
      {ROLES.map((r, i) => (
        <span key={r.text} className={`tm-role${litRole(ROLE_IDS[i])}`} style={{ left: r.x, top: r.y, background: r.bg, color: r.fg, '--d': `${500 + i * 150}ms` }}>{r.text}</span>
      ))}
      <span className={`tm-role tm-ai${litRole('ai')}`} style={{ left: 500, top: 360, '--d': '850ms' }}>AI tools</span>
      <span className={`tm-role tm-bl${litRole('bl')}`} style={{ left: 500, top: 46, '--d': '700ms' }}>Business leaders &amp; customers</span>
      {CALLOUTS.map((c, i) => (
        <button
          key={c.n}
          type="button"
          className={`tm-callout${active === c.n ? ' is-active' : act ? ' is-dim' : ''}`}
          style={{ left: c.x, top: c.y, '--c': THEMES[c.n - 1].color, '--k': THEMES[c.n - 1].ink, '--d': `${2400 + i * 350}ms` }}
          onClick={() => setActive(active === c.n ? null : c.n)}
          aria-pressed={active === c.n}
        >
          <b>{c.n}</b>
          <span>{c.text}{active === c.n && <em>Theme {c.n}: {THEMES[c.n - 1].name}</em>}</span>
        </button>
      ))}
      {EDGES.map((e, i) => (
        <span key={i} className={`tm-edge-label${litEdge(i)}`} style={{ left: e.lx, top: e.ly, '--d': `${1200 + i * 150}ms` }}>{e.label}</span>
      ))}
    </div>
  )
}
