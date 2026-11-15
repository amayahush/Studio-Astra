import { useEffect, useRef, useState } from 'react'

// The pencil developer from the homepage POV card, redrawn as vector strokes so it stays sharp
// at any size. Eyes follow the cursor (or a target), the head tilts a little, and it blinks.
// mood: 'happy' | 'worried'

const HEAD = [
  { t: [2, 2], d: 'M 11.1 4.6 C 10.9 4.6 9.4 4.6 6.8 5.3 C -1.9 7.7 -0.1 30.0 0.9 37.5 C 1.6 42.8 6.5 45.1 10.2 47.3 C 13.4 49.2 20.3 50.3 30.1 51.5 C 48.4 53.8 54.5 49.4 58.9 46.8 C 61.9 45.0 63.8 40.4 67.0 29.3 C 68.3 25.1 67.5 22.4 66.9 20.7 C 64.7 14.8 55.3 7.7 49.4 3.7 C 45.7 1.1 40.0 0.5 20.0 0 C 15.7 0.0 14.7 0.2 13.8 0.6 C 12.8 0.9 12.0 1.2 9.5 2.9', sd: 0, sl: 1100 },
]
const SMILE = { t: [14.7, 34.2], d: 'M 0 1.7 C 0 1.7 0 2.2 0.0 2.9 C 0.1 3.5 1.6 4.4 3.7 5.6 C 5.3 6.6 7.5 7.3 10.5 8.2 C 15.7 9.8 18.6 9.6 20.7 9.2 C 24.3 8.5 26.9 5.2 29.4 2.9 C 30.1 2.3 31.2 1.5 31.9 0.9 C 32.6 0.4 32.9 0.3 33.2 0', sd: 1700, sl: 450 }
const FROWN = 'M 0 8.5 C 4 4.5 9 2.2 15 2.0 C 21 1.8 27 4.5 33.2 8.0'
const BODY = [
  { t: [7.2, 52.6], d: 'M 10.2 0 C 9.7 0.1 7.7 1.7 5.1 5.5 C 3.5 7.8 2.5 11.4 1.3 15.7 C 0.7 17.9 0.3 20.2 0.1 25.1 C -0.0 30.0 -0.0 37.6 0.0 45.8 L 0 49', sd: 2200, sl: 500 },
  { t: [62.5, 48.6], d: 'M 0 0 C 0.0 0 2.5 4.6 7.0 13.5 C 9.1 17.7 10.4 21.2 11.6 24.7 C 12.7 28.2 13.6 31.5 14.2 35.8 C 14.8 40.1 14.7 49.3 14.9 52.3 L 15 55', sd: 2450, sl: 500 },
  { t: [25.5, 62.3], d: 'M 13.1 2.7 C 11.1 2.7 6.2 2.6 3.3 1.7 C 1.7 1.3 0.8 0.2 0.3 0.0 C -0.2 -0.2 0.0 5.7 0.4 12.8 C 0.6 15.2 1.3 15.0 3.0 14.3 C 7.4 12.4 11.9 9.9 14.8 7.8 C 16.0 6.8 16.8 6.1 17.8 5.2', sd: 3000, sl: 420 },
  { t: [40.4, 64.2], d: 'M 0 0 C 0.2 0.0 1.1 0.1 1.9 0.5 C 2.0 0.5 2.2 0.6 2.4 0.7 C 2.7 0.9 3.0 1.1 3.6 1.4', sd: 3420, sl: 120 },
  { t: [43.1, 59.4], d: 'M 0 8.3 C 0.3 7.8 2.1 6.4 5.8 3.6 C 7.5 2.3 8.6 1.2 9.7 0.4 C 10.0 0.1 10.4 -0.0 10.8 0.0 C 14.3 0.1 15.2 8.5 15.5 10.9 C 15.6 11.7 15.8 12.3 15.8 12.8 C 11.6 12.8 3.9 11.7 1.7 10.9 C 1.1 10.8 0.7 10.6 0.0 10.3', sd: 3540, sl: 420 },
]
const EYES = [[21.4, 19.8], [44.6, 20.6]]
const HEAD_C = [35, 27]

// a pencil line: one firm stroke plus a lighter, slightly offset one for texture
function Pencil({ t, d, sd = 0, sl = 400, draw }) {
  return (
    <g transform={`translate(${t[0]} ${t[1]})`}>
      <path d={d} className={`df-line${draw ? ' is-draw' : ''}`} pathLength="1" style={{ '--sd': `${sd}ms`, '--sl': `${sl}ms` }} />
      <path d={d} className={`df-line is-ghost${draw ? ' is-draw' : ''}`} pathLength="1" transform="translate(0.45 0.3)" style={{ '--sd': `${sd + 60}ms`, '--sl': `${sl}ms` }} />
    </g>
  )
}

export default function DevFigure({ target, mood = 'happy', draw = true, className = '' }) {
  const ref = useRef(null)
  const [look, setLook] = useState([0, 0])
  const [blink, setBlink] = useState(false)

  // follow the pointer anywhere on the page, unless a target point is given
  useEffect(() => {
    const aim = (x, y) => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + (HEAD_C[0] / 80) * r.width
      const cy = r.top + (HEAD_C[1] / 104) * r.height
      const dx = x - cx
      const dy = y - cy
      const len = Math.hypot(dx, dy) || 1
      const k = Math.min(1, len / 300)
      setLook([(dx / len) * k, (dy / len) * k])
    }
    if (target) { aim(target[0], target[1]); return }
    const onMove = (e) => aim(e.clientX, e.clientY)
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [target])

  useEffect(() => {
    let t
    const loop = () => {
      t = setTimeout(() => { setBlink(true); setTimeout(() => setBlink(false), 140); loop() }, 2600 + Math.random() * 2600)
    }
    loop()
    return () => clearTimeout(t)
  }, [])

  const tilt = look[0] * 6
  return (
    <svg ref={ref} className={`df ${className}`} viewBox="-2 -2 84 108" aria-hidden>
      <g className={draw ? 'df-fill is-draw' : 'df-fill'}>
        <path transform="translate(5.4 48.5)" d="M 12.5 4 C 6.9 9.6 -4.7 29.3 2.0 51 L 71.5 53 C 74.7 52.3 74.6 47.8 67.0 23.5 L 58.5 0 C 55.7 2.8 42.1 6.7 12.5 4 Z" fill="#397EFF" fillOpacity="0.28" />
      </g>
      {BODY.map((p, i) => <Pencil key={i} {...p} draw={draw} />)}
      <g className="df-head" style={{ transform: `rotate(${tilt}deg)` }}>
        <g className={draw ? 'df-fill is-draw' : 'df-fill'}>
          <ellipse cx="35.5" cy="28" rx="34.5" ry="27" fill="#C8C8C8" />
        </g>
        {HEAD.map((p, i) => <Pencil key={i} {...p} draw={draw} />)}
        {EYES.map(([x, y], i) => (
          <circle key={i} className={`df-eye${draw ? ' is-draw' : ''}`} cx={x + look[0] * 2.6} cy={y + look[1] * 2.2} r="2.3"
            style={{ transform: blink ? 'scaleY(0.15)' : 'none', transformOrigin: `${x}px ${y}px`, '--sd': `${1150 + i * 250}ms` }} />
        ))}
        <g transform={`translate(${SMILE.t[0]} ${SMILE.t[1]})`}>
          <path d={mood === 'worried' ? FROWN : SMILE.d} className={`df-line df-mouth${draw ? ' is-draw' : ''}`} pathLength="1" style={{ '--sd': `${SMILE.sd}ms`, '--sl': `${SMILE.sl}ms` }} />
        </g>
      </g>
    </svg>
  )
}
