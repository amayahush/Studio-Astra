import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Wireframes: one scroll, oldest to newest. Each chapter is one version and the one big change it made.
// → jumps to the next chapter; scrolling by hand moves the step marks along with it.
const shots = import.meta.glob('../art/wf/*.webp', { eager: true, import: 'default' })
const img = (name) => shots[`../art/wf/${name}.webp`]

const CHAPTERS = [
  {
    tag: 'Low-fi',
    title: 'The flow came first',
    body: 'Before any detail, I sketched one moment end to end: a developer notices a mismatch, attaches evidence, the PM decides, and the designer hears about it in Figma.',
    shot: 'low-sheet',
    alt: 'Four low-fi sketches of the flow, each with a short caption',
  },
  {
    tag: 'Mid-fi',
    title: 'A PRD with owners and a decision panel',
    body: 'Requirements got numbers, owners and a status, so a change points at something specific. Every proposal carries a reason, evidence and one approver.',
    shot: 'pm-mid2',
    alt: 'Mid-fi PRD tool with the review proposal panel open',
  },
  {
    tag: 'High-fi',
    title: 'Meet people in the tools they already use',
    body: 'The story moved into Codex and Figma, where developers and designers already work. My critique of the coded version shaped what stayed.',
    notes: [
      'let the engineer evaluate this, not the system',
      'make it clear which platform users are in',
      'not annoying to interrupt the designer while they work',
    ],
    shot: 'dev-high',
    alt: 'High-fi Codex view where Relay flags that R4 may not match the API',
  },
  {
    tag: 'Map · first version',
    title: 'Trace what one change touched',
    body: 'The first Map traced a requirement to its Jira ticket, merge request, Figma frame and people. It showed where things linked up, but only as a snapshot.',
    shot: 'map-trace',
    alt: 'First Map view tracing R4 to Jira, GitLab, Figma and people',
  },
  {
    tag: 'Live in Astra',
    title: 'Catch assumptions before anyone builds',
    body: 'Before v1 goes out, Astra lists every requirement nobody has confirmed, and who could confirm it. The PM can still publish, but those stay marked Assumed in every slice.',
    shot: 'live-assume',
    alt: 'Live Astra Doc view with the assumption check panel listing unconfirmed requirements',
    live: true,
  },
  {
    tag: 'Live in Astra',
    title: 'The PRD and the spec stay separate',
    body: 'The spec stays a file in the developer’s repo, broken into tasks by the coding agent. Astra only tags each task with the requirement it came from, so when R4 changes, the tasks it touches are the ones that reopen.',
    shot: 'live-spec',
    alt: 'Live Codex view showing specs/lab-15-refresh.md with tasks grouped under R1 and R4',
    live: true,
  },
  {
    tag: 'Live in Astra',
    title: 'The Map replays the whole record',
    body: 'The Map shows where a requirement came from, the work it drives and the people on it. The tape at the bottom replays the story, so you can see who knew what at any moment.',
    shot: 'live-map',
    alt: 'Live Astra Map view for R4 with sources, linked work, people and a replay timeline',
    live: true,
  },
]

export const WIRE_STEPS = CHAPTERS.length - 1

export const WIRE_CAPTIONS = [
  'Scroll through each version, oldest first. Each one is a single big change.',
  'Mid-fi turned the boxes into a real PRD.',
  'Then I took it to where people actually work.',
  'The first Map traced what one change touched.',
  'From here on, it’s what’s live in Astra now.',
  'The biggest lesson: the PRD and the spec do different jobs.',
  'And the Map became a record you can replay.',
]

export default function WireframesSlide({ step, onStep }) {
  const refs = useRef([])
  const fromScroll = useRef(false)
  const stepRef = useRef(step)
  stepRef.current = step
  const [zoom, setZoom] = useState(null)

  // → / ← (or the stars) scroll to that chapter
  useEffect(() => {
    if (fromScroll.current) { fromScroll.current = false; return }
    const el = refs.current[step]
    const sl = el?.closest('.dk-slide')
    if (!el || !sl) return
    const top = step === 0 ? 0 : el.getBoundingClientRect().top - sl.getBoundingClientRect().top + sl.scrollTop - 24
    sl.scrollTo({ top, behavior: 'smooth' })
  }, [step])

  // scrolling by hand updates the step, without scrolling again
  useEffect(() => {
    const sl = refs.current[0]?.closest('.dk-slide')
    if (!sl || !onStep) return
    let raf = 0
    let settle = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const mid = sl.getBoundingClientRect().top + sl.clientHeight * 0.4
        let at = 0
        refs.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= mid) at = i })
        if (sl.scrollTop + sl.clientHeight >= sl.scrollHeight - 4) at = CHAPTERS.length - 1
        // ignore the in-between positions while a → jump is still scrolling
        clearTimeout(settle)
        settle = setTimeout(() => {
          if (at !== stepRef.current) { fromScroll.current = true; onStep(at) }
        }, 140)
      })
    }
    sl.addEventListener('scroll', onScroll, { passive: true })
    return () => { sl.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); clearTimeout(settle) }
  }, [onStep])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      e.preventDefault()
      setZoom(null)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [zoom])

  return (
    <div className="wr">
      {CHAPTERS.map((c, i) => (
        <article key={c.shot} ref={(el) => { refs.current[i] = el }} className={`wr-ch${i === step ? ' is-here' : ''}${c.live ? ' is-latest' : ''}`}>
          <header className="wr-head">
            <span className="wr-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="wr-tag">{c.tag}</span>
            {c.live && <span className="wr-now">what it does now</span>}
          </header>
          <h3>{c.title}</h3>
          <p className="wr-body">{c.body}</p>
          {c.notes && (
            <div className="wr-notes">
              <small>My notes on the coded version</small>
              <ul>{c.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            </div>
          )}
          <button type="button" className="wr-shot" onClick={() => setZoom(c)} aria-label={`Open ${c.tag} full size`}>
            <img src={img(c.shot)} alt={c.alt} loading="lazy" draggable="false" />
          </button>
        </article>
      ))}

      {zoom && createPortal(
        <div className="mm-lightbox" onClick={() => setZoom(null)}>
          <div className="mm-lightbox-scroll">
            <img src={img(zoom.shot)} alt={zoom.alt} style={{ cursor: 'default' }} />
          </div>
          <div className="mm-lightbox-bar" onClick={(e) => e.stopPropagation()}>
            <span>{zoom.tag} · {zoom.title}</span>
            <button type="button" onClick={() => setZoom(null)}>Close</button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
