import { useEffect, useRef, useState } from 'react'
import { Star } from './art/Art.jsx'

export const ASTRA_URL = 'https://astra-studioresearch-prototype.vercel.app/'

// Draft directions pulled from the research gaps in my notes. Rewrite in my own words.
const DIRECTIONS = [
  {
    label: 'Accountability',
    title: 'Who answers for what the AI writes?',
    body: 'Human oversight of AI output came up more than anything else in my interviews, but it is the least developed part of Astra. I want to study how approval and responsibility should work when an agent drafted the requirement.',
  },
  {
    label: 'Restricted tools',
    title: 'Working inside enterprise limits',
    body: 'Many of the engineers I talked to can only use approved AI tools. Next I want to test how Astra holds up when the agents it depends on are locked down or unavailable.',
  },
  {
    label: 'Conflicting input',
    title: 'When stakeholders disagree',
    body: 'Requirements often arrive as contradictory asks from different roles. I want to explore how the system shows a conflict without deciding it for the team.',
  },
  {
    label: 'Discovery',
    title: 'Not skipping the messy part',
    body: 'AI makes it easy to jump straight to ideas. I want to look at whether a tool like Astra helps teams stay in problem discovery long enough, or rushes them past it.',
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
            <span className="headline-muted">Astra answers part of the problem.</span> These are the questions I would
            take on next.
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
