import { useState } from 'react'
import faceImg from '../art/img/face@4x.png'
import { PHASES, FOCUS } from './journeyData.js'
import CompetitiveSlide from './CompetitiveSlide.jsx'
import { PEOPLE, POV, HMW } from './PovSlide.jsx'

// Presentation-mode versions of three cards. Each one shows its point in a single view,
// so there is nothing to click through while I'm talking. The full-site versions are untouched.

// ── Where it breaks: the six steps in a row, step 05 highlighted, its detail underneath.
export const JOURNEY_PRESENT_CAPTIONS = ['A requirement moves through six steps. Step 05 is where it feels worst.']

export function JourneyPresent() {
  const f = PHASES[FOCUS]
  return (
    <div className="pm-panel">
      <ol className="pj-strip">
        {PHASES.map((p, i) => (
          <li key={p.n} className={i === FOCUS ? 'is-focus' : undefined} style={{ '--d': `${i * 70}ms` }}>
            <span className="pj-n">{p.n}</span>
            <span className="pj-name">{p.name}</span>
          </li>
        ))}
      </ol>
      <article className="pj-card">
        <header>
          <span className="pj-badge">{f.n}</span>
          <h3>{f.name}</h3>
          <span className="pj-feel">Feels: {f.feel.toLowerCase()}</span>
        </header>
        <p className="pj-lead">Led by {f.lead.map((x, i) => (i === 0 ? x[0].toLowerCase() + x.slice(1) : x)).join(', ')}</p>
        <div className="pj-cols">
          <div>
            <h4>Where it breaks</h4>
            <ul>{f.pain.slice(0, 2).map(([t]) => <li key={t}>{t}</li>)}</ul>
          </div>
          <blockquote>“{f.said[0][0]}”<small>{f.said[0][1]}</small></blockquote>
        </div>
      </article>
    </div>
  )
}

// ── What's already out there: the gap at a glance, then my full comparison below to scroll to.
export const COMP_PRESENT_CAPTIONS = [
  'Most of what my interviewees asked for already exists somewhere. Scroll for the full comparison and sources.',
]

const COVERED = ['Turning meetings into tickets', 'One shared doc the whole team reads', 'Giving coding agents context']

export function CompetitivePresent() {
  return (
    <div className="pc">
      <div className="pm-panel pc-gap">
        {COVERED.map((t, i) => (
          <div key={t} className="pc-row" style={{ '--d': `${i * 90}ms` }}>
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10" fill="#282828" /><path d="M6.5 11.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
            <span>{t}</span>
            <small>already exists</small>
          </div>
        ))}
        <div className="pc-row is-gap" style={{ '--d': '320ms' }}>
          <span className="pc-ring" aria-hidden="true" />
          <span>Keeping everyone in sync when a requirement changes mid-build</span>
          <small>the gap</small>
        </div>
        <p className="pc-tools">Jira + Confluence, Notion AI, Productboard, Kiro / Spec Kit, Augment Intent, Brief, Jama Connect</p>
      </div>
      <div className="pc-full">
        <span className="hand pc-full-label">The full comparison ↓</span>
        <CompetitiveSlide step={2} />
      </div>
    </div>
  )
}

// ── Who I designed for: the problem up top, the three people with the developer forward,
// and the main How Might We questions as the same hover/click chips as the full site.
export const POV_PRESENT_CAPTIONS = ['Each role wants something different. I designed for the engineer. Hover a question to see how Astra answers it.']

export function PovPresent() {
  const [open, setOpen] = useState(null)
  const [pinned, setPinned] = useState(null)
  const main = HMW.filter((h) => h.main)
  return (
    <div className="pm-panel pp">
      <div className="pp-problem">
        <small>The problem</small>
        <p>{POV}</p>
      </div>
      <div className="pp-people">
        {PEOPLE.map((p, i) => (
          <div key={p.role} className={`pp-person${i === 0 ? ' is-main' : ''}`} style={{ '--c': p.color, '--k': p.shade, '--d': `${i * 120}ms` }}>
            <div className="pp-who">
              <span className="pp-face"><span className="pp-blob" /><img src={faceImg} alt="" draggable="false" /></span>
              <b>{p.role}</b>
            </div>
            <div className="pp-sticky">
              <small>wants</small>
              <p>{p.want}</p>
              <small>right now</small>
              <p className="is-now">{p.now}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pp-hmw">
        <small>The questions I designed around</small>
        <div className="pp-chips">
          {main.map((h, i) => (
            <button
              key={h.q}
              type="button"
              className={`pp-chip${open === i ? ' is-open' : ''}`}
              onMouseEnter={() => setOpen(i)}
              onMouseLeave={() => setOpen(pinned)}
              onFocus={() => setOpen(i)}
              onBlur={() => setOpen(pinned)}
              onClick={(e) => { e.currentTarget.blur(); const p = pinned === i ? null : i; setPinned(p); setOpen(p ?? i) }}
              aria-expanded={open === i}
            >
              <span className="pp-q">How might we {h.q}</span>
              <span className="pp-how"><em>Astra</em>{h.how}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
