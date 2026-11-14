import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SLIDES } from './content.js'
import InterviewsSlide, { INTERVIEW_STEPS, INTERVIEW_CAPTIONS } from './InterviewsSlide.jsx'

// Per-slide setup: how many → steps it has before moving on, and the caption for each.
const SETUP = {
  interviews: { steps: INTERVIEW_STEPS, captions: INTERVIEW_CAPTIONS, Body: InterviewsSlide },
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
export default function Deck({ start, originRect, getCardRect, onClose, onFinish }) {
  const [idx, setIdx] = useState(start)
  const [steps, setSteps] = useState(() => SLIDES.map(() => 0))
  const [ready, setReady] = useState(false)
  const [closing, setClosing] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const rootRef = useRef(null)
  const slideRefs = useRef([])

  const step = steps[idx]
  const setup = SETUP[SLIDES[idx].id]
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
    const r = getCardRect(idx)
    if (r) rootRef.current.style.clipPath = insetFor(r)
    setTimeout(onClose, 600)
  }, [closing, idx, getCardRect, onClose])

  const goTo = useCallback((j) => {
    const n = Math.max(0, Math.min(SLIDES.length - 1, j))
    setIdx(n)
  }, [])

  const forward = useCallback(() => {
    if (step < maxStep) setSteps((s) => s.map((v, k) => (k === idx ? v + 1 : v)))
    else if (idx < SLIDES.length - 1) goTo(idx + 1)
    else onFinish?.()
  }, [step, maxStep, idx, goTo, onFinish])

  const back = useCallback(() => {
    if (step > 0) setSteps((s) => s.map((v, k) => (k === idx ? v - 1 : v)))
    else goTo(idx - 1)
  }, [step, idx, goTo])

  const updateMore = useCallback(() => {
    const sl = slideRefs.current[idx]
    if (!sl) return
    setHasMore(sl.scrollHeight - sl.clientHeight - sl.scrollTop > 40)
  }, [idx])

  useEffect(() => {
    updateMore()
    if (typeof window !== 'undefined') {
      try { history.replaceState(null, '', `#${SLIDES[idx].id}`) } catch (e) { /* ignore */ }
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

  const slide = SLIDES[idx]
  const nextLabel = idx < SLIDES.length - 1 ? SLIDES[idx + 1].label : 'Astra'

  return (
    <div ref={rootRef} className={`deck${ready ? ' is-ready' : ''}${hasMore ? ' has-more' : ''}`} role="dialog" aria-modal="true" aria-label={slide.label}>
      <header className="dk-top dk-fade">
        <button type="button" className="dk-home hand" onClick={close}>← Home</button>
        <span className="dk-count">{slide.label} · {idx + 1} / {SLIDES.length}</span>
        <div className="dk-arrows">
          <button type="button" onClick={back} disabled={idx === 0 && step === 0} aria-label="Back">‹</button>
          <button type="button" onClick={forward} aria-label="Forward">›</button>
        </div>
      </header>
      <nav className="dk-prog dk-fade" aria-label="All cards">
        {SLIDES.map((s, k) => (
          <button key={s.id} type="button" className={k <= idx ? 'is-done' : ''} title={s.label} aria-label={s.label} onClick={() => goTo(k)} />
        ))}
      </nav>

      <div className="dk-view">
        <div className="dk-track" style={{ transform: `translateX(${-idx * 100}vw)` }}>
          {SLIDES.map((s, k) => {
            const su = SETUP[s.id]
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
                  {s.id === 'interviews' && (
                    <p className="dk-context">8 conversations · Aug to Oct 2026 · 5 developers, 2 UX designers and a designer</p>
                  )}
                  {su && (
                    <div className="dk-caption">
                      <p key={st}>{su.captions[st]}</p>
                      <div className="dk-steps" aria-label={`Step ${st} of ${max}`}>
                        {Array.from({ length: max }, (_, n) => <i key={n} className={n < st ? 'is-done' : ''} />)}
                      </div>
                    </div>
                  )}
                  <span className="dk-next hand">
                    {st < max ? '→ next highlight' : `→ for ${k < SLIDES.length - 1 ? SLIDES[k + 1].label : 'Astra'}`}
                  </span>
                </div>
                <div className="dk-main">{Body ? <Body step={st} /> : <PlaceholderBody slide={s} />}</div>
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
