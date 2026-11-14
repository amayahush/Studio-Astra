import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { NODES, EDGES, PRD_PATH } from './ecosystemData.js'

// Ecosystem map: my final map, rebuilt from Figma. → walks from the whole map, to how to read the
// rings, through each phase, to the loop back. Legend chips filter by category; hover any note;
// "Follow the PRD" traces the requirements doc around the whole circle.
export const ECO_STEPS = 6

export const ECO_CAPTIONS = [
  'Everyone and everything a single requirement touches, from first idea to launch. I focused on phase 1, identifying the need. Hover any note to read it.',
  'Read it from the middle out: what people need, how they work together to get it, and the people, tools and documents they touch.',
  'Phase 1, identifying a need. Requirements start as conversations: workshops, customer calls and prototypes, turned into a rough PRD from meeting notes, emails and decks.',
  'Phase 2, writing requirements. The PRD gets shared, broken into Jira tickets and planned into sprints, while the PM keeps talking to customers.',
  'Phase 3, building. Requirements change mid-build, so developers rework or reskin. Change requests land in Teams chats.',
  'Phase 4, deploying. The PM reviews requirements and shows customers, and after launch end users send feedback.',
  'Post-launch feedback and mid-build changes become new requirements. The PRD is meant to be the source of truth, but it falls behind, and people go back and forth to recover context. That’s why I focused on phase 1, where requirements first take shape.',
]

const CATS = [
  { id: 'actor', label: 'People', color: '#ffa8db' },
  { id: 'tool', label: 'Tools', color: '#8fd384' },
  { id: 'interaction', label: 'Interactions', color: '#ffe299' },
  { id: 'need', label: 'Needs', color: '#a8daff' },
  { id: 'artifact', label: 'Documents', color: '#d9e6d6' },
]
const CAT_COLOR = Object.fromEntries(CATS.map((c) => [c.id, c.color]))

// the map is laid out in big Figma units; K shrinks it so the moving layer stays small for the GPU
const K = 0.25
const R = { core: 435, needs: 1000, inter: 1801, touch: 2702, outer: 3120 }
// camera per step: center (map units) and the box that has to fit
const VIEWS = [
  { cx: 0, cy: -120, w: 7000, h: 7000 },
  { cx: 0, cy: 0, w: 6600, h: 6600 },
  { cx: 1350, cy: -1150, w: 2800, h: 2500, q: 1 },
  { cx: 1350, cy: 1250, w: 2800, h: 2700, q: 2 },
  { cx: -1350, cy: 1250, w: 2900, h: 2700, q: 3 },
  { cx: -1350, cy: -1150, w: 2800, h: 2500, q: 4 },
  { cx: 0, cy: -260, w: 7400, h: 7400 },
]
const inQuad = (n, q) => (q === 1 ? n.x >= 0 && n.y < 0 : q === 2 ? n.x >= 0 && n.y >= 0 : q === 3 ? n.x < 0 && n.y >= 0 : n.x < 0 && n.y < 0)
const ring = (n) => {
  const r = Math.hypot(n.x, n.y)
  return r < R.needs ? 'needs' : r < R.inter ? 'inter' : 'touch'
}

// quarter-annulus path for the active phase
function wedge(q) {
  const a0 = { 1: -90, 2: 0, 3: 90, 4: 180 }[q] * (Math.PI / 180)
  const a1 = a0 + Math.PI / 2
  const p = (r, a) => `${(Math.cos(a) * r).toFixed(0)} ${(Math.sin(a) * r).toFixed(0)}`
  return `M ${p(R.core, a0)} L ${p(R.outer, a0)} A ${R.outer} ${R.outer} 0 0 1 ${p(R.outer, a1)} L ${p(R.core, a1)} A ${R.core} ${R.core} 0 0 0 ${p(R.core, a0)} Z`
}

const PHASES = [
  { n: 1, x: 2238, y: -1862, label: 'Identifying a product need', lx: 2400, ly: -2080, anchor: 'start' },
  { n: 2, x: 2393, y: 1640, label: 'Writing requirements & assigning tasks', lx: 2560, ly: 1880, anchor: 'start' },
  { n: 3, x: -2421, y: 1644, label: 'Building', lx: -2580, ly: 1880, anchor: 'end' },
  { n: 4, x: -2237, y: -1860, label: 'Deploying', lx: -2400, ly: -2080, anchor: 'end' },
]

export default function EcosystemSlide({ step }) {
  const boxRef = useRef(null)
  const [size, setSize] = useState({ w: 900, h: 700 })
  const [filter, setFilter] = useState(null) // category id or 'prd'
  const [hover, setHover] = useState(null)
  // small delay so sweeping the mouse across the map doesn't flash every note
  const hoverTimer = useRef(null)
  const hoverTo = (id) => {
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => setHover(id), id ? 90 : 60)
  }
  useEffect(() => { setHover(null) }, [step])

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const fit = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const v = VIEWS[step] ?? VIEWS[0]
  const base = Math.min(size.w / v.w, size.h / v.h)
  // user zoom + pan on top of the step's camera; reset whenever the step changes
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [moving, setMoving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const moveTimer = useRef(null)
  const flagMove = () => {
    setMoving(true)
    clearTimeout(moveTimer.current)
    moveTimer.current = setTimeout(() => setMoving(false), 1250)
  }
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); flagMove() }, [step])
  const s = base * zoom
  const tx = size.w / 2 + pan.x - v.cx * s
  const ty = size.h / 2 + pan.y - v.cy * s
  const toScreen = (x, y) => [tx + x * s, ty + y * s]

  const zoomAt = (factor, px = size.w / 2, py = size.h / 2, animate = true) => {
    // never smaller than the step's own framing; back at 1x it snaps to center
    const z2 = Math.min(5, Math.max(1, zoom * factor))
    const k = z2 / zoom
    const cx = px - size.w / 2
    const cy = py - size.h / 2
    setPan(z2 === 1 ? { x: 0, y: 0 } : { x: cx - (cx - pan.x) * k, y: cy - (cy - pan.y) * k })
    setZoom(z2)
    if (animate) flagMove()
  }
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); flagMove() }

  const drag = useRef(null)
  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('.eco-legend, .eco-zoom, button')) return
    e.preventDefault()
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.moved && Math.hypot(dx, dy) < 4) return
    if (!d.moved) { d.moved = true; setDragging(true); setHover(null); e.currentTarget.setPointerCapture?.(e.pointerId) }
    setPan({ x: d.px + dx, y: d.py + dy })
  }
  const endDrag = () => { drag.current = null; setDragging(false) }
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    // pinch on a trackpad (or ctrl/cmd + scroll) zooms around the cursor
    const onWheel = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top, false)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })

  const links = useMemo(() => {
    const m = {}
    EDGES.forEach((e, i) => [e.from, e.to].forEach((id) => id && (m[id] = [...(m[id] || []), i])))
    return m
  }, [])
  const hoverEdges = hover ? new Set(links[hover] || []) : null
  const hoverNeighbors = hover
    ? new Set((links[hover] || []).flatMap((i) => [EDGES[i].from, EDGES[i].to]))
    : null

  const prdSet = new Set(PRD_PATH)
  const prdPts = PRD_PATH.map((id) => NODES.find((n) => n.id === id))

  function nodeState(n) {
    if (filter === 'prd') return prdSet.has(n.id) ? 'prd' : 'dim'
    if (filter) return n.c === filter ? 'cat' : 'dim'
    if (step === 1) return 'ring-' + ring(n)
    if (v.q) return inQuad(n, v.q) ? 'on' : 'dim'
    return 'on'
  }

  const showLoop = step === 6

  return (
    <div className="eco">
      <div
        className={`eco-stage is-step-${step}${filter ? ' is-filtering' : ''}${moving || dragging ? ' is-moving' : ''}${dragging ? ' is-dragging' : ''}${zoom !== 1 || pan.x || pan.y ? ' is-zoomed' : ''}`}
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div className="eco-canvas" style={{ transform: `translate(${tx}px, ${ty}px) scale(${s / K})` }}>
         <div className="eco-world" style={{ transform: `scale(${K})` }}>
          <svg className="eco-svg" viewBox="-4000 -4000 8000 8000" width="8000" height="8000" style={{ left: -4000, top: -4000 }}>
            <defs>
              <marker id="eco-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#c439ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            <circle r={R.outer} className="eco-ring is-outer" />
            {v.q && <path key={v.q} d={wedge(v.q)} className="eco-wedge" />}
            {!v.q && step !== 1 && <path d={wedge(1)} className="eco-wedge is-focus" />}
            <circle r={R.touch} className={`eco-ring${step === 1 ? ' is-hl-touch' : ''}`} />
            <circle r={R.inter} className={`eco-ring${step === 1 ? ' is-hl-inter' : ''}`} />
            <circle r={R.needs} className={`eco-ring is-dash${step === 1 ? ' is-hl-needs' : ''}`} />
            <line x1={-R.outer} y1="0" x2={R.outer} y2="0" className="eco-axis" />
            <line x1="0" y1={-R.outer} x2="0" y2={R.outer} className="eco-axis" />
            {EDGES.map((e, i) => (
              <line key={i} x1={e.a[0]} y1={e.a[1]} x2={e.z[0]} y2={e.z[1]}
                className={`eco-edge${e.s ? ' is-dash' : ''}${hoverEdges?.has(i) ? ' is-hl' : ''}`} />
            ))}
            <circle r={R.core} className="eco-core" />
            {filter === 'prd' && (
              <polyline className="eco-prd" points={prdPts.map((n) => `${n.x},${n.y}`).join(' ')} markerMid="url(#eco-arrow)" markerEnd="url(#eco-arrow)" pathLength="1" />
            )}
            <path className={`eco-loop${showLoop ? ' is-on' : ''}`} d="M -2330 -2020 C -1700 -3700 1700 -3700 2130 -2060" pathLength="1" markerEnd="url(#eco-arrow)" />
          </svg>

          <div className="eco-core-text" style={{ left: 0, top: 0 }}>
            <small>The theme I’m investigating</small>
            <b>Keeping requirements clear as they evolve</b>
          </div>

          {[['needs', 715], ['interactions', 1400], ['touchpoints', 2250]].map(([t, x]) => (
            <span key={t} className={`eco-ringlabel hand${step === 1 ? ' is-on' : ''}`} style={{ left: x, top: 0 }}>{t}</span>
          ))}

          {PHASES.map((p) => (
            <div key={p.n} className={`eco-phase${v.q === p.n || (!v.q && step !== 1 && p.n === 1) ? ' is-active' : ''}${v.q && v.q !== p.n ? ' is-dim' : ''}`}>
              <span className="eco-phase-n" style={{ left: p.x, top: p.y }}>{p.n}</span>
              <span className={`eco-phase-label hand is-${p.anchor}`} style={{ left: p.lx, top: p.ly }}>{p.label}</span>
            </div>
          ))}

          {!v.q && step !== 1 && (
            <span className="eco-focus-label hand" style={{ left: 2050, top: -2700 }}>my focus</span>
          )}
          <span className={`eco-loop-label hand${showLoop ? ' is-on' : ''}`} style={{ left: 0, top: -3420 }}>loops back: feedback and mid-build changes become new requirements</span>

          {NODES.map((n) => {
            const st = nodeState(n)
            const colored = st === 'cat' || st === 'prd'
            const lit = hoverNeighbors?.has(n.id)
            return (
              <div
                key={n.id}
                className={`eco-node is-${st}${n.s ? ' is-dash' : ''}${lit ? ' is-lit' : ''}${hover === n.id ? ' is-hover' : ''}`}
                style={{ left: n.x, top: n.y, background: colored ? (st === 'prd' ? '#f3e3ff' : CAT_COLOR[n.c]) : undefined }}
                onMouseEnter={() => st !== 'dim' && hoverTo(n.id)}
                onMouseLeave={() => hoverTo(null)}
              >
                {n.t}
              </div>
            )
          })}
         </div>
        </div>

        <div className="eco-zoom" role="group" aria-label="Zoom">
          <button type="button" onClick={() => zoomAt(1.4)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => zoomAt(1 / 1.4)} aria-label="Zoom out" disabled={zoom <= 1}>−</button>
          <button type="button" className="is-fit" onClick={resetView} disabled={zoom === 1 && !pan.x && !pan.y}>Fit</button>
        </div>

        <div className="eco-legend" role="group" aria-label="Filter the map">
          {CATS.map((c) => (
            <button key={c.id} type="button" className={`eco-chip${filter === c.id ? ' is-on' : ''}`} style={{ '--c': c.color }}
              onClick={() => setFilter(filter === c.id ? null : c.id)} aria-pressed={filter === c.id}>
              <i />{c.label}
            </button>
          ))}
          <button type="button" className={`eco-chip is-prd${filter === 'prd' ? ' is-on' : ''}`} onClick={() => setFilter(filter === 'prd' ? null : 'prd')} aria-pressed={filter === 'prd'}>
            Follow the PRD
          </button>
          <span className="eco-chip-note"><i className="is-dash" />dashed = happens sometimes</span>
        </div>

        {hover && (() => {
          const n = NODES.find((m) => m.id === hover)
          const [x, y] = toScreen(n.x, n.y)
          const above = y > size.h * 0.6
          return (
            <div className={`eco-peek${above ? ' is-above' : ''}`} style={{ left: Math.min(Math.max(x, 130), size.w - 130), top: y }}>
              <span style={{ '--c': CAT_COLOR[n.c] }}>{CATS.find((c) => c.id === n.c).label.replace(/s$/, '')}{n.s ? ' · sometimes' : ''}</span>
              {n.t}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
