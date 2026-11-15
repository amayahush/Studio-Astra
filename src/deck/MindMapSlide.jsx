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
const BW = 220 // theme box width
const BH = 54
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
  if (t.id === 're') return `M 500 ${GOAL_BOX.y} V ${y + BH / 2}`
  if (x < 500) return `M ${GOAL_BOX.x} 300 H 318 V ${y} H ${x + BW / 2}`
  return `M ${GOAL_BOX.x + GOAL_BOX.w} 300 H 682 V ${y} H ${x - BW / 2}`
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
    <div className={`mm-stage is-step-${step}${open ? ' has-open' : ''}`} ref={box} onClick={() => setOpen(null)}>
      <div className="mm-canvas" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${s})` }}>
        <svg className="mm-svg" viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
          {THEMES.map((t, i) => (
            <path key={t.id} d={stem(t)} className={`mm-stem${focusStep && !t.focus ? ' is-dim' : ''}`} style={{ '--d': `${200 + i * 90}ms` }} />
          ))}
          {CAUSES.map((c, i) => (
            <path key={c.label} d={c.d} className="mm-cause" style={{ '--d': `${300 + i * 380}ms` }} />
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
            style={{ left: t.x - BW / 2, top: t.y - BH / 2, width: BW, height: BH, '--d': `${120 + i * 90}ms` }}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.blur(); setOpen(open === t.id ? null : t.id) }}
            aria-expanded={open === t.id}
          >
            <span className="mm-tag">{t.tag}</span>
            {t.label}
            {focusStep && t.focus && <em className="mm-focus-tag">my focus</em>}
          </button>
        ))}

        {THEMES.filter((t) => t.note).map((t) => (
          <p key={t.id} className={`mm-note${focusStep ? ' is-on' : ''}`} style={{ left: t.x - BW / 2, top: t.y + BH / 2 + 8, width: BW }}>{t.note}</p>
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
  )
}
