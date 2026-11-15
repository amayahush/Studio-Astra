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
import AstraWindow, { ASTRA_URL } from './AstraWindow.jsx'
import Deck from './deck/Deck.jsx'
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

function Card({ id, label, caption, Art, onOpen }) {
  // Two layers: the static design (always mounted) and the animated build-in on top.
  // Hover: static fades out, a fresh animated layer plays. Leave: the animation freezes
  // where it is and crossfades back into the static design.
  const [phase, setPhase] = useState('rest') // 'rest' | 'play' | 'leaving'
  const [playKey, setPlayKey] = useState(0)
  const timer = useRef()
  const enter = () => {
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
      className={`card card--${id}`}
      href={`#${id}`}
      aria-label={label}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={(e) => {
        e.preventDefault()
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
      <span className="card-label">{label}</span>
      {caption && <p className="card-caption">{caption}</p>}
    </a>
  )
}

export default function App() {
  const [astraOpen, setAstraOpen] = useState(false)
  const [astraFromDeck, setAstraFromDeck] = useState(false)
  // Deck: which card it opened on, and that card's spot on screen (it grows out of it).
  // A link with a card's #id opens straight into that card.
  const [deck, setDeck] = useState(() => {
    const i = CARDS.findIndex((c) => '#' + c.id === window.location.hash)
    return i >= 0 ? { start: i, rect: null } : null
  })
  const cardRect = useCallback((i) => document.querySelectorAll('.grid .card')[i]?.getBoundingClientRect(), [])
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
  const fitRef = useFitToScreen()
  return (
    <>
    <main className="home" ref={fitRef}>
      <header className="intro">
        <Headline />
      </header>

      <section className="grid" aria-label="Research process">
        {CARDS.map((c, i) => (
          <Card key={c.id} {...c} onOpen={(rect) => setDeck({ start: i, rect })} />
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
        onFinish={() => { closeDeck(); setAstraFromDeck(true); setAstraOpen(true) }}
      />
    )}
    <AstraWindow open={astraOpen} onClose={closeAstra} onBack={astraFromDeck ? backToDeck : undefined} />
    </>
  )
}
