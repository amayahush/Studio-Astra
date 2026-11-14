import { PHASES, FOCUS, LEARNED } from './journeyData.js'

// Journey map: six phases left to right. → reveals the map one band at a time,
// then ends zoomed in on phase 05 (my focus) and what the map taught me.
export const JOURNEY_STEPS = 4

export const JOURNEY_CAPTIONS = [
  'Six phases a requirement moves through, who leads each one, and how it feels. The lowest point comes in phase 05.',
  'What happens in each phase and where it breaks. The codes link each pain point back to my thematic analysis.',
  'In their words, and what already works today.',
  'Where I saw an opening in each phase, and the themes it answers.',
  'My focus: something changes mid-build. This is where my prototype starts.',
]

const BANDS = [
  ['lead', 'goal', 'feel'],
  ['happens', 'pain'],
  ['said', 'works'],
  ['opp', 'themes'],
]
const LABELS = {
  lead: 'Who leads', goal: 'Goal', feel: 'How it feels', happens: 'What happens', pain: 'Pain points',
  said: 'What they said', works: 'What works today', opp: 'Opportunity', themes: 'Themes',
}

function Cell({ row, p }) {
  if (row === 'lead') return <div className="jm-tags">{p.lead.map((l) => <span key={l}>{l}</span>)}</div>
  if (row === 'goal') return <p className="jm-card is-goal">{p.goal}</p>
  if (row === 'happens') return p.happens.map((h) => <p key={h} className="jm-card is-happens">{h}</p>)
  if (row === 'pain') return p.pain.map(([t, c]) => <p key={t} className="jm-card is-pain">{t}<small>{c}</small></p>)
  if (row === 'said') return p.said.map(([q, w]) => <blockquote key={q} className="jm-card is-said">“{q}”<small>{w}</small></blockquote>)
  if (row === 'works') return p.works.map(([t, w]) => <p key={t} className="jm-card is-works">{t}<small>{w}</small></p>)
  if (row === 'opp') return <p className="jm-card is-opp">{p.opp}</p>
  if (row === 'themes') return <div className="jm-tags is-themes">{p.themes.map((t) => <span key={t}>{t}</span>)}</div>
  return null
}

function Emotion() {
  const W = 600
  const H = 120
  const pts = PHASES.map((p, i) => [W * (i + 0.5) / PHASES.length, 18 + p.y * (H - 40)])
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` C ${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }
  return (
    <div className="jm-feel">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="jm-feel-mid" />
        <path d={d} className="jm-feel-line" pathLength="1" />
      </svg>
      {PHASES.map((p, i) => (
        <span key={p.n} className={`jm-feel-dot${i === FOCUS ? ' is-focus' : ''}`} style={{ left: `${(100 * (i + 0.5)) / PHASES.length}%`, top: `${(100 * pts[i][1]) / H}%` }}>
          <i />
          <b>{p.feel}</b>
        </span>
      ))}
    </div>
  )
}

export default function JourneySlide({ step }) {
  const focus = step >= 4
  const f = PHASES[FOCUS]
  return (
    <div className={`jm${focus ? ' is-focus' : ''}`}>
      {!focus && (
        <div className="jm-grid" key={step}>
          <div className="jm-row is-head">
            <span className="jm-label">Phase</span>
            {PHASES.map((p, i) => (
              <div key={p.n} className={`jm-phase${i === FOCUS ? ' is-focus' : ''}`}>
                <small>{p.n}{i === FOCUS && <em className="hand">my focus</em>}</small>
                <b>{p.name}</b>
              </div>
            ))}
          </div>
          {BANDS[step].map((row, r) => (
            <div key={row} className={`jm-row is-${row}`} style={{ '--d': `${r * 160}ms` }}>
              <span className="jm-label">{LABELS[row]}</span>
              {row === 'feel' ? (
                <div className="jm-span"><Emotion /></div>
              ) : (
                PHASES.map((p, i) => (
                  <div key={p.n} className={`jm-cell${i === FOCUS ? ' is-focus' : ''}`} style={{ '--c': `${i * 60}ms` }}>
                    <Cell row={row} p={p} />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {focus && (
        <div className="jm-focus">
          <article className="jm-focus-card">
            <small>Phase {f.n} · my focus</small>
            <h3>{f.name}</h3>
            <div className="jm-tags">{f.lead.map((l) => <span key={l}>{l}</span>)}</div>
            <p className="jm-card is-goal">{f.goal}</p>
            <h4>What happens</h4>
            <ol className="jm-steps">{f.happens.map((h) => <li key={h}>{h}</li>)}</ol>
            <h4>Where it breaks</h4>
            {f.pain.map(([t, c]) => <p key={t} className="jm-card is-pain">{t}<small>{c}</small></p>)}
            <h4>In their words</h4>
            {f.said.map(([q, w]) => <blockquote key={q} className="jm-card is-said">“{q}”<small>{w}</small></blockquote>)}
          </article>
          <aside className="jm-learned">
            <span className="hand">What the journey map taught me</span>
            <ol>{LEARNED.map((t, i) => <li key={i} style={{ '--d': `${300 + i * 220}ms` }}>{t}</li>)}</ol>
            <div className="jm-opp">
              <small>The opening I’m designing for</small>
              <p>{f.opp}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
