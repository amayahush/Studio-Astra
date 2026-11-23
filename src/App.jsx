import {
  InterviewsArt,
  ThematicArt,
  EcosystemArt,
  JourneyArt,
  CompetitiveArt,
  PovHmwArt,
  MindMapArt,
  WireframesArt,
  Star,
} from './art/Art.jsx'
import Headline from './Headline.jsx'
import useFitToScreen from './useFitToScreen.js'
import ArchivePanel from './archive/ArchivePanel'
import AstraWindow, { ASTRA_URL } from './AstraWindow.jsx'
import Deck from './deck/Deck.jsx'
import { PRESENT, METHOD } from './present.js'
import { useCallback, useEffect, useRef, useState } from 'react'

// Order and copy match the Figma homepage (node 707:3121), left to right, top to bottom.
const CARDS = [
  { id: 'interviews', label: 'Interviews', caption: 'Hearing from Engineers how they utilize (or don’t utilize AI) in their workflow', Art: InterviewsArt },
  { id: 'thematic-analysis', label: 'Thematic Analysis', caption: 'Analyzing the common pain points for Engineers', Art: ThematicArt },
  { id: 'ecosystem-map', label: 'Ecosystem Map', caption: 'Mapping out the Ecosystem to see who touches the requirements', Art: EcosystemArt },
  { id: 'journey-map', label: 'Journey Map', caption: 'Identifying where the workflow falls through', Art: JourneyArt },
  { id: 'competitive-analysis', label: 'Competitive Analysis', caption: 'Finding the gap today’s AI coding tools leave open', Art: CompetitiveArt },
  { id: 'pov-user-model-hmw', label: 'POV / User Model / HMW', caption: 'The Senior Engineer with deep technical and system knowledge', Art: PovHmwArt },
  { id: 'mind-mapping', label: 'Mind Mapping', caption: 'Brainstorming ways to improve requirement clarity', Art: MindMapArt },
  { id: 'wireframes', label: 'Wireframes', caption: 'Turning user flows into screens, one version at a time', Art: WireframesArt },
]


const FADE_MS = 320

function Card({ id, label, caption, Art, onOpen, present }) {
  const pm = present ? PRESENT[id] : null
  const skipped = !!pm?.skip
  const shownLabel = pm ? pm.label : label
  const shownCaption = pm ? pm.caption : caption
  // Two layers: the static design (always mounted) and the animated build-in on top.
  // Hover: static fades out, a fresh animated layer plays. Leave: the animation freezes
  // where it is and crossfades back into the static design.
  const [phase, setPhase] = useState('rest') // 'rest' | 'play' | 'leaving'
  const [playKey, setPlayKey] = useState(0)
  const timer = useRef()
  const enter = () => {
    if (skipped) return
    clearTimeout(timer.current)
    setPlayKey((n) => n + 1)
    setPhase('play')
  }
  const leave = () => {
    setPhase((p) => (p === 'play' ? 'leaving' : p))
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPhase('rest'), FADE_MS)
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    if (phase !== 'play') return
    window.addEventListener('blur', leave)
    document.addEventListener('mouseleave', leave)
    return () => {
      window.removeEventListener('blur', leave)
      document.removeEventListener('mouseleave', leave)
    }
  }, [phase])
  return (
    <a
      className={`card card--${id}${skipped ? ' is-skipped' : ''}${pm ? ' is-presenting' : ''}`}
      href={`#${id}`}
      aria-label={skipped ? `${shownLabel} (skipped in this talk)` : shownLabel}
      aria-disabled={skipped || undefined}
      tabIndex={skipped ? -1 : undefined}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={(e) => {
        e.preventDefault()
        if (skipped) return
        onOpen?.(e.currentTarget.getBoundingClientRect())
      }}
    >
      <div className={`card-stage rest-layer${phase === 'play' ? ' is-hidden' : ''}`} aria-hidden>
        <Art />
      </div>
      {phase !== 'rest' && (
        <div key={playKey} className={`card-stage play${phase === 'leaving' ? ' leaving' : ''}`} aria-hidden>
          <Art />
        </div>
      )}
      <span className="card-label">{shownLabel}</span>
      {pm && <span className="card-method">{METHOD[id]}</span>}
      {pm && !skipped && <span className="card-num" aria-hidden>{pm.num}</span>}
      {skipped && <span className="card-skip" aria-hidden>Skipping</span>}
      {shownCaption && <p className="card-caption">{shownCaption}</p>}
    </a>
  )
}

const CARD_LABELS = Object.fromEntries(CARDS.map((c) => [c.id, c.label]))

export default function App() {
  // Presentation mode is on by default; switching it off brings back the full site as it was.
  const [present, setPresent] = useState(true)
  const [astraOpen, setAstraOpen] = useState(false)
  const [astraFromDeck, setAstraFromDeck] = useState(false)
  // Deck: which card it opened on, and that card's spot on screen (it grows out of it).
  // A link with a card's #id opens straight into that card.
  const [deck, setDeck] = useState(() => {
    const i = CARDS.findIndex((c) => '#' + c.id === window.location.hash)
    return i >= 0 ? { start: i, rect: null } : null
  })
  const cardRect = useCallback((id) => document.querySelectorAll('.grid .card')[CARDS.findIndex((c) => c.id === id)]?.getBoundingClientRect(), [])
  const closeDeck = useCallback(() => {
    setDeck(null)
    try { history.replaceState(null, '', window.location.pathname + window.location.search) } catch (e) { /* ignore */ }
  }, [])
  const closeAstra = useCallback(() => { setAstraOpen(false); setAstraFromDeck(false) }, [])
  // ← from Astra goes back into the deck, on the last card's last highlight
  const backToDeck = useCallback(() => {
    setAstraOpen(false)
    setAstraFromDeck(false)
    setDeck({ start: CARDS.length - 1, rect: null, atEnd: true })
  }, [])
  // Astra is a desktop app: on phones and touch tablets it opens in a new tab instead.
  // On desktop the Solution is a plain button (not a link), so no host page or browser
  // can intercept the click and send it to a new tab.
  const [isTouch] = useState(
    () => window.screen.width < 900 || window.matchMedia('(hover: none) and (pointer: coarse)').matches,
  )
  const fitRef = useFitToScreen([present])
  return (
    <>
    <main className="home" ref={fitRef}>
      <button
        type="button"
        className={`present-toggle${present ? ' is-on' : ''}`}
        aria-pressed={present}
        onClick={() => setPresent((p) => !p)}
      >
        <span className="present-track" aria-hidden><span className="present-knob" /></span>
        <span>Presentation mode</span>
      </button>
      <header className="intro">
        <Headline />
      </header>

      <section className="grid" aria-label="Research process">
        {CARDS.map((c, i) => (
          <Card key={c.id} {...c} present={present} onOpen={(rect) => setDeck({ start: i, rect })} />
        ))}
      </section>

      {isTouch ? (
        <a className="solution" href={ASTRA_URL} target="_blank" rel="noopener noreferrer">
        <span className="solution-label">The Solution</span>
        <span className="solution-mark" aria-hidden>
          <Star size={30.5} inset={0.0855} color="#fff" x={6.2} y={6.2} />
        </span>
        <span className="solution-name">Astra</span>
      </a>
      ) : (
        <button type="button" className="solution" onClick={() => { setAstraFromDeck(false); setAstraOpen(true) }}>
        <span className="solution-label">The Solution</span>
        <span className="solution-mark" aria-hidden>
          <Star size={30.5} inset={0.0855} color="#fff" x={6.2} y={6.2} />
        </span>
        <span className="solution-name">Astra</span>
      </button>
      )}

    </main>
    {deck && (
      <Deck
        start={deck.start}
        originRect={deck.rect}
        getCardRect={cardRect}
        onClose={closeDeck}
        startAtEnd={deck.atEnd}
        present={present}
        onFinish={() => { closeDeck(); setAstraFromDeck(true); setAstraOpen(true) }}
      />
    )}
    {!present && !deck && !astraOpen && (
      <ArchivePanel
        cardLabels={CARD_LABELS}
        onOpenCard={(id) => { const i = CARDS.findIndex((c) => c.id === id); if (i >= 0) setDeck({ start: i, rect: null }) }}
      />
    )}
    <AstraWindow open={astraOpen} onClose={closeAstra} onBack={astraFromDeck ? backToDeck : undefined} />
    </>
  )
}
