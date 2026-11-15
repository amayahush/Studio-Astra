import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import faceImg from '../art/img/face@4x.png'

// POV / User model / HMW, built from the same pieces as the other cards: the interview faces
// and sticky notes. Step 0: three people and what they want (sticky notes). Step 1: the
// developer's note becomes the problem (POV) thought bubble. Step 2: How Might We chips.
export const POV_STEPS = 2

export const POV_CAPTIONS = [
  'Each role wants something different.',
  'The developer gets the requirements last, so I wrote my problem statement from where they sit.',
  'Which opened six How Might We questions. Astra answers all of them, some directly and some secondarily. Click one to see how.',
]

const W = 1000
const H = 600

const PEOPLE = [
  { role: 'Senior Developer', want: 'One place to see and change requirements', now: 'Late reworks and scattered docs', color: '#d5c0ff', shade: '#9275cd' },
  { role: 'Designer', want: 'The why behind a design to survive the handoff', now: 'Devs build without the why', color: '#ffa3df', shade: '#db86be' },
  { role: 'Product Manager', want: 'Every stakeholder’s input in one place', now: 'Requirements scattered across tools', color: '#fff0a8', shade: '#d8c66e' },
]

const POV = 'Senior developers need to know what changed in a requirement and why, because decisions get lost once building starts.'

const HMW = [
  { q: 'arrive at “complete enough” requirements without slowing iteration?', how: 'A living PRD: complete enough to start, still free to change.', main: true, x: 450, y: 30 },
  { q: 'keep everyone aligned when requirements change?', how: 'A change shows as pending in every role’s view until the PM approves it.', main: true, x: 730, y: 30 },
  { q: 'make requirements reusable context for AI agents?', how: 'The approved PRD becomes defined context for the agents.', main: true, x: 450, y: 225 },
  { q: 'show non-technical stakeholders feasibility early?', how: 'Every item shows in its native view (Jira, Figma, Codex), so feasibility is visible.', main: false, x: 730, y: 225 },
  { q: 'make early decisions reflect design and engineering?', how: 'Everyone stays updated and gets a say before a change is final.', main: false, x: 450, y: 420 },
  { q: 'build trust we’re solving the right customer problem?', how: 'Every requirement keeps its reason and source.', main: false, x: 730, y: 420 },
]

// where each person sits: step 0 = three across; later = developer on the left, others gone
const SPOT = [
  [[230, 120], [140, 230]],
  [[500, 120], [140, 230]],
  [[770, 120], [140, 230]],
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
  useEffect(() => setOpen(null), [step])
  const later = step > 0

  return (
    <div className={`pv-stage is-step-${step}`} ref={box}>
      <div className="pv-canvas" style={{ width: W, height: H, transform: `translate(-50%, -50%) scale(${s})` }}>
        {PEOPLE.map((p, i) => {
          const [x, y] = SPOT[i][later ? 1 : 0]
          const gone = later && i > 0
          return (
            <div key={p.role} className={`pv-person${gone ? ' is-gone' : ''}`} style={{ left: x, top: y, '--c': p.color, '--k': p.shade, '--d': `${i * 140}ms` }}>
              <div className="pv-face"><span className="pv-blob" /><img src={faceImg} alt="" draggable="false" /></div>
              <b className="pv-role">{p.role}</b>
              <div className={`pv-sticky${later ? ' is-tucked' : ''}`}>
                <span className="pv-sticky-back" />
                <div className="pv-sticky-front">
                  <small>wants</small>
                  <p>{p.want}</p>
                  <small>right now</small>
                  <p className="is-now">{p.now}</p>
                </div>
              </div>
            </div>
          )
        })}

        {/* step 1: the problem, as a thought bubble from the developer */}
        <div className={`pv-thought${step === 1 ? ' is-on' : ''}`}>
          <span className="pv-puff" style={{ left: 262, top: 212, width: 14, height: 14 }} />
          <span className="pv-puff" style={{ left: 290, top: 176, width: 24, height: 24 }} />
          <div className="pv-bubble" style={{ left: 330, top: 80 }}>
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
