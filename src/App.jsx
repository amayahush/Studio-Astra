import {
  InterviewsArt,
  ThematicArt,
  EcosystemArt,
  JourneyArt,
  HmwArt,
  PovArt,
  MindMapArt,
  IdeatingArt,
  Star,
} from './art/Art.jsx'
import Headline from './Headline.jsx'
import AstraWindow, { ASTRA_URL } from './AstraWindow.jsx'
import { useCallback, useEffect, useRef, useState } from 'react'

// Order and copy match the Figma homepage (node 707:3121), left to right, top to bottom.
const CARDS = [
  { id: 'interviews', label: 'Interviews', caption: 'Hearing from Engineers how they utilize (or don’t utilize AI) in their workflow', Art: InterviewsArt },
  { id: 'thematic-analysis', label: 'Thematic Analysis', caption: 'Analyzing the common pain points for Engineers', Art: ThematicArt },
  { id: 'ecosystem-map', label: 'Ecosystem Map', caption: 'Mapping out the Ecosystem to see who touches the requirements', Art: EcosystemArt },
  { id: 'journey-map', label: 'Journey Map', caption: 'Identifying where the workflow falls through', Art: JourneyArt },
  { id: 'how-might-we', label: 'How might we...', caption: null, Art: HmwArt },
  { id: 'pov-user-model', label: 'POV / User Model', caption: 'The Senior Engineer with deep technical and system knowledge', Art: PovArt },
  { id: 'mind-mapping', label: 'Mind Mapping', caption: 'Brainstorming ways to improve requirement clarity', Art: MindMapArt },
  { id: 'ideating', label: 'Ideating & More Ideating', caption: <>The transition from idea<br />to solution</>, Art: IdeatingArt },
]


const FADE_MS = 320

function Card({ id, label, caption, Art }) {
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
  const closeAstra = useCallback(() => setAstraOpen(false), [])
  // Astra is a desktop app: on phones and touch tablets it opens in a new tab instead.
  // This checks the device (screen size, touch), not the window, so a narrow browser
  // window or side panel on a laptop still gets the in-site window.
  const openAstra = (e) => {
    const small = window.screen.width < 900 || window.matchMedia('(hover: none) and (pointer: coarse)').matches
    if (small) return // let the link open normally
    e.preventDefault()
    setAstraOpen(true)
  }
  return (
    <main className="home">
      <header className="intro">
        <Headline />
      </header>

      <section className="grid" aria-label="Research process">
        {CARDS.map((c) => (
          <Card key={c.id} {...c} />
        ))}
      </section>

      <a className="solution" href={ASTRA_URL} target="_blank" rel="noopener noreferrer" onClick={openAstra}>
        <span className="solution-label">The Solution</span>
        <span className="solution-mark" aria-hidden>
          <Star size={30.5} inset={0.0855} color="#fff" x={6.2} y={6.2} />
        </span>
        <span className="solution-name">Astra</span>
      </a>

      <AstraWindow open={astraOpen} onClose={closeAstra} />
    </main>
  )
}
