// Step marks for the deck: hand-drawn circles that echo the face outlines.
// Upcoming steps are open pencil circles, steps you've passed fill in,
// and the step you're on becomes a little Astra star.
// Reusable on any card: <StepMarks total={3} at={step} />

const STAR = 'M8.1 0.6C8.5 -0.2 9.7 -0.2 10.0 0.6L11.9 5.7C12.0 5.9 12.2 6.2 12.5 6.3L17.5 8.1C18.4 8.5 18.4 9.7 17.5 10.0L12.5 11.9C12.2 12.0 12.0 12.2 11.9 12.5L10.0 17.5C9.7 18.4 8.5 18.4 8.1 17.5L6.3 12.5C6.2 12.2 5.9 12.0 5.7 11.9L0.6 10.0C-0.2 9.7 -0.2 8.5 0.6 8.1L5.7 6.3C5.9 6.2 6.2 5.9 6.3 5.7L8.1 0.6Z'

// A slightly lumpy circle that overshoots its start, like a quick pencil loop.
// Each index gets its own wobble so no two look identical.
function loop(i) {
  const pts = []
  const turns = 1.12
  const steps = 28
  for (let s = 0; s <= steps; s++) {
    const t = (s / steps) * Math.PI * 2 * turns - Math.PI / 2 + i * 0.9
    const r = 6.2 + Math.sin(t * 3 + i * 1.7) * 0.45 + Math.cos(t * 2 + i) * 0.3 + (s / steps) * 0.5
    pts.push([10 + Math.cos(t) * r, 10 + Math.sin(t) * r])
  }
  return pts.map(([x, y], n) => `${n ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('')
}

export default function StepMarks({ total, at }) {
  return (
    <div className="sm" role="img" aria-label={`Step ${at} of ${total}`}>
      {Array.from({ length: total }, (_, n) => {
        const state = n < at - 1 ? 'done' : n === at - 1 ? 'here' : 'next'
        return (
          <svg key={n} className={`sm-mark is-${state}`} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
            <path className="sm-loop" d={loop(n)} pathLength="1" />
            <g className="sm-star" transform="translate(2.4 2.4) scale(0.8)">
              <path d={STAR} />
            </g>
          </svg>
        )
      })}
    </div>
  )
}
