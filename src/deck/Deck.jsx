import StepMarks from './StepMarks.jsx'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { SLIDES } from './content.js'
import { PRESENT } from '../present.js'
import InterviewsSlide, { INTERVIEW_STEPS, INTERVIEW_CAPTIONS } from './InterviewsSlide.jsx'
import ThematicSlide, { THEMATIC_STEPS, THEMATIC_CAPTIONS } from './ThematicSlide.jsx'
import EcosystemSlide, { ECO_STEPS, ECO_CAPTIONS } from './EcosystemSlide.jsx'
import JourneySlide, { JOURNEY_STEPS, JOURNEY_CAPTIONS } from './JourneySlide.jsx'
import PovSlide, { POV_STEPS, POV_CAPTIONS } from './PovSlide.jsx'
import MindMapSlide, { MIND_STEPS, MIND_CAPTIONS } from './MindMapSlide.jsx'
import WireframesSlide, { WIRE_STEPS, WIRE_CAPTIONS } from './WireframesSlide.jsx'
import CompetitiveSlide, { COMP_STEPS, COMP_CAPTIONS } from './CompetitiveSlide.jsx'
import { JourneyPresent, JOURNEY_PRESENT_CAPTIONS, CompetitivePresent, COMP_PRESENT_CAPTIONS, PovPresent, POV_PRESENT_CAPTIONS } from './PresentSlides.jsx'

// Per-slide setup: how many → steps it has before moving on, and the caption for each.
const SETUP = {
  interviews: { steps: INTERVIEW_STEPS, captions: INTERVIEW_CAPTIONS, Body: InterviewsSlide },
  'thematic-analysis': { steps: THEMATIC_STEPS, captions: THEMATIC_CAPTIONS, Body: ThematicSlide },
  'ecosystem-map': { steps: ECO_STEPS, captions: ECO_CAPTIONS, Body: EcosystemSlide },
  'journey-map': { steps: JOURNEY_STEPS, captions: JOURNEY_CAPTIONS, Body: JourneySlide },
  'pov-user-model-hmw': { steps: POV_STEPS, captions: POV_CAPTIONS, Body: PovSlide },
  'mind-mapping': { steps: MIND_STEPS, captions: MIND_CAPTIONS, Body: MindMapSlide },
  wireframes: { steps: WIRE_STEPS, captions: WIRE_CAPTIONS, Body: WireframesSlide, ownScroll: true },
  'competitive-analysis': { steps: COMP_STEPS, captions: COMP_CAPTIONS, Body: CompetitiveSlide },
}

// Presentation mode swaps these cards for single-view versions with nothing to click through.
const PRESENT_SETUP = {
  'journey-map': { steps: 0, captions: JOURNEY_PRESENT_CAPTIONS, Body: JourneyPresent },
  'competitive-analysis': { steps: 0, captions: COMP_PRESENT_CAPTIONS, Body: CompetitivePresent },
  'pov-user-model-hmw': { steps: 0, captions: POV_PRESENT_CAPTIONS, Body: PovPresent },
}

function PlaceholderBody({ slide }) {
  return (
    <div className="dk-ph-grid">
      <div className="dk-ph">[ {slide.label} artifact ]</div>
      <div className="dk-ph">[ detail ]</div>
      <div className="dk-ph">[ detail ]</div>
    </div>
  )
}

const insetFor = (r) =>
  `inset(${r.top}px ${window.innerWidth - r.right}px ${window.innerHeight - r.bottom}px ${r.left}px round 16px)`

// The deck: each homepage card is one full-screen slide.
// ← → change cards (→ steps through a card's highlights first), ↓ ↑ scroll a long card,
// 1–8 jump, Esc goes home. It opens by growing out of the card that was clicked.
export default function Deck({ start, originRect, getCardRect, onClose, onFinish, startAtEnd, present }) {
  // Presentation mode: skipped cards drop out of the deck and labels use the plain-language names.
  const slides = useMemo(
    () => (present ? SLIDES.filter((s) => !PRESENT[s.id]?.skip).map((s) => ({ ...s, label: PRESENT[s.id]?.label ?? s.label })) : SLIDES),
    [present],
  )
  const setupFor = (id) => (present && PRESENT_SETUP[id]) || SETUP[id]
  // start is the homepage card's position; find that card in this deck (a skipped one falls back).
  const [startIdx] = useState(() => {
    const k = slides.findIndex((s) => s.id === SLIDES[start]?.id)
    return k >= 0 ? k : startAtEnd ? slides.length - 1 : 0
  })
  const [idx, setIdx] = useState(startIdx)
  const [steps, setSteps] = useState(() => slides.map((s, k) => (startAtEnd && k === startIdx ? setupFor(s.id)?.steps ?? 0 : 0)))
  const [ready, setReady] = useState(false)
  const [closing, setClosing] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const rootRef = useRef(null)
  const slideRefs = useRef([])

  const step = steps[idx]
  const setup = setupFor(slides[idx].id)
  const maxStep = setup?.steps ?? 0

  // open: grow out of the clicked card
  useLayoutEffect(() => {
    const el = rootRef.current
    el.style.clipPath = originRect ? insetFor(originRect) : 'inset(0 round 0)'
    el.getBoundingClientRect()
    requestAnimationFrame(() => {
      el.style.clipPath = 'inset(0px 0px 0px 0px round 0px)'
      setReady(true)
    })
  }, [])

  const close = useCallback(() => {
    if (closing) return
    setClosing(true)
    setReady(false)
    const r = getCardRect(slides[idx].id)
    if (r) rootRef.current.style.clipPath = insetFor(r)
    setTimeout(onClose, 600)
  }, [closing, idx, getCardRect, onClose, slides])

  const goTo = useCallback((j) => {
    const n = Math.max(0, Math.min(slides.length - 1, j))
    setIdx(n)
  }, [slides])

  // On a card's last highlight, → first scrolls down through anything still below the fold,
  // and ← scrolls back up, before moving to another card or highlight.
  const scrollSlide = useCallback((dir) => {
    const sl = slideRefs.current[idx]
    if (!sl || setupFor(slides[idx].id)?.ownScroll) return false
    const room = dir > 0 ? sl.scrollHeight - sl.clientHeight - sl.scrollTop : sl.scrollTop
    if (room <= 40) return false
    sl.scrollBy({ top: dir * Math.min(room, sl.clientHeight * 0.8), behavior: 'smooth' })
    return true
  }, [idx])

  const forward = useCallback(() => {
    if (step === maxStep && scrollSlide(1)) return
    if (step < maxStep) setSteps((s) => s.map((v, k) => (k === idx ? v + 1 : v)))
    else if (idx < slides.length - 1) goTo(idx + 1)
    else onFinish?.()
  }, [step, maxStep, idx, goTo, onFinish, scrollSlide])

  const back = useCallback(() => {
    if (step === maxStep && scrollSlide(-1)) return
    if (step > 0) setSteps((s) => s.map((v, k) => (k === idx ? v - 1 : v)))
    else goTo(idx - 1)
  }, [step, maxStep, idx, goTo, scrollSlide])

  const updateMore = useCallback(() => {
    const sl = slideRefs.current[idx]
    if (!sl) return
    setHasMore(sl.scrollHeight - sl.clientHeight - sl.scrollTop > 40)
  }, [idx])

  useEffect(() => {
    updateMore()
    if (typeof window !== 'undefined') {
      try { history.replaceState(null, '', `#${slides[idx].id}`) } catch (e) { /* ignore */ }
    }
  }, [idx, updateMore])

  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') { e.preventDefault(); close() }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); forward() }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); back() }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const sl = slideRefs.current[idx]
        sl?.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * sl.clientHeight * 0.6, behavior: 'smooth' })
      } else if (/^[1-8]$/.test(e.key)) goTo(+e.key - 1)
    }
    document.addEventListener('keydown', onKey)
    document.documentElement.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('no-scroll')
    }
  }, [close, forward, back, goTo, idx])

  const slide = slides[idx]
  const nextLabel = idx < slides.length - 1 ? slides[idx + 1].label : 'Astra'

  return (
    <div ref={rootRef} className={`deck${ready ? ' is-ready' : ''}${hasMore ? ' has-more' : ''}`} role="dialog" aria-modal="true" aria-label={slide.label}>
      <header className="dk-top dk-fade">
        <button type="button" className="dk-home hand" onClick={close}>← Home</button>
        <span className="dk-count">{slide.label}</span>
        {/* small screens: the title doubles as a section picker */}
        <label className="dk-jump">
          <span className="dk-sr">Go to section</span>
          <select value={idx} onChange={(e) => goTo(Number(e.target.value))}>
            {slides.map((s, k) => <option key={s.id} value={k}>{k + 1}. {s.label}</option>)}
          </select>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </label>
        <div className="dk-arrows">
          <button type="button" onClick={back} disabled={idx === 0 && step === 0} aria-label="Back">‹</button>
          <button type="button" onClick={forward} aria-label="Forward">›</button>
        </div>
      </header>
      <nav className="dk-prog dk-fade" aria-label="All cards">
        {slides.map((s, k) => (
          <button key={s.id} type="button" className={`${k <= idx ? 'is-done' : ''}${k === idx ? ' is-here' : ''}`} aria-current={k === idx ? 'step' : undefined}
            onClick={(e) => { e.currentTarget.blur(); goTo(k) }}>
            <span className="dk-prog-name">{s.label}</span>
          </button>
        ))}
      </nav>

      <div className="dk-view">
        <div className="dk-track" style={{ transform: `translateX(${-idx * 100}vw)` }}>
          {slides.map((s, k) => {
            const su = setupFor(s.id)
            const Body = su?.Body
            const st = steps[k]
            const max = su?.steps ?? 0
            return (
              <section
                key={s.id}
                ref={(el) => (slideRefs.current[k] = el)}
                className={`dk-slide${k === idx ? ' is-current' : ''}`}
                onScroll={k === idx ? updateMore : undefined}
                aria-hidden={k !== idx}
              >
                <div className="dk-text">
                  <span className="dk-label hand">{s.label}</span>
                  <h2 className="dk-hook"><span>{s.grey}</span>{s.black}</h2>
                  {s.sub && <p className="dk-sub">{s.sub}</p>}
                  {s.id === 'interviews' && (
                    <p className="dk-context"><span className="dk-tag">8 conversations</span> Aug to Oct 2026<br />5 developers, 2 UX designers and a product manager</p>
                  )}
                  {su && (
                    <div className="dk-caption">
                      <p key={st}>{su.captions[st]}</p>
                      <StepMarks total={max} at={st} onGo={(n) => setSteps((all) => all.map((v, j) => (j === k ? n : v)))} />
                    </div>
                  )}
                  <span className="dk-next hand">
                    {st < max ? '→ next highlight' : k === idx && hasMore && !setup.ownScroll ? '→ more below' : `→ for ${k < slides.length - 1 ? slides[k + 1].label : 'Astra'}`}
                  </span>
                </div>
                <div className="dk-main">{Math.abs(k - idx) > 1 ? null : Body ? <Body step={st} onStep={(n) => setSteps((all) => all.map((v, j) => (j === k ? n : v)))} /> : <PlaceholderBody slide={s} />}</div>
              </section>
            )
          })}
        </div>
      </div>
      <div className="dk-cue hand" aria-hidden>more below ↓</div>
      <span className="sr-only" aria-live="polite">{`Next: ${nextLabel}`}</span>
    </div>
  )
}
