import { useState } from 'react'
import faceImg from '../art/img/face@4x.png'
import { PEOPLE, HEARD } from './content.js'

// Interviews: the seven hand-drawn faces from the homepage card, grown into the artifact.
// Step 0 lands on the group, then → walks through three moments:
// 1 who they are, 2 where they agreed, 3 where they split on AI.
export const INTERVIEW_STEPS = 3

export const INTERVIEW_CAPTIONS = [
  'Eight people who touch requirements from different sides. Click anyone to hear from them.',
  'Developers, designers and a PM.',
  'Every developer, and one designer, made a point of checking AI’s work before trusting it.',
  'Same kind of work, very different relationships with AI.',
]

const GRID = { P1: [20, 36], P2: [40, 36], P3: [60, 36], P4: [80, 36], P5: [30, 68], P6: [50, 68], P7: [70, 68] }
const GROUPED = { P1: [12, 40], P2: [24, 40], P4: [36, 40], P6: [48, 40], P3: [70, 40], P7: [82, 40], P5: [50, 76] }
const GROUP_LABELS = [
  { text: 'Developers', x: 30, y: 18 },
  { text: 'Designers', x: 76, y: 18 },
  { text: 'PM', x: 50, y: 56 },
]
// spread along the AI line, alternating above and below so nobody overlaps
const SPLIT = (() => {
  const sorted = [...PEOPLE].sort((a, b) => a.ai - b.ai)
  const out = {}
  sorted.forEach((p, i) => { out[p.id] = [8 + p.ai * 84, i % 2 ? 72 : 40] })
  return out
})()

function positionFor(id, step) {
  if (step === 0) return GRID[id]
  if (step === 3) return SPLIT[id]
  return GROUPED[id]
}

export default function InterviewsSlide({ step }) {
  const [open, setOpen] = useState(null)
  const person = PEOPLE.find((p) => p.id === open)
  return (
    <div className="iv">
      <div className={`iv-stage is-step-${step}`} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null) }}>
        {GROUP_LABELS.map((g) => (
          <span key={g.text} className="iv-group hand" style={{ left: `${g.x}%`, top: `${g.y}%` }}>
            {g.text}
          </span>
        ))}
        <div className="iv-line" aria-hidden>
          <span className="hand">keeps AI at arm’s length</span>
          <span className="hand">AI is my first stop</span>
        </div>

        {PEOPLE.map((p) => {
          const [x, y] = positionFor(p.id, step)
          const agreed = step === 2 && p.reviews
          const dimmed = step === 2 && !p.reviews
          return (
            <button
              key={p.id}
              type="button"
              className={`iv-person${agreed ? ' is-agreed' : ''}${dimmed ? ' is-dimmed' : ''}${open === p.id ? ' is-open' : ''}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setOpen(open === p.id ? null : p.id)}
              aria-label={`${p.id}, ${p.title}`}
            >
              <span className="iv-face">
                <span className="iv-blob" />
                <img src={faceImg} alt="" draggable="false" />
              </span>
              <span className="iv-tag"><b>{p.id}</b><span className="iv-role"> · {p.role}</span></span>
            </button>
          )
        })}

        {person && (() => {
          const [px, py] = positionFor(person.id, step)
          const below = py < 55
          const align = px < 28 ? 'start' : px > 72 ? 'end' : 'mid'
          const style = below
            ? { left: `${px}%`, top: `calc(${py}% + 64px)` }
            : { left: `${px}%`, bottom: `calc(${100 - py}% + 50px)` }
          return (
            <aside key={person.id} className={`iv-tip is-${below ? 'below' : 'above'} is-${align}`} style={style} aria-live="polite">
              <button type="button" className="iv-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
              <p className="iv-tip-head"><b className="hand">{person.id}</b> {person.title}</p>
              <p className="iv-tip-ctx">{person.context}</p>
              {person.uses && (<>
                <h4>How they use AI</h4>
                <p>{person.uses}</p>
              </>)}
              <h4>What they wish for</h4>
              <p>{person.wish}</p>
            </aside>
          )
        })()}
      </div>

      <section className="iv-more">
        <h3 className="hand">What I heard</h3>
        <ul className="iv-heard">
          {HEARD.map((h) => (
            <li key={h.text} className={h.seed ? 'is-seed' : ''}>
              <span className="iv-heard-text">{h.text}</span>
              <span className="iv-who">
                {h.who.map((w) => <span key={w} className="iv-dot">{w}</span>)}
              </span>
              {h.seed && <span className="iv-seed hand">↳ the seed of Astra</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="iv-more">
        <h3 className="hand">How I ran them</h3>
        <ol className="iv-method">
          <li><b>Recruit</b><span>Cold outreach, a few dead ends and pivots, all kept in my research log.</span></li>
          <li><b>Ask for a story</b><span>“Tell me about the last thing you took from an idea to something built.”</span></li>
          <li><b>Record</b><span>Recorded and transcribed every conversation, Aug 25 to Oct 3, 2026.</span></li>
          <li><b>Clean up</b><span>Anonymized every transcript before tagging it for the thematic analysis.</span></li>
        </ol>
      </section>

      <section className="iv-more iv-stuck">
        <h3 className="hand">A line that stuck with me</h3>
        <blockquote>“Since we work off of such loose requirements, it’s hard for us to prompt an AI tool to say, this is exactly what I need, because oftentimes we don’t even know ourselves.”</blockquote>
        <cite>P1, full-stack developer</cite>
      </section>
    </div>
  )
}
