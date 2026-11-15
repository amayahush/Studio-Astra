import { useEffect, useState } from 'react'

// POV / User model / HMW, connected per role: who they are (user model) → the problem (POV)
// → the questions it opens (HMW), and how Astra answers each. → or the role buttons switch roles.
export const POV_STEPS = 2

export const POV_CAPTIONS = [
  'Each role’s story leads to a problem statement, and each problem opens How Might We questions. Start with the developer.',
  'The designer needs to hear from customers and developers while designing, before it’s too late to change course.',
  'The PM needs every stakeholder’s input in one place to build a PRD everyone can trust.',
]

const HMW = {
  complete: { q: 'arrive at “complete enough” requirements without slowing iteration?', how: 'A living PRD', main: true },
  feasibility: { q: 'show non-technical stakeholders feasibility early?', how: 'Native views of every item', main: false },
  judgment: { q: 'make early decisions reflect design and engineering?', how: 'Everyone gets a say', main: false },
  trust: { q: 'build trust we’re solving the right customer problem?', how: 'Reason and source on every requirement', main: false },
  aligned: { q: 'keep everyone aligned when requirements change?', how: 'Pending changes in every view', main: true },
  context: { q: 'make requirements reusable context for AI agents?', how: 'The approved PRD feeds the agents', main: true },
}

const ROLES = [
  {
    id: 'dev', role: 'Senior Developer',
    want: 'One place to see and change requirements',
    pain: 'Late reworks and scattered docs',
    pov: ['Senior developers', 'need to know what changed in a requirement and why, because decisions get lost once building starts.'],
    hmw: ['complete', 'aligned', 'context'],
  },
  {
    id: 'design', role: 'Designer',
    want: 'Talk with customers early',
    pain: 'Building for the wrong problem',
    pov: ['Designers', 'need to hear from customers and developers while they design, because late feedback means solving the wrong problem.'],
    hmw: ['trust', 'judgment', 'feasibility'],
  },
  {
    id: 'pm', role: 'Product Manager',
    want: 'Every stakeholder’s input in one place',
    pain: 'Requirements scattered across tools',
    pov: ['PMs', 'need every stakeholder’s input in one PRD, because that sets the scope developers build from.'],
    hmw: ['aligned', 'feasibility', 'complete'],
  },
]

export default function PovSlide({ step }) {
  const [pick, setPick] = useState(step)
  useEffect(() => setPick(step), [step])
  const r = ROLES[pick]

  return (
    <div className="pv">
      <div className="pv-roles" role="tablist" aria-label="Role">
        {ROLES.map((x, i) => (
          <button key={x.id} type="button" role="tab" aria-selected={i === pick} className={i === pick ? 'is-on' : ''} onClick={(e) => { e.currentTarget.blur(); setPick(i) }}>
            {x.role}
          </button>
        ))}
      </div>

      <div className="pv-chain" key={r.id}>
        <section className="pv-col" style={{ '--d': '0ms' }}>
          <h4>User model</h4>
          <p className="pv-big">{r.want}</p>
          <p className="pv-small">Right now: {r.pain.toLowerCase()}</p>
        </section>

        <section className="pv-col" style={{ '--d': '200ms' }}>
          <h4>Problem (POV)</h4>
          <p className="pv-pov"><b>{r.pov[0]}</b> {r.pov[1]}</p>
        </section>

        <section className="pv-col" style={{ '--d': '400ms' }}>
          <h4>How might we…</h4>
          <ul className="pv-hmw">
            {r.hmw.map((k) => (
              <li key={k} className={HMW[k].main ? 'is-main' : ''}>
                <p>{HMW[k].q}</p>
                <small>{HMW[k].how}</small>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
