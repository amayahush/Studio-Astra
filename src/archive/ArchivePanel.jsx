import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DOCS, GROUPS } from './archiveData'
import { EXPLORE } from './exploreData'
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

// If one artifact fails to render, show a note in the viewer instead of blanking the whole page.
class ViewerBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false }) }
  render() {
    if (this.state.failed) return <div className="ar-failed">This artifact couldn’t load here. Try another one, or reopen the panel.</div>
    return this.props.children
  }
}

const NOTE_LABEL = { why: 'why I did this', changed: 'what changed', finding: 'what I found' }
const NOTE_COLOR = { why: '#fff0a8', changed: '#d5c0ff', finding: '#ffa3df' }

function ImageView({ item, zoom, onSize }) {
  const ref = useRef(null)
  const drag = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [box, setBox] = useState({ W: 0, H: 0 })
  const [nat, setNatLocal] = useState(null)
  const ex = item.explore ? EXPLORE[item.explore] : null
  const [filter, setFilter] = useState('all')
  const [hover, setHover] = useState(null)
  const [picked, setPicked] = useState(null)
  const [noteIdx, setNoteIdx] = useState(-1)
  const { v, setV, zoomAt } = zoom

  // measure the viewing area so the sheet (and its hotspots) can be sized exactly
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const m = () => setBox({ W: el.clientWidth, H: el.clientHeight })
    m()
    const ro = new ResizeObserver(m)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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

  // sheet = the image fitted with even gray around it, plus an 18px white border
  const PAD = 0
  let cw = 0, ch = 0
  if (nat && box.W) {
    const cs = Math.min((box.W - 64 - 2 * PAD) / nat.w, (box.H - 64 - 2 * PAD) / nat.h)
    cw = nat.w * cs
    ch = nat.h * cs
  }
  const sw = cw + 2 * PAD, sh = ch + 2 * PAD

  // zoom so a region (in % of the image) fills most of the view
  const zoomToRect = (r) => {
    if (!cw) return
    const rw = (r.w / 100) * cw, rh = (r.h / 100) * ch
    const cx = PAD + ((r.x + r.w / 2) / 100) * cw - sw / 2
    const cy = PAD + ((r.y + r.h / 2) / 100) * ch - sh / 2
    const z = Math.max(1, Math.min(4.5, (box.W * 0.72) / rw, (box.H * 0.62) / rh))
    setV({ z, x: -cx * z, y: -cy * z })
  }

  const regions = ex ? ex.regions : []
  const byId = (id) => regions.find((r) => r.id === id)
  const notes = ex ? ex.notes : []
  const noteRect = (n) => (n.at.startsWith('zone:') ? ex.zones[n.at.slice(5)] : byId(n.at))
  const f = ex && filter !== 'all' ? ex.filters.find((x) => x.id === filter) : null
  const zone = f && ex.zones && ex.zones[filter]
  const matches = f ? regions.filter((r) => r.tags.includes(filter)) : []
  const active = noteIdx >= 0 ? notes[noteIdx] : null

  const chooseFilter = (id) => {
    setFilter(id)
    setPicked(null)
    setNoteIdx(-1)
    const fz = ex.zones && ex.zones[id]
    if (fz) zoomToRect(fz)
    else zoom.fit()
  }
  const openNote = (i) => {
    const n = notes[i]
    setNoteIdx(i)
    setPicked(null)
    const r = noteRect(n)
    if (r) zoomToRect(r.zoomTo || r)
  }
  const pickRegion = (r) => {
    setPicked(r.id)
    setNoteIdx(-1)
    zoomToRect(r.zoomTo || r)
  }

  const down = (e) => {
    if (e.target.closest('button, .ar-note, .ar-reader')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, x: v.x, y: v.y, moved: false }
    setDragging(true)
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    if (Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py) > 4) d.moved = true
    setV((s) => ({ ...s, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py }))
  }
  const up = (e) => {
    const d = drag.current
    drag.current = null
    setDragging(false)
    // a click that didn't drag zooms in on that spot
    if (d && !d.moved && e.type === 'pointerup') {
      const b = ref.current.getBoundingClientRect()
      zoomAt(2, e.clientX - b.left - b.width / 2, e.clientY - b.top - b.height / 2)
    }
  }

  const shown = byId(hover) || byId(picked)
  const inv = 1 / v.z
  const rectStyle = (r) => ({ left: r.x + '%', top: r.y + '%', width: r.w + '%', height: r.h + '%' })

  return (
    <div className="ar-imgwrap">
      {ex && (
        <div className="ar-explore">
          <span className="ar-explore-label">explore</span>
          <div className="ar-chips" role="group" aria-label="Filter the map">
            {ex.filters.map((x) => (
              <button key={x.id} type="button" className={`ar-chip${x.dashed ? ' is-dashed' : ''}`} aria-pressed={filter === x.id} onClick={() => chooseFilter(x.id)}>
                {x.color && <span className="ar-chip-dot" style={{ background: x.color }} />}
                {x.label}
              </button>
            ))}
          </div>
          {notes.length > 0 && (
            <button type="button" className="ar-notes-btn" aria-pressed={noteIdx >= 0} onClick={() => (noteIdx >= 0 ? setNoteIdx(-1) : openNote(0))}>
              My notes · {notes.length}
            </button>
          )}
        </div>
      )}
      <div
        ref={ref}
        className={`ar-view${dragging ? ' is-dragging' : ''}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div
          className={`ar-sheet${item.dark ? ' is-dark' : ''}`}
          style={{ width: sw || undefined, height: sh || undefined, transform: `translate(${v.x}px, ${v.y}px) scale(${v.z})`, transition: dragging ? 'none' : undefined, '--inv': inv }}
        >
          <img
            src={BASE + item.img + '.webp'}
            alt={item.title}
            draggable="false"
            onLoad={(e) => { const n = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight }; setNatLocal(n); onSize(n) }}
          />
          {ex && cw > 0 && (
            <div className="ar-layer">
              {f && (
                <svg className="ar-dim" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  <defs>
                    <mask id={`m-${item.id}`}>
                      <rect x="-5" y="-5" width="110" height="110" fill="#fff" />
                      {(zone ? [zone] : matches).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill="#000" />)}
                    </mask>
                  </defs>
                  <rect x="-5" y="-5" width="110" height="110" fill="rgba(18,18,18,0.62)" mask={`url(#m-${item.id})`} />
                </svg>
              )}
              {regions.map((r) => {
                const on = f && !zone && r.tags.includes(filter)
                return (
                  <button
                    key={r.id}
                    type="button"
                    tabIndex={-1}
                    className={`ar-hot${on ? ' is-on' : ''}${(hover || picked) === r.id ? ' is-hover' : ''}`}
                    style={{ ...rectStyle(r), '--c': (f && f.color) || '#c439ff' }}
                    aria-label={r.title}
                    onPointerEnter={() => setHover(r.id)}
                    onPointerLeave={() => setHover((h) => (h === r.id ? null : h))}
                    onClick={() => pickRegion(r)}
                  />
                )
              })}
              {notes.map((n, i) => {
                const r = noteRect(n)
                if (!r) return null
                return (
                  <button
                    key={i}
                    type="button"
                    className={`ar-pin${noteIdx === i ? ' is-active' : ''}`}
                    style={{ left: Math.min(98, r.x + r.w) + '%', top: r.y + '%', background: NOTE_COLOR[n.kind] }}
                    aria-label={`My note: ${n.title}`}
                    onClick={() => openNote(i)}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {shown && !active && (
          <div className="ar-reader" aria-live="polite">
            <span className="ar-reader-kicker">{shown.kicker}</span>
            <strong>{shown.title}</strong>
            {shown.body && <p>{shown.body}</p>}
            {!picked && <span className="ar-reader-hint">Click to zoom in</span>}
          </div>
        )}

        {active && (
          <div className="ar-note" style={{ '--n': NOTE_COLOR[active.kind] }}>
            <div className="ar-note-top">
              <span className="ar-note-kind">{NOTE_LABEL[active.kind]}</span>
              <button type="button" aria-label="Close note" onClick={() => setNoteIdx(-1)}>×</button>
            </div>
            <strong>{active.title}</strong>
            <p>{active.text}</p>
            {notes.length > 1 && (
              <div className="ar-note-nav">
                <button type="button" aria-label="Previous note" disabled={noteIdx === 0} onClick={() => openNote(noteIdx - 1)}>‹</button>
                <span>{noteIdx + 1} of {notes.length}</span>
                <button type="button" aria-label="Next note" disabled={noteIdx === notes.length - 1} onClick={() => openNote(noteIdx + 1)}>›</button>
              </div>
            )}
          </div>
        )}

        {!shown && !active && (
          <span className="ar-hint">{ex ? 'Hover to read · click to zoom · drag to move' : 'Click to zoom · scroll to zoom · drag to move'}</span>
        )}
      </div>
    </div>
  )
}

function DocView({ item, zoom, tab, setTab }) {
  const d = DOCS[item.id]
  const boxRef = useRef(null)
  const pageRef = useRef(null)
  const eff = zoom.base * zoom.v.z
  const { setBase } = zoom
  // Fit to page = the whole sheet in view with even gray space around it.
  // Measure the page at its natural size (zoom 1) so the result never feeds back into itself.
  useLayoutEffect(() => {
    const box = boxRef.current
    const page = pageRef.current
    if (!box || !page) return
    const measure = () => {
      const prev = page.style.zoom
      page.style.zoom = '1'
      const h = page.offsetHeight
      page.style.zoom = prev
      const pad = 2 * 28
      const fw = (box.clientWidth - pad) / 612
      // small screens: fit the width and scroll down the page; otherwise the whole sheet
      const f = box.clientWidth < 640 ? fw : Math.min(fw, (box.clientHeight - pad) / h)
      if (Number.isFinite(f) && f > 0) setBase(Math.max(0.15, Math.round(f * 1000) / 1000))
    }
    measure()
    const ro = new ResizeObserver(() => measure())
    ro.observe(box)
    return () => ro.disconnect()
  }, [item.id, tab, setBase])
  // click a section: zoom the page up and bring that section to the middle, dim the rest
  const [activeSec, setActiveSec] = useState(-1)
  useEffect(() => setActiveSec(-1), [item.id, tab])
  useEffect(() => { if (zoom.v.z === 1) setActiveSec(-1) }, [zoom.v.z])
  useEffect(() => {
    if (activeSec < 0) return
    const id = requestAnimationFrame(() => {
      const box = boxRef.current
      const sec = box && box.querySelector(`[data-sec="${activeSec}"]`)
      if (!sec) return
      const br = box.getBoundingClientRect(), sr = sec.getBoundingClientRect()
      box.scrollTo({ top: box.scrollTop + sr.top - br.top - Math.max(24, (br.height - sr.height) / 2), behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [activeSec, eff])
  const focusSection = (k, e) => {
    if (e.target.closest('a, summary, button')) return
    if (activeSec === k) { setActiveSec(-1); zoom.fit(); return }
    const box = boxRef.current
    const fillEff = box ? (box.clientWidth - 56) / 612 : 1
    zoom.setV({ z: Math.max(zoom.v.z, fillEff / zoom.base), x: 0, y: 0 })
    setActiveSec(k)
  }
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
  const renderBlock = (b, i) => {
          if (b.h) return <h4 key={i}>{b.h}</h4>
          if (b.p) return <p key={i}>{b.p}</p>
          if (b.s) return <div key={i} className="ar-callout"><span>{b.label}</span><p>{b.s}</p></div>
          if (b.r) return <p key={i} className="ar-pov">{b.r.map(([text, c], j) => <span key={j} className={c ? `pov-${c}` : undefined}>{text}</span>)}</p>
          if (b.more) return (
            <details key={i} className="ar-more">
              <summary>
                <span className="ar-chev" aria-hidden>›</span>
                <span className="ar-text">{b.i}</span>
              </summary>
              <ul>{b.more.map((m, j) => <li key={j}>{m}</li>)}</ul>
              {b.url && <a className="ar-link ar-src" href={b.url} target="_blank" rel="noopener noreferrer">Read the source ↗</a>}
            </details>
          )
          return (
            <div key={i} className={`ar-item c-${b.c || 'none'}`}>
              <span className="ar-dot" />
              {b.url ? <a className="ar-text ar-link" href={b.url} target="_blank" rel="noopener noreferrer">{b.i} ↗</a> : <span className="ar-text">{b.i}</span>}
              {b.badge && <span className="ar-badge">{b.badge}</span>}
            </div>
          )
  }
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
        {(() => {
          // group: anything before the first heading is intro; each heading starts a clickable section
          const groups = []
          blocks.forEach((b, i) => {
            if (b.h || !groups.length) groups.push({ h: !!b.h, items: [] })
            groups[groups.length - 1].items.push([b, i])
          })
          let k = -1
          return groups.map((g, gi) => {
            if (!g.h) return <div key={gi} className="ar-intro">{g.items.map(([b, i]) => renderBlock(b, i))}</div>
            k += 1
            const kk = k
            return (
              <section
                key={gi}
                data-sec={kk}
                className={`ar-sec${activeSec === kk ? ' is-active' : ''}${activeSec >= 0 && activeSec !== kk ? ' is-dim' : ''}`}
                onClick={(e) => focusSection(kk, e)}
              >
                {g.items.map(([b, i]) => renderBlock(b, i))}
              </section>
            )
          })
        })()}
      </article>
    </div>
  )
}

export default function ArchivePanel({ onOpenCard, cardLabels = {}, startOpen = false }) {
  const [open, setOpen] = useState(startOpen)
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
    const W = el.clientWidth
    if (sel.kind === 'doc') return ((W - 56) / 612) / zoom.base
    const img = el.querySelector('.ar-sheet')
    const view = el.querySelector('.ar-view')
    if (!nat || !img || !view) return 1
    // offsetWidth/Height: the fitted sheet (padding included), ignoring the current zoom transform
    return Math.max(view.clientWidth / img.offsetWidth, view.clientHeight / img.offsetHeight)
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
                        {it.explore && <span className="ar-row-tag">explore</span>}
                        <span hidden>
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
                  <ViewerBoundary resetKey={sel.id}>{isDoc ? <DocView item={sel} zoom={zoom} tab={tab} setTab={setTab} /> : <ImageView key={sel.id} item={sel} zoom={zoom} onSize={setNat} />}</ViewerBoundary>
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
