import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DOCS, GROUPS } from './archiveData'
import './archive.css'

const BASE = import.meta.env.BASE_URL + 'archive/'
const ITEMS = GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, phase: g.name })))
const MAXZ = 12

// Viewer: opens fitted (nothing cut off), then scroll or the buttons to zoom, drag to move around.
function useZoom(resetKey) {
  const [v, setV] = useState({ z: 1, x: 0, y: 0 })
  // base: the scale that fits the whole page in view (documents); images fit by CSS, so 1
  const [base, setBase] = useState(1)
  useEffect(() => { setV({ z: 1, x: 0, y: 0 }); setBase(1) }, [resetKey])
  const zoomAt = useCallback((f, cx = 0, cy = 0) => {
    setV((s) => {
      const z = Math.max(1, Math.min(MAXZ, s.z * f))
      if (z === 1) return { z: 1, x: 0, y: 0 }
      const r = z / s.z
      return { z, x: cx - (cx - s.x) * r, y: cy - (cy - s.y) * r }
    })
  }, [])
  return { v, setV, zoomAt, base, setBase, fit: () => setV({ z: 1, x: 0, y: 0 }) }
}

function ImageView({ item, zoom, onSize }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)
  const { v, setV, zoomAt } = zoom

  // wheel needs a non-passive listener so the page doesn't scroll underneath
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const b = el.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: v.x, y: v.y }
    setDragging(true)
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    setV((s) => ({ ...s, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py }))
  }
  const up = () => { drag.current = null; setDragging(false) }

  return (
    <div
      ref={ref}
      className={`ar-view${dragging ? ' is-dragging' : ''}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onDoubleClick={zoom.fit}
    >
      <img
        src={BASE + item.img + '.webp'}
        alt={item.title}
        draggable="false"
        onLoad={(e) => onSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        className={`ar-sheet${item.dark ? ' is-dark' : ''}`}
        style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.z})`, transition: dragging ? 'none' : undefined }}
      />
      <span className="ar-hint">Scroll to zoom · drag to move around</span>
    </div>
  )
}

function DocView({ item, zoom, tab, setTab }) {
  const d = DOCS[item.id]
  const boxRef = useRef(null)
  const pageRef = useRef(null)
  const eff = zoom.base * zoom.v.z
  const effRef = useRef(eff)
  effRef.current = eff
  const { setBase } = zoom
  // Fit to page = the whole sheet in view with even gray space around it.
  useLayoutEffect(() => {
    const box = boxRef.current
    const page = pageRef.current
    if (!box || !page) return
    const measure = () => {
      const h = page.getBoundingClientRect().height / effRef.current
      const pad = 2 * 28
      const f = Math.min((box.clientWidth - pad) / 612, (box.clientHeight - pad) / h)
      if (f > 0 && Math.abs(f - zoom.base) > 0.002) setBase(f)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    return () => ro.disconnect()
  }, [item.id, tab, setBase, zoom.base])
  if (!d) return null
  const ti = d.tabs ? Math.min(tab, d.tabs.length - 1) : 0
  const blocks = d.tabs ? d.tabs[ti].blocks : d.blocks
  // mini legend: only the codes this document uses
  const codes = (d.tabs ? d.tabs.flatMap((t) => t.blocks) : d.blocks).flatMap((x) => x.r ? x.r.map((g) => g[1]) : [x.c]).filter(Boolean)
  const legend = []
  if (codes.includes('kept')) legend.push(['kept', 'What I carried forward'])
  if (codes.includes('gray')) legend.push(['gray', 'Partly or not found'])
  if (legend.length) legend.unshift(['none', 'Main point'])
  ;[['user', 'User'], ['need', 'Need'], ['insight', 'Insight']].forEach(([c, label]) => { if (codes.includes(c)) legend.push([c, label]) })
  return (
    <div className="ar-docscroll" ref={boxRef}>
      <article className="ar-page" ref={pageRef} style={{ zoom: eff }}>
        <span className="ar-eyebrow">{d.eyebrow}</span>
        <h3>{d.title}</h3>
        {legend.length > 0 && (
          <div className="ar-legend">
            {legend.map(([c, label]) => <span key={c}><span className={`ar-dot c-${c}`} />{label}</span>)}
          </div>
        )}
        {d.tabs && (
          <div className="ar-tabs">
            {d.tabs.map((t, i) => (
              <button key={t.label} type="button" aria-pressed={i === ti} onClick={() => { setTab(i); zoom.fit() }}>{t.label}</button>
            ))}
          </div>
        )}
        {blocks.map((b, i) => {
          if (b.h) return <h4 key={i}>{b.h}</h4>
          if (b.p) return <p key={i}>{b.p}</p>
          if (b.r) return <p key={i} className="ar-pov">{b.r.map(([text, c], j) => <span key={j} className={c ? `pov-${c}` : undefined}>{text}</span>)}</p>
          return (
            <div key={i} className={`ar-item c-${b.c || 'none'}`}>
              <span className="ar-dot" />
              {b.url ? <a className="ar-text ar-link" href={b.url} target="_blank" rel="noopener noreferrer">{b.i} ↗</a> : <span className="ar-text">{b.i}</span>}
              {b.badge && <span className="ar-badge">{b.badge}</span>}
            </div>
          )
        })}
      </article>
    </div>
  )
}

export default function ArchivePanel({ onOpenCard, cardLabels = {} }) {
  const [open, setOpen] = useState(false)
  const [selId, setSelId] = useState(ITEMS[0].id)
  const [tab, setTab] = useState(0)
  const sel = ITEMS.find((i) => i.id === selId) || ITEMS[0]
  const zoom = useZoom(selId)
  const stageRef = useRef(null)
  const [nat, setNat] = useState(null)
  useEffect(() => setNat(null), [selId])
  // Fill: the artifact fills the viewer edge to edge (documents: the page width fills it)
  const fillZ = () => {
    const el = stageRef.current
    if (!el) return 1
    const W = el.clientWidth, H = el.clientHeight
    if (sel.kind === 'doc') return ((W - 56) / 612) / zoom.base
    const img = el.querySelector('.ar-sheet')
    if (!nat || !img) return 1
    // offsetWidth/Height: the fitted sheet (padding included), ignoring the current zoom transform
    return Math.max(W / img.offsetWidth, H / img.offsetHeight)
  }
  const fill = () => zoom.setV({ z: fillZ(), x: 0, y: 0 })
  const isFit = Math.abs(zoom.v.z - 1) < 0.01 && !zoom.v.x && !zoom.v.y
  const isFill = !isFit && Math.abs(zoom.v.z - fillZ()) < 0.01 && !zoom.v.x && !zoom.v.y

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const pick = (id) => { setSelId(id); setTab(0) }
  const isDoc = sel.kind === 'doc'

  return (
    <>
      {!open && (
        <button type="button" className="ar-tab" onClick={() => setOpen(true)}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 4.5h12M3 9h12M3 13.5h8" /></svg>
          <span>Every artifact · {ITEMS.length}</span>
        </button>
      )}
      {open && (
        <div className="ar-root" role="dialog" aria-modal="true" aria-label="Every artifact">
          <div className="ar-scrim" onClick={() => setOpen(false)} />
          <div className="ar-drawer">
            <nav className="ar-list" aria-label="Artifacts">
              <div className="ar-list-head">
                <span className="ar-list-title">Every artifact</span>
              </div>
              <div className="ar-list-scroll">
                {GROUPS.map((g) => (
                  <div key={g.name} className="ar-group">
                    <span className="ar-group-name">{g.name}</span>
                    {g.items.map((it) => (
                      <button key={it.id} type="button" className="ar-row" aria-pressed={it.id === selId} onClick={() => pick(it.id)}>
                        <span className="ar-thumb">
                          {it.img ? (
                            <img src={BASE + it.img + '-thumb.webp'} alt="" loading="lazy" />
                          ) : (
                            <svg width="44" height="34" viewBox="0 0 44 34" aria-hidden><rect x="12" y="4" width="20" height="26" rx="2" fill="#fff" stroke="#d4d4d4" /><path d="M16 10h12M16 14h12M16 18h9M16 22h11" stroke="#bdbdbd" strokeWidth="1.6" strokeLinecap="round" /></svg>
                          )}
                        </span>
                        <span className="ar-row-text">
                          <span className="ar-row-title">{it.title}</span>
                          <span className="ar-row-meta">{it.meta}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </nav>

            <section className="ar-preview">
              <div className="ar-head">
                <div className="ar-head-text">
                  <span className="ar-phase">{sel.phase}</span>
                  <h2>{sel.title}</h2>
                  <span className="ar-meta">{sel.meta}</span>
                </div>
                <button type="button" className="ar-close" aria-label="Close panel" onClick={() => setOpen(false)}>×</button>
              </div>

              <div className="ar-viewer">
                <div className="ar-bar">
                  <span className="ar-file">{sel.title}{isDoc ? '.pdf' : '.png'}</span>
                  <div className="ar-tools">
                    <span className="ar-pages">1 / 1</span>
                    <span className="ar-sep" />
                    <button type="button" aria-label="Zoom out" onClick={() => zoom.zoomAt(1 / 1.5)}>−</button>
                    <span className="ar-pct">{Math.round(zoom.v.z * (isDoc ? zoom.base : 1) * 100)}%</span>
                    <button type="button" aria-label="Zoom in" onClick={() => zoom.zoomAt(1.5)}>+</button>
                    <div className="ar-seg" role="group" aria-label="View size">
                      <button type="button" aria-pressed={isFit} onClick={zoom.fit}>Fit</button>
                      <button type="button" aria-pressed={isFill} onClick={fill}>Fill</button>
                    </div>
                  </div>
                </div>
                <div className="ar-stage" ref={stageRef}>
                  {isDoc ? <DocView item={sel} zoom={zoom} tab={tab} setTab={setTab} /> : <ImageView key={sel.id} item={sel} zoom={zoom} onSize={setNat} />}
                </div>
              </div>

              <div className="ar-foot">
                <div className="ar-takeaway">
                  <span className="ar-takeaway-label">What I took away</span>
                  <p>{sel.takeaway}</p>
                </div>
                {sel.card && (
                  <button type="button" className="ar-cardlink" onClick={() => { setOpen(false); onOpenCard(sel.card) }}>
                    Open the {cardLabels[sel.card] || ''} card →
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
