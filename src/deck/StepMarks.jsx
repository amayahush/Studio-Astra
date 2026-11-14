// Step marks for the deck: little Astra stars.
// Upcoming steps are pencil-outlined stars, passed steps fill in grey,
// and the step you're on is the purple Astra star.
// Reusable on any card: <StepMarks total={3} at={step} />

const STAR = 'M8.1 0.6C8.5 -0.2 9.7 -0.2 10.0 0.6L11.9 5.7C12.0 5.9 12.2 6.2 12.5 6.3L17.5 8.1C18.4 8.5 18.4 9.7 17.5 10.0L12.5 11.9C12.2 12.0 12.0 12.2 11.9 12.5L10.0 17.5C9.7 18.4 8.5 18.4 8.1 17.5L6.3 12.5C6.2 12.2 5.9 12.0 5.7 11.9L0.6 10.0C-0.2 9.7 -0.2 8.5 0.6 8.1L5.7 6.3C5.9 6.2 6.2 5.9 6.3 5.7L8.1 0.6Z'

export default function StepMarks({ total, at }) {
  return (
    <div className="sm" role="img" aria-label={`Step ${at} of ${total}`}>
      {Array.from({ length: total }, (_, n) => {
        const state = n < at - 1 ? 'done' : n === at - 1 ? 'here' : 'next'
        return (
          <svg key={n} className={`sm-mark is-${state}`} viewBox="0 0 20 20" width="20" height="20" aria-hidden>
            <g className="sm-star" transform="translate(2.4 2.4) scale(0.8)">
              <path d={STAR} pathLength="1" />
            </g>
          </svg>
        )
      })}
    </div>
  )
}
