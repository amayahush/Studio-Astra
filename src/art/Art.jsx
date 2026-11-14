import { useId } from 'react'
import faceImg from './img/face@4x.png'
import engineerHeadImg from './img/engineer-head@4x.png'
import engineerBodyImg from './img/engineer-body@4x.png'

// Card illustrations, rebuilt from the Figma homepage frame (node 707:3121).
// Every illustration lives on a 272 x 254 stage (the card size in Figma), so
// coordinates below are the Figma positions relative to the card's top-left.


// Hand-drawn face from "Interviews" (Group 1): Figma's pencil render at 4x, so the
// varying stroke width comes through. Offset by the stroke overflow Figma adds.
function Face({ x, y }) {
  return <img className="abs" src={faceImg} alt="" draggable="false" style={{ left: x - 1.17, top: y - 1.19, width: 36.25, height: 28.5 }} />
}

export function InterviewsArt() {
  // Row 1: four grey. Row 2: grey, green, green, pink.
  // Hover: each person arrives and "talks" (a typing bubble), then the coded ones get tinted.
  const cols = [46, 94, 142, 190]
  const rows = [
    { y: 80, fills: ['#D9D9D9', '#D9D9D9', '#D9D9D9', '#D9D9D9'] },
    { y: 126, fills: ['#D9D9D9', '#A3D8B3', '#A3D8B3', '#D8A3D1'] },
  ]
  let tintOrder = 0
  return rows.map((row, r) =>
    cols.map((x, c) => {
      const n = r * 4 + c
      const coded = row.fills[c] !== '#D9D9D9'
      const tint = coded ? 2500 + tintOrder++ * 260 : null
      return (
        <div
          key={`${r}-${c}`}
          className={`abs face-unit${coded ? ' is-coded' : ''}`}
          style={{ left: x, top: row.y, '--fd': `${n * 170}ms`, '--tint': `${tint}ms` }}
        >
          <div className="abs blob" style={{ left: 0, top: 0, background: row.fills[c], '--c': row.fills[c] }} />
          <div className="face-wobble">
            <Face x={4} y={0} />
          </div>
          <svg className="abs talk" style={{ left: 22, top: -15 }} width="22" height="15" viewBox="0 0 22 15" aria-hidden>
            <path d="M3 1.5h16a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2H9l-4 3v-3H3a2 2 0 0 1-2-2V3.5a2 2 0 0 1 2-2z" fill="#fff" stroke="#545454" strokeWidth="1.2" strokeLinejoin="round" />
            <circle className="talk-dot" cx="7" cy="6.3" r="1.2" fill="#545454" />
            <circle className="talk-dot" cx="11" cy="6.3" r="1.2" fill="#545454" style={{ animationDelay: '0.15s' }} />
            <circle className="talk-dot" cx="15" cy="6.3" r="1.2" fill="#545454" style={{ animationDelay: '0.3s' }} />
          </svg>
        </div>
      )
    }),
  )
}

function Sticky({ left, top, rotate, color, text, d, typeAt }) {
  return (
    <div className="abs sticky-box" style={{ left, top, '--d': `${d}ms` }}>
      <div className="sticky" style={{ background: color, transform: `rotate(${rotate}deg)` }}>
        {text && (
          <span aria-hidden>
            {[...text].map((ch, i) => (
              <span key={i} className="tch" style={{ '--td': `${typeAt + i * 55}ms` }}>{ch}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

export function ThematicArt() {
  return (
    <>
      <Sticky left={22} top={62} rotate={3.66} color="#9275CD" d={0} />
      <Sticky left={27.95} top={52.59} rotate={3.66} color="#D5C0FF" text="Defining Requirements" d={70} typeAt={950} />
      <Sticky left={139} top={91} rotate={-3.66} color="#DB86BE" d={60} />
      <Sticky left={132.95} top={81.59} rotate={-3.66} color="#FFA3DF" text="Missing Requirements" d={130} typeAt={950} />
    </>
  )
}

export function EcosystemArt() {
  const maskId = `eco-ring-${useId().replace(/:/g, '')}`
  // Ring centred on the card (Figma had it 6.5px left of centre).
  const cx = 136
  const cy = 122.5
  return (
    <>
      <svg className="abs eco-quad" style={{ left: cx, top: cy - 59.5 }} width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden>
        <path d="M59.5 59.5C59.5 51.6 57.9 43.9 54.9 36.7C51.9 29.5 47.5 22.9 42.0 17.4C36.5 11.9 29.9 7.5 22.7 4.5C15.5 1.5 7.8 0 0 0L0 59.5H59.5Z" fill="#FFD771" fillOpacity="0.4" />
      </svg>
      <svg className="abs eco-ring" style={{ left: cx - 70.5, top: cy - 70.5 }} width="141" height="141" viewBox="0 0 141 141" fill="none" aria-hidden>
        <mask id={maskId} fill="white">
          <path d="M141 70.5C141 109.4 109.4 141 70.5 141C31.5 141 0 109.4 0 70.5C0 31.5 31.5 0 70.5 0C109.4 0 141 31.5 141 70.5ZM20.0 70.5C20.0 98.3 42.6 120.9 70.5 120.9C98.3 120.9 120.9 98.3 120.9 70.5C120.9 42.6 98.3 20.0 70.5 20.0C42.6 20.0 20.0 42.6 20.0 70.5Z" />
        </mask>
        <path d="M141 70.5C141 109.4 109.4 141 70.5 141C31.5 141 0 109.4 0 70.5C0 31.5 31.5 0 70.5 0C109.4 0 141 31.5 141 70.5ZM20.0 70.5C20.0 98.3 42.6 120.9 70.5 120.9C98.3 120.9 120.9 98.3 120.9 70.5C120.9 42.6 98.3 20.0 70.5 20.0C42.6 20.0 20.0 42.6 20.0 70.5Z" fill="#FFA3DF" stroke="#FF8FD8" strokeWidth="2" mask={`url(#${maskId})`} />
      </svg>
      <svg className="abs eco-v" style={{ left: cx - 0.5, top: cy - 78 }} width="1" height="156" aria-hidden>
        <line x1="0.5" y1="0" x2="0.5" y2="156" stroke="#FF00F7" strokeDasharray="2 2" />
      </svg>
      <svg className="abs eco-h" style={{ left: cx - 78, top: cy - 0.5 }} width="156" height="1" aria-hidden>
        <line x1="156" y1="0.5" x2="0" y2="0.5" stroke="#FF00F7" strokeDasharray="2 2" />
      </svg>
    </>
  )
}

export function JourneyArt() {
  const grey = '#A5A5A5'
  const light = '#D9D9D9'
  const purple = '#D980FF'
  const blocks = [
    [57, 59, 68, 29, grey],
    [130, 59, 68, 29, grey],
    [203, 59, 52, 29, purple],
    'highlight',
    [19, 59, 30, 66, grey],
    [19, 131, 30, 36, grey],
    [57, 96, 141, 29, light],
    [203, 96, 52, 29, purple],
    [57, 131, 68, 15, light],
    [57, 152, 68, 15, light],
    [130, 131, 68, 36, light],
    [203, 131, 52, 36, purple],
  ]
  return blocks.map((b, i) =>
    b === 'highlight' ? (
      <div key={i} className="abs journey-highlight jm-hl" style={{ left: 200, top: 55, width: 58, height: 117 }} />
    ) : (
      <div key={i} className="abs jm-block" style={{ left: b[0], top: b[1], width: b[2], height: b[3], background: b[4], '--d': `${Math.round((b[0] - 19) * 1.6 + (b[1] - 59) * 1.2)}ms` }} />
    ),
  )
}

export function HmwArt() {
  const cols = Array.from({ length: 25 }, (_, i) => 26 + i * 9)
  return (
    <>
      {cols.map((x, i) => (
        <svg key={x} className="abs hmw-col" style={{ left: x, top: 66, '--d': `${i * 40}ms` }} width="4" height="160" viewBox="0 0 4 160" aria-hidden>
          {Array.from({ length: 13 }, (_, j) => (
            <circle key={j} cx="2" cy={2 + j * 13} r="2" fill="#8A8A8A" />
          ))}
        </svg>
      ))}
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="abs hmw-chip" style={{ left: 97.5, top: 100 + i * 32, '--d': `${1250 + i * 260}ms` }}>
          {n}. HMW
        </div>
      ))}
    </>
  )
}

function Star({ size, inset, color, x, y, className = '', d = 0 }) {
  // Four-point star from Figma (Star 1 / Star 2), drawn inside a size x size box.
  const inner = size * (1 - inset * 2)
  return (
    <svg className={`abs ${className}`} style={{ left: x + size * inset, top: y + size * inset, '--d': `${d}ms` }} width={inner} height={inner} viewBox="0 0 19 19" aria-hidden>
      <path d="M8.1 0.6C8.5 -0.2 9.7 -0.2 10.0 0.6L11.9 5.7C12.0 5.9 12.2 6.2 12.5 6.3L17.5 8.1C18.4 8.5 18.4 9.7 17.5 10.0L12.5 11.9C12.2 12.0 12.0 12.2 11.9 12.5L10.0 17.5C9.7 18.4 8.5 18.4 8.1 17.5L6.3 12.5C6.2 12.2 5.9 12.0 5.7 11.9L0.6 10.0C-0.2 9.7 -0.2 8.5 0.6 8.1L5.7 6.3C5.9 6.2 6.2 5.9 6.3 5.7L8.1 0.6Z" fill={color} />
    </svg>
  )
}
export { Star }

export function PovArt({ engX = 94.66, stars = [[47, 153], [174, 61]] }) {
  const uid = useId().replace(/:/g, '')
  return (
    <>
      <svg className="abs pov-eng" style={{ left: engX, top: 78.62 }} width="80.75" height="104" viewBox="-0.34 -0.38 80.75 104" aria-hidden>
        {/* The pencil render is revealed through a mask that "draws" along each stroke,
            in the order a person would sketch it. Lines and fills are separate layers so no colour shows
            ahead of the pencil; fills wash in once the lines are down. */}
        <mask id={`pov-head-${uid}`} maskUnits="userSpaceOnUse" x="-2" y="-2" width="85" height="108">
          <g fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path className="draw-stroke" transform="translate(2 2)" d="M 11.1 4.6 C 10.9 4.6 9.4 4.6 6.8 5.3 C -1.9 7.7 -0.1 30.0 0.9 37.5 C 1.6 42.8 6.5 45.1 10.2 47.3 C 13.4 49.2 20.3 50.3 30.1 51.5 C 48.4 53.8 54.5 49.4 58.9 46.8 C 61.9 45.0 63.8 40.4 67.0 29.3 C 68.3 25.1 67.5 22.4 66.9 20.7 C 64.7 14.8 55.3 7.7 49.4 3.7 C 45.7 1.1 40.0 0.5 20.0 0 C 15.7 0.0 14.7 0.2 13.8 0.6 C 12.8 0.9 12.0 1.2 9.5 2.9" pathLength="1" style={{ '--sd': '0ms', '--sl': '1100ms' }} />
          <path className="draw-stroke" transform="translate(19.7 18)" d="M 1.6 1.4 C 1.3 0.4 0.3 0.5 0.0 1.1 C -0.0 1.8 0.3 2.7 1.6 3.0 C 2.5 2.5 2.4 1.8 1.8 1.2 C 1.2 1.0 0.5 1.6 1.2 2.6 C 2.4 2.6 3.1 1.6 3.0 0.3 C 1.8 -0.0 0.4 0.8 0.4 2.6 C 1.0 3.5 3.0 3.8 3.7 2.0" pathLength="1" style={{ '--sd': '1150ms', '--sl': '260ms' }} />
          <path className="draw-stroke" transform="translate(42.2 18.6)" d="M 1.7 0.0 C 1.9 2.2 3.4 3.9 4.2 4.0 C 4.7 3.1 3.3 1.1 0.9 1.2 C 0.8 2.3 2.8 2.9 3.2 2.1 C 3.1 1.0 1.4 0.0 0.3 0.0 C 0.0 0.5 0 1.0 0 1.0" pathLength="1" style={{ '--sd': '1420ms', '--sl': '260ms' }} />
          <path className="draw-stroke" transform="translate(14.7 34.2)" d="M 0 1.7 C 0 1.7 0 2.2 0.0 2.9 C 0.1 3.5 1.6 4.4 3.7 5.6 C 5.3 6.6 7.5 7.3 10.5 8.2 C 15.7 9.8 18.6 9.6 20.7 9.2 C 24.3 8.5 26.9 5.2 29.4 2.9 C 30.1 2.3 31.2 1.5 31.9 0.9 C 32.6 0.4 32.9 0.3 33.2 0" pathLength="1" style={{ '--sd': '1700ms', '--sl': '450ms' }} />
          </g>
        </mask>
        <mask id={`pov-body-${uid}`} maskUnits="userSpaceOnUse" x="-2" y="-2" width="85" height="108">
          <g fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path className="draw-stroke" transform="translate(7.2 52.6)" d="M 10.2 0 C 9.7 0.1 7.7 1.7 5.1 5.5 C 3.5 7.8 2.5 11.4 1.3 15.7 C 0.7 17.9 0.3 20.2 0.1 25.1 C -0.0 30.0 -0.0 37.6 0.0 45.8 L 0 49" pathLength="1" style={{ '--sd': '2200ms', '--sl': '500ms' }} />
          <path className="draw-stroke" transform="translate(62.5 48.6)" d="M 0 0 C 0.0 0 2.5 4.6 7.0 13.5 C 9.1 17.7 10.4 21.2 11.6 24.7 C 12.7 28.2 13.6 31.5 14.2 35.8 C 14.8 40.1 14.7 49.3 14.9 52.3 L 15 55" pathLength="1" style={{ '--sd': '2450ms', '--sl': '500ms' }} />
          <path className="draw-stroke" transform="translate(25.5 62.3)" d="M 13.1 2.7 C 11.1 2.7 6.2 2.6 3.3 1.7 C 1.7 1.3 0.8 0.2 0.3 0.0 C -0.2 -0.2 0.0 5.7 0.4 12.8 C 0.6 15.2 1.3 15.0 3.0 14.3 C 7.4 12.4 11.9 9.9 14.8 7.8 C 16.0 6.8 16.8 6.1 17.8 5.2" pathLength="1" style={{ '--sd': '3000ms', '--sl': '420ms' }} />
          <path className="draw-stroke" transform="translate(40.4 64.2)" d="M 0 0 C 0.2 0.0 1.1 0.1 1.9 0.5 C 2.0 0.5 2.2 0.6 2.4 0.7 C 2.7 0.9 3.0 1.1 3.6 1.4" pathLength="1" style={{ '--sd': '3420ms', '--sl': '120ms' }} />
          <path className="draw-stroke" transform="translate(43.1 59.4)" d="M 0 8.3 C 0.3 7.8 2.1 6.4 5.8 3.6 C 7.5 2.3 8.6 1.2 9.7 0.4 C 10.0 0.1 10.4 -0.0 10.8 0.0 C 14.3 0.1 15.2 8.5 15.5 10.9 C 15.6 11.7 15.8 12.3 15.8 12.8 C 11.6 12.8 3.9 11.7 1.7 10.9 C 1.1 10.8 0.7 10.6 0.0 10.3" pathLength="1" style={{ '--sd': '3540ms', '--sl': '420ms' }} />
          </g>
        </mask>
        <g className="draw-fill">
          <ellipse cx="35.5" cy="28" rx="35.5" ry="28" fill="#C8C8C8" />
          <path transform="translate(5.4 48.5)" d="M 12.5 4 C 6.9 9.6 -4.7 29.3 2.0 51 L 71.5 53 C 74.7 52.3 74.6 47.8 67.0 23.5 L 58.5 0 C 55.7 2.8 42.1 6.7 12.5 4 Z" fill="#397EFF" fillOpacity="0.3" />
        </g>
        {/* Head and body lines are separate renders, each revealed only by its own strokes,
            so drawing the head can't uncover the tops of the body lines underneath it. */}
        <image href={engineerHeadImg} x="-0.336" y="-0.375" width="72.27" height="56.86" mask={`url(#pov-head-${uid})`} />
        <image href={engineerBodyImg} x="4.281" y="46.109" width="76.05" height="57.41" mask={`url(#pov-body-${uid})`} />
      </svg>
      {stars.map(([x, y], i) => (
        <Star key={i} size={21} inset={0.0896} color="#656565" x={x} y={y} className="pov-star" d={2050 + i * 150} />
      ))}
    </>
  )
}

export function MindMapArt() {
  // Whole sketch shifted 7px left so it sits centred in the card.
  const dx = -7
  return (
    <>
      <div className="abs mm-a" style={{ left: 31 + dx, top: 73, width: 89, height: 30, background: '#D5C0FF' }} />
      <div className="abs mm-b" style={{ left: 34 + dx, top: 148, width: 84, height: 30, background: '#D9D9D9' }} />
      <div className="abs mm-target" style={{ left: 145 + dx, top: 125, width: 110, height: 30, border: '2px solid #FF00F7' }} />
      <svg className="abs" style={{ left: 120 + dx, top: 87 }} width="25" height="54" viewBox="0 0 25 54" fill="none" aria-hidden>
        <path className="mm-elbow" d="M0 1H16.5V52.5H25" stroke="#606060" strokeWidth="2" pathLength="1" />
      </svg>
      <svg className="abs mm-dash" style={{ left: 78 + dx, top: 103 }} width="2" height="46" viewBox="0 0 2 46" fill="none" aria-hidden>
        <path d="M1 0V46" stroke="#606060" strokeWidth="2" strokeDasharray="4 4" />
      </svg>
    </>
  )
}

export function IdeatingArt() {
  const rows = [
    { y: 60, color: '#CFCCCC' },
    { y: 105, color: 'rgba(196, 57, 255, 0.5)' },
    { y: 150, color: '#C439FF' },
  ]
  return rows.map((r, i) => (
    <div key={r.y} className="abs idea-row" style={{ left: 99, top: r.y, width: 80, height: 31, '--d': `${i * 290}ms` }}>
      <div className="abs astra-chip" style={{ left: 0, top: 0, background: r.color }} />
      <Star size={22} inset={0.0855} color="#fff" x={4} y={5} className="idea-star" d={i * 290 + 30} />
      <span className="abs astra-chip-label" style={{ left: 39, top: 7, color: r.color }}>Astra</span>
      {i < rows.length - 1 && (
        // Pencil strike drawn through this version once the next one lands (hover only).
        <svg className="abs idea-strike" style={{ left: -6, top: 6, '--sd': `${(i + 1) * 609 + 380}ms` }} width="92" height="20" viewBox="0 0 92 20" fill="none" aria-hidden>
          <path d="M2 13 C 20 10.5, 46 12.5, 62 9 S 84 6.5, 90 6" stroke="#545454" strokeWidth="2" strokeLinecap="round" pathLength="1" />
        </svg>
      )}
    </div>
  ))
}

// POV / User Model / HMW: the engineer is sketched in the centre, then a single
// How Might We floats up out of his head as a thought bubble.
export function PovHmwArt() {
  return (
    <>
      <PovArt stars={[[47, 153], [222, 150]]} />
      <span className="abs hmw-puff" style={{ left: 169, top: 88, width: 8, height: 8, '--d': '2050ms' }} />
      <div className="abs hmw-chip hmw-thought" style={{ left: 180, top: 60, '--d': '2250ms' }}>
        HMW…?
      </div>
    </>
  )
}

// Competitive Analysis: a row of today's tools and one empty dashed slot at the end.
// A magnifying glass checks each tool and comes to rest on the empty slot: the gap.
export function CompetitiveArt() {
  const xs = [31, 75, 119, 163] // existing tools
  const gapX = 207
  const y = 98
  return (
    <>
      {xs.map((x, i) => (
        <div key={x} className="abs ca-tile" style={{ left: x, top: y, '--d': `${i * 110}ms` }} />
      ))}
      <div className="abs ca-slot" style={{ left: gapX, top: y }} />
      <svg className="abs ca-lens" style={{ left: gapX + 17 - 18, top: y + 17 - 18 }} width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
        <circle cx="18" cy="18" r="13" fill="rgba(255,255,255,0.35)" stroke="#545454" strokeWidth="3" />
        <path d="M28 28L41 41" stroke="#545454" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </>
  )
}

// Wireframes (with the user flow inside): a small flow across the top feeds a stack of
// screen versions; the front one is the current three-panel layout.
export function WireframesArt() {
  const nodes = [
    { x: 58, c: '#D9D9D9' },
    { x: 118, c: '#D9D9D9' },
    { x: 178, c: '#D5C0FF' },
  ]
  const fx = 66
  const fy = 96
  return (
    <>
      {nodes.map((n, i) => (
        <div key={n.x} className="abs wf-node" style={{ left: n.x, top: 50, background: n.c, '--d': `${i * 260}ms` }} />
      ))}
      {[0, 1].map((i) => (
        <svg key={i} className="abs wf-arrow" style={{ left: nodes[i].x + 37, top: 52, '--d': `${180 + i * 260}ms` }} width="20" height="12" viewBox="0 0 20 12" fill="none" aria-hidden>
          <path d="M1 6H17M13 2l4 4-4 4" stroke="#606060" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
        </svg>
      ))}
      <svg className="abs wf-drop" style={{ left: 194, top: 68, '--d': '780ms' }} width="12" height="26" viewBox="0 0 12 26" fill="none" aria-hidden>
        <path d="M6 1V23M2 19l4 4 4-4" stroke="#606060" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" />
      </svg>
      <div className="abs wf-frame is-v1" style={{ left: fx + 16, top: fy - 12, '--d': '900ms' }} />
      <div className="abs wf-frame is-v2" style={{ left: fx + 8, top: fy - 6, '--d': '1080ms' }} />
      <div className="abs wf-frame is-front" style={{ left: fx, top: fy, '--d': '1260ms' }}>
        <div className="wf-bar"><i /><i /><i /></div>
        <div className="wf-panel wf-left" style={{ '--d': '1550ms' }} />
        <div className="wf-panel wf-mid" style={{ '--d': '1650ms' }}>
          <b style={{ width: '90%' }} /><b style={{ width: '70%' }} /><b style={{ width: '82%' }} /><b style={{ width: '55%' }} />
        </div>
        <div className="wf-panel wf-right" style={{ '--d': '1750ms' }}>
          <span className="is-accent" /><span />
        </div>
      </div>
    </>
  )
}
