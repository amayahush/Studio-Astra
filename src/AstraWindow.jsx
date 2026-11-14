import { useEffect, useRef, useState } from 'react'
import { Star } from './art/Art.jsx'

export const ASTRA_URL = 'https://astra-studioresearch-prototype.vercel.app/'

// Future research directions (picked by me; wording is a draft to keep editing).
const DIRECTIONS = [
  {
    label: 'Agent permissions',
    title: 'What can an agent approve on its own?',
    body: 'Right now every change in Astra waits for the PM. Some updates are small, like a renamed field or a moved date, and probably don\'t need a person. I want to map which changes agents can approve, which they can only suggest, and who is accountable when an agent gets it wrong.',
  },
  {
    label: 'Docs for AI',
    title: 'Writing requirements agents can read',
    body: 'Better documentation leads to better spec-driven development. I want to test how requirements should be structured so AI can spot patterns across them, like recurring gaps or risky changes, while staying easy for people to read.',
  },
  {
    label: 'Conflicting input',
    title: 'When stakeholders disagree',
    body: 'In workshops, customers and teams often bring contradictory mental models, and that is where projects run over. Astra can flag a conflict, but it doesn\'t help anyone work through one. I want to study how teams actually settle these and what the system should show in that moment.',
  },
  {
    label: 'Quick variations',
    title: 'Testing ideas while the team is still talking',
    body: 'The PM I interviewed wanted a fast way to prototype and test with customers before anything gets built. Astra already hears the requirements forming in meetings, so I want to explore how it could spin up quick variations right there, to put in front of users or compare side by side, and tie what we learn back to the requirement.',
  },
]

export default function AstraWindow({ open, onClose }) {
  const [loaded, setLoaded] = useState(false)
  const [full, setFull] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setLoaded(false)
    setFull(false)
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.documentElement.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('no-scroll')
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`astra-view${full ? ' is-full' : ''}`} role="dialog" aria-modal="true" aria-label="Astra prototype">
      <div className="astra-scroll" ref={scrollRef}>
        <div className="mac-window">
          <div className="mac-bar">
            <div className="mac-lights">
              <button className="light red" onClick={onClose} aria-label="Close Astra" title="Close" />
              <button className="light yellow" onClick={onClose} aria-label="Minimize Astra" title="Minimize" />
              <button className="light green" onClick={() => setFull((f) => !f)} aria-label="Toggle full size" title="Full size" />
            </div>
            <div className="mac-title">
              <span className="mac-title-mark" aria-hidden>
                <Star size={14} inset={0.0855} color="#fff" x={2} y={2} />
              </span>
              Astra
            </div>
            <a className="mac-newtab" href={ASTRA_URL} target="_blank" rel="noopener noreferrer">
              Open in new tab ↗
            </a>
          </div>
          <div className="mac-body">
            {!loaded && <div className="mac-loading">Loading Astra…</div>}
            <iframe
              src={ASTRA_URL}
              title="Astra prototype"
              onLoad={() => setLoaded(true)}
              allow="clipboard-read; clipboard-write; fullscreen"
            />
          </div>
        </div>

        <button
          className="whats-next-cue"
          onClick={() => scrollRef.current?.querySelector('.future')?.scrollIntoView({ behavior: 'smooth' })}
        >
          What's next ↓
        </button>

        <section className="future" aria-labelledby="future-title">
          <p className="meta">Future research directions</p>
          <h2 id="future-title" className="future-headline">
            <span className="headline-muted">Astra keeps one living source of truth.</span> Next I want to learn how much
            of the work around it people can safely hand to agents.
          </h2>
          <div className="future-grid">
            {DIRECTIONS.map((d) => (
              <article key={d.label} className="future-card">
                <span className="future-label">{d.label}</span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </article>
            ))}
          </div>
          <button className="future-back" onClick={onClose}>
            ← Back to the process
          </button>
        </section>
      </div>
    </div>
  )
}
