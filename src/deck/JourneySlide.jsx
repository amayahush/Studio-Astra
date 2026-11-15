import { useLayoutEffect, useRef, useState } from 'react'
import { PHASES, FOCUS, LEARNED } from './journeyData.js'

// Journey map: one scrollable list of the six phases with a "how it feels" line running down
// the side, then → zooms into phase 05 (my focus) and what the map taught me.
export const JOURNEY_STEPS = 1

export const JOURNEY_CAPTIONS = [
  'Six phases a requirement moves through. Scroll to follow it, and watch how it feels on the left. The lowest point is phase 05.',
  'My focus: something changes mid-build. This is where my prototype starts.',
]

// how it feels, as a sideways line: 0 = confident (left), 1 = frustrated (right)
function FeelSpine({ pts }) {
  if (pts.length < 2) return null
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const my = (y0 + y1) / 2
    d += ` C ${x0} ${my} ${x1} ${my} ${x1} ${y1}`
  }
  const h = pts[pts.length - 1][1] + 40
  return (
    <svg className="jm-spine" width="70" height={h} viewBox={`0 0 70 ${h}`} aria-hidden>
      <path d={d} className="jm-spine-line" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === FOCUS ? 7 : 5} className={i === FOCUS ? 'is-focus' : ''} />)}
    </svg>
  )
}

export default function JourneySlide({ step }) {
  const rows = useRef([])
  const wrap = useRef(null)
  const f = PHASES[FOCUS]
  const [pts, setPts] = useState([])
  useLayoutEffect(() => {
    if (step >= 1 || !wrap.current) return
    const measure = () => {
      setPts(rows.current.map((el, i) => [14 + PHASES[i].y * 40, el ? el.offsetTop + 34 : 0]))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [step])

  if (step >= 1) {
    return (
      <div className="jm is-focus">
        <div className="jm-focus">
          <article className="jm-focus-card">
            <small>Phase {f.n} · my focus</small>
            <h3>{f.name}</h3>
            <p className="jm-goal">{f.goal}</p>
            <h4>What happens</h4>
            <ol className="jm-steps">{f.happens.map((h) => <li key={h}>{h}</li>)}</ol>
            <h4>Where it breaks</h4>
            <ul className="jm-breaks">{f.pain.map(([t]) => <li key={t}>{t}</li>)}</ul>
            <blockquote className="jm-quote">“{f.said[0][0]}”<small>{f.said[0][1]}</small></blockquote>
          </article>
          <aside className="jm-learned">
            <span className="hand">What the journey map taught me</span>
            <ol>{LEARNED.map((t, i) => <li key={i} style={{ '--d': `${300 + i * 220}ms` }}>{t}</li>)}</ol>
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="jm" ref={wrap}>
      <div className="jm-key hand">how it feels</div>
      <FeelSpine pts={pts} />
      <ol className="jm-list">
        {PHASES.map((p, i) => (
          <li key={p.n} ref={(el) => (rows.current[i] = el)} className={`jm-phase${i === FOCUS ? ' is-focus' : ''}`} style={{ '--d': `${i * 90}ms` }}>
            <header>
              <small>{p.n}{i === FOCUS && <em className="hand">my focus</em>}</small>
              <h3>{p.name}</h3>
              <span className="jm-feel">{p.feel}</span>
              <p className="jm-lead">Led by {p.lead.join(', ')}</p>
            </header>
            <div className="jm-body">
              <p className="jm-goal">{p.goal}</p>
              <div className="jm-cols">
                <div>
                  <h4>Where it breaks</h4>
                  <ul className="jm-breaks">{p.pain.slice(0, 2).map(([t]) => <li key={t}>{t}</li>)}</ul>
                </div>
                <blockquote className="jm-quote">“{p.said[0][0]}”<small>{p.said[0][1]}</small></blockquote>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
