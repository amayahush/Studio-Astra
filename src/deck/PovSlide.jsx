import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import DevFigure from './DevFigure.jsx'

// POV / User model / HMW, told around the pencil developer from the homepage card.
// Step 0: what they want and what's in the way (sketch notes). Step 1: the problem (POV) as a
// thought bubble. Step 2: the bubble opens into How Might We chips; click one to see how Astra answers.
export const POV_STEPS = 2

export const POV_CAPTIONS = [
  'I started from the people. The senior developer wants one place to see and change requirements, and right now gets late reworks and scattered docs.',
  'That became my problem statement.',
  'Which opened six How Might We questions. Astra answers all of them, some directly and some secondarily. Click one to see how.',
]

const W = 1000
const H = 600

const POV = 'Senior developers need to know what changed in a requirement and why, because decisions get lost once building starts.'

const HMW = [
  { q: 'arrive at “complete enough” requirements without slowing iteration?', how: 'A living PRD: complete enough to start, still free to change.', main: true, x: 450, y: 30 },
  { q: 'keep everyone aligned when requirements change?', how: 'A change shows as pending in every role’s view until the PM approves it.', main: true, x: 730, y: 30 },
  { q: 'make requirements reusable context for AI agents?', how: 'The approved PRD becomes defined context for the agents.', main: true, x: 450, y: 225 },
  { q: 'show non-technical stakeholders feasibility early?', how: 'Every item shows in its native view (Jira, Figma, Codex), so feasibility is visible.', main: false, x: 730, y: 225 },
  { q: 'make early decisions reflect design and engineering?', how: 'Everyone stays updated and gets a say before a change is final.', main: false, x: 450, y: 420 },
  { q: 'build trust we’re solving the right customer problem?', how: 'Every requirement keeps its reason and source.', main: false, x: 730, y: 420 },
]

function useFit(ref) {
  const [s, setS] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => setS(Math.min(el.clientWidth / W, el.clientHeight / H))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return s
}

export default function PovSlide({ step }) {
  const box = useRef(null)
  const s = useFit(box)
  const [open, setOpen] = useState(null)
  const [worried, setWorried] = useState(false)
  const [lookAt, setLookAt] = useState(null)
  useEffect(() => { setOpen(null); setWorried(false); setLookAt(null) }, [step])
  // look at whatever the presenter points to
  const lookHere = (e) => { const r = e.currentTarget.getBoundingClientRect(); setLookAt([r.left + r.width / 2, r.top + r.height / 2]) }
  const lookAway = () => setLookAt(null)

  return (
    <div className={`pv-stage is-step-${step}`} ref={box}>
      <div className="pv-canvas" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${s})` }}>
        {/* the developer, drawn in pencil once when the card opens */}
        <DevFigure className="pv-eng" mood={worried ? 'worried' : 'happy'} target={lookAt} />

        {/* step 0: sketch notes */}
        <div className={`pv-notes${step === 0 ? ' is-on' : ''}`}>
          <svg className="pv-arrows" width={W} height={H} aria-hidden>
            <path d="M 395 175 C 430 150, 445 140, 470 138" pathLength="1" />
            <path d="M 420 360 C 440 345, 455 330, 470 326" pathLength="1" />
          </svg>
          <div className="pv-note" style={{ left: 480, top: 96 }} onMouseEnter={lookHere} onMouseLeave={lookAway}>
            <span className="hand">wants</span>
            <b>One place to see and change requirements</b>
          </div>
          <div className="pv-note" style={{ left: 480, top: 286 }} onMouseEnter={(e) => { lookHere(e); setWorried(true) }} onMouseLeave={() => { lookAway(); setWorried(false) }}>
            <span className="hand">but right now</span>
            <b>Late reworks and scattered docs</b>
          </div>
          <div className="pv-others" style={{ left: 480, top: 450 }}>
            <span className="hand">also in the room</span>
            <p><i>Designer</i> wants to talk with customers early</p>
            <p><i>PM</i> wants every stakeholder’s input in one place</p>
          </div>
        </div>

        {/* step 1: the problem, as a thought bubble */}
        <div className={`pv-thought${step === 1 ? ' is-on' : ''}`}>
          <span className="pv-puff" style={{ left: 392, top: 150, width: 14, height: 14 }} />
          <span className="pv-puff" style={{ left: 418, top: 118, width: 22, height: 22 }} />
          <div className="pv-bubble" style={{ left: 455, top: 70 }} onMouseEnter={lookHere} onMouseLeave={lookAway}>
            <small>Problem (POV)</small>
            <p>{POV}</p>
          </div>
        </div>

        {/* step 2: How Might We chips */}
        <div className={`pv-hmws${step === 2 ? ' is-on' : ''}`}>
          {HMW.map((h, i) => (
            <button
              key={i}
              type="button"
              className={`pv-chip${h.main ? ' is-main' : ''}${open === i ? ' is-open' : ''}`}
              style={{ left: h.x, top: h.y, '--d': `${i * 110}ms` }}
              onClick={(e) => { e.currentTarget.blur(); setOpen(open === i ? null : i) }}
              onMouseEnter={lookHere}
              onMouseLeave={lookAway}
              aria-expanded={open === i}
            >
              <span className="pv-chip-q"><b>HMW</b> {h.q}</span>
              <span className="pv-chip-how"><em>{h.main ? 'Astra' : 'Astra, secondarily'}</em>{h.how}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
