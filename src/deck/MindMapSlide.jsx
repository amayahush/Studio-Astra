import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GOAL, THEMES, CAUSES, TAKEN } from './mindmapData.js'
import fullMap from '../art/img/mindmap-full.webp'

// Mind map: my revised map, regrouped. Step 0: the goal and the themes it branches into (click one to
// open its branch). Step 1: the cross-theme causes. Step 2: where I focused and what I carried into Astra.
export const MIND_STEPS = 2

export const MIND_CAPTIONS = [
  'I put the goal in the middle and branched out from the themes I found. Click a theme to open its pain points, workarounds and ideas.',
  'The themes kept feeding each other. Schedule pressure skips discovery, so devs start before design and rework later, and every change scatters across channels until AI has nothing solid to work from.',
  'I focused on requirements changing and the missing source of truth. The ideas on those branches became Astra. Discovery I covered in the full user flow instead of the prototype.',
]

const W = 1000
const H = 600
const MAXW = 230 // theme boxes hug their text up to this width
const GOAL_BOX = { x: 360, y: 262, w: 280, h: 76 }

const KIND = { pain: 'Pain point', work: 'Current workaround', idea: 'Idea', core: 'Core concept' }

function useFit(ref) {
  const [s, setS] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => setS(Math.min(el.clientWidth / W, el.clientHeight / H))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return s
}

// goal → theme connectors, drawn as elbows like the original map
function stem(t) {
  const { x, y } = t
  // lines run to the box center; the box sits on top, so they meet its edge whatever its size
  if (t.id === 're') return `M 500 ${GOAL_BOX.y} V ${y}`
  if (x < 500) return `M ${GOAL_BOX.x} 300 H 318 V ${y} H ${x}`
  return `M ${GOAL_BOX.x + GOAL_BOX.w} 300 H 682 V ${y} H ${x}`
}

// CSS can't shrink a box to its wrapped lines, so set its width to the longest line
function hug(el) {
  if (!el) return
  el.style.width = ''
  const ratio = el.getBoundingClientRect().width / el.offsetWidth || 1
  // widest line of text, skipping the absolutely placed tags
  let line = 0
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (n.parentElement.closest('.mm-tag, .mm-focus-tag')) continue
    const r = document.createRange()
    r.selectNodeContents(n)
    for (const b of r.getClientRects()) line = Math.max(line, b.width)
  }
  line /= ratio
  const cs = getComputedStyle(el)
  const extra = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth)
  el.style.width = `${Math.ceil(line + extra + 1)}px`
}

// a point on one side of a measured theme box, plus that side's outward direction
function anchor(t, size, side, f) {
  const w = size?.w ?? 180
  const h = size?.h ?? 50
  const l = t.x - w / 2
  const tp = t.y - h / 2
  if (side === 'top') return [l + w * f, tp, 0, -1]
  if (side === 'bottom') return [l + w * f, tp + h, 0, 1]
  if (side === 'left') return [l, tp + h * f, -1, 0]
  return [l + w, tp + h * f, 1, 0]
}

function causePath(c, sizes) {
  const A = THEMES.find((t) => t.id === c.from)
  const B = THEMES.find((t) => t.id === c.to)
  const [ax, ay, anx, any] = anchor(A, sizes[A.id], c.a[0], c.a[1])
  const [bx, by, bnx, bny] = anchor(B, sizes[B.id], c.b[0], c.b[1])
  const k = c.k ?? 70
  return `M ${ax} ${ay} C ${ax + anx * k} ${ay + any * k}, ${bx + bnx * k} ${by + bny * k}, ${bx} ${by}`
}

function Branch({ theme, onClose }) {
  const left = theme.x >= 500 // open on the side away from the theme
  return (
    <div className={`mm-branch${left ? ' is-left' : ''}`} role="dialog" aria-label={theme.label} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="mm-branch-x" onClick={onClose} aria-label="Close">×</button>
      <small>{theme.tag}</small>
      <h4>{theme.label}</h4>
      <ul>
        {theme.items.map((it, i) => (
          <li key={i} className={`is-${it.kind}`}>
            <i aria-hidden="true" />
            <div>
              <span className="mm-kind">{KIND[it.kind]}</span>
              <p>{it.text}</p>
              {it.subs && (
                <ul className="mm-subs">
                  {it.subs.map((s) => <li key={s}>{s}</li>)}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function MindMapSlide({ step }) {
  const box = useRef(null)
  const s = useFit(box)
  const [open, setOpen] = useState(null)
  // theme boxes hug their text, so measure them to attach the dashed links to their real edges
  const themeRefs = useRef({})
  const [sizes, setSizes] = useState({})
  useLayoutEffect(() => {
    const measure = () => {
      const m = {}
      box.current?.querySelectorAll('.mm-taken-card').forEach(hug)
      for (const [id, el] of Object.entries(themeRefs.current)) {
        if (!el) continue
        hug(el)
        m[id] = { w: el.offsetWidth, h: el.offsetHeight }
      }
      setSizes(m)
    }
    measure()
    document.fonts?.ready.then(measure)
  }, [])
  const [full, setFull] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  useEffect(() => { setOpen(null) }, [step])

  // Esc closes my overlays before the deck sees it
  useEffect(() => {
    if (!open && !full) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      e.preventDefault()
      if (full) setFull(false)
      else setOpen(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, full])

  const theme = THEMES.find((t) => t.id === open)
  const focusStep = step === 2

  return (
    <>
    <MindPhone step={step} onFull={() => { setFull(true); setZoomed(false) }} />
    <div className={`mm-stage is-step-${step}${open ? ' has-open' : ''}`} ref={box} onClick={() => setOpen(null)}>
      <div className="mm-canvas" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${s})` }}>
        <svg className="mm-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {THEMES.map((t, i) => (
            <path key={t.id} d={stem(t)} className={`mm-stem${focusStep && !t.focus ? ' is-dim' : ''}`} style={{ '--d': `${200 + i * 90}ms` }} />
          ))}
          {CAUSES.map((c, i) => (
            <path key={c.label} d={causePath(c, sizes)} className="mm-cause" style={{ '--d': `${300 + i * 380}ms` }} />
          ))}
        </svg>

        <div className="mm-goal" style={{ left: GOAL_BOX.x, top: 300, width: GOAL_BOX.w }}>
          <small>The goal</small>
          <p>{GOAL}</p>
        </div>

        {THEMES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`mm-theme${open === t.id ? ' is-open' : ''}${focusStep ? (t.focus ? ' is-focus' : ' is-dim') : ''}`}
            ref={(el) => { themeRefs.current[t.id] = el }}
            style={{ left: t.x, top: t.y, maxWidth: MAXW, '--d': `${120 + i * 90}ms` }}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); setOpen(open === t.id ? null : t.id) }}
            aria-expanded={open === t.id}
          >
            <span className="mm-tag">{t.tag}</span>
            <span className="mm-theme-label">{t.label}</span>
            {focusStep && t.focus && <em className="mm-focus-tag">my focus</em>}
          </button>
        ))}

        {THEMES.filter((t) => t.note).map((t) => (
          <p key={t.id} className={`mm-note${focusStep ? ' is-on' : ''}`} style={{ left: t.x - 110, top: t.y + (sizes[t.id]?.h ?? 50) / 2 + 8, width: 220 }}>{t.note}</p>
        ))}

        {CAUSES.map((c, i) => (
          <span key={c.label} className="mm-cause-label" style={{ left: c.lx, top: c.ly, '--d': `${520 + i * 380}ms` }}>{c.label}</span>
        ))}

        <div className="mm-taken">
          <small>What I carried into Astra</small>
          <div className="mm-taken-row">
            {TAKEN.map((t, i) => (
              <div key={t.text} className="mm-taken-card" style={{ '--d': `${700 + i * 160}ms` }}>
                <span>from {t.from}</span>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {theme && <Branch theme={theme} onClose={() => setOpen(null)} />}
      </div>

      <button type="button" className="mm-full-btn" onClick={(e) => { e.stopPropagation(); setFull(true); setZoomed(false) }}>
        See my full map ↗
      </button>

      {full && createPortal(
        <div className="mm-lightbox" onClick={(e) => { e.stopPropagation(); setFull(false) }}>
          <div className={`mm-lightbox-scroll${zoomed ? ' is-zoomed' : ''}`} onClick={(e) => e.stopPropagation()}>
            <img src={fullMap} alt="My revised mind map in Figma, with the goal in the middle, five themes, their pain points, workarounds and ideas, and the cross-theme causes" onClick={() => setZoomed((z) => !z)} />
          </div>
          <div className="mm-lightbox-bar" onClick={(e) => e.stopPropagation()}>
            <span>{zoomed ? 'Scroll to move around. Click the map to fit it.' : 'Click the map to zoom in.'}</span>
            <button type="button" onClick={() => setFull(false)}>Close</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
    </>
  )
}

const KIND_LABEL = { pain: 'Pain point', work: 'Workaround', idea: 'Idea', core: 'Core concept' }
const themeName = (id) => THEMES.find((t) => t.id === id)?.label

// Phones: the goal, then the themes as a list you tap to open. Same three beats as the map.
function MindPhone({ step, onFull }) {
  return (
    <div className={`mm-m is-step-${step}`}>
      {step !== 1 && (
        <div className="mm-m-goal"><small>The goal</small><p>{GOAL}</p></div>
      )}
      {step === 1 ? (
        <ol className="mm-m-causes">
          {CAUSES.map((c) => (
            <li key={c.label}>
              <span className="mm-m-path">{themeName(c.from)} <i>→</i> {themeName(c.to)}</span>
              <span className="mm-m-why">{c.label}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mm-m-themes">
          {THEMES.map((t) => (
            <details key={t.id} className={`mm-m-theme${step === 2 ? (t.focus ? ' is-focus' : ' is-dim') : ''}`}>
              <summary>
                <span className="mm-tag-m">{t.tag}</span>
                <b>{t.label}</b>
                {step === 2 && t.focus && <em>my focus</em>}
              </summary>
              <ul>
                {t.items.map((it) => (
                  <li key={it.text} className={`is-${it.kind}`}>
                    <small>{KIND_LABEL[it.kind]}</small>{it.text}
                    {it.subs && <ul>{it.subs.map((x) => <li key={x}>{x}</li>)}</ul>}
                  </li>
                ))}
              </ul>
              {step === 2 && t.note && <p className="mm-m-note">{t.note}</p>}
            </details>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="mm-m-taken">
          <small>What I carried into Astra</small>
          {TAKEN.map((t) => <div key={t.text}><span>from {t.from}</span><p>{t.text}</p></div>)}
        </div>
      )}
      <button type="button" className="mm-m-full" onClick={onFull}>See my full map ↗</button>
    </div>
  )
}
