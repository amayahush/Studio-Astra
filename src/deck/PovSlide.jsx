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
  complete: { q: 'help stakeholders and developers arrive at “complete enough” requirements without slowing down iteration?', how: 'The PRD stays living, so it can be complete enough to start and still change.', main: true },
  feasibility: { q: 'give non-technical stakeholders a lightweight way to see technical feasibility early, before a design is fully built?', how: 'Each item shows in its native view (Jira, Figma, Codex), so feasibility is visible to everyone.', main: false },
  judgment: { q: 'make sure early product decisions reflect both design and engineering judgment?', how: 'Everyone stays updated and gets a say before a change is final.', main: false },
  trust: { q: 'build trust that developers and designers are building for the correct customer problem?', how: 'Everyone sees the reason and source behind each requirement, and has a say when it changes.', main: false },
  aligned: { q: 'keep everyone aligned when requirements change mid-process?', how: 'A change shows as pending in every role’s view until the PM approves it.', main: true },
  context: { q: 'structure a shared requirements artifact so it also works as reusable context for developers working with AI agents?', how: 'The approved PRD becomes defined context for AI agents.', main: true },
}

const ROLES = [
  {
    id: 'dev', role: 'Senior Developer',
    story: {
      want: 'Easily access and make changes to the requirements and specs.',
      goal: 'Understand the scope, work spec-driven, align feasibility with stakeholders, and have one source of truth that also gives AI tools context.',
      gap: 'Large reworks late in the build, and documentation too scattered to scale or give AI proper context.',
    },
    pov: [
      ['user', 'Senior software developers'],
      ['need', 'need a way to know what changed in a requirement, why, and whether it’s final,'],
      ['why', 'because requirements keep shifting after building starts and the decisions behind them get lost in chats, emails and meetings.'],
    ],
    hmw: ['complete', 'aligned', 'context'],
  },
  {
    id: 'design', role: 'Designer',
    story: {
      want: 'Talk with customers early.',
      goal: 'Understand the true problem to design for.',
      gap: 'The team solves the wrong problem, or builds from rigid requirements without speaking to customers.',
    },
    pov: [
      ['user', 'Designers'],
      ['need', 'need a way to hear from customers and developers while they design,'],
      ['why', 'because requirements surface through prototypes, and feedback that comes late means solving the wrong problem.'],
    ],
    hmw: ['trust', 'judgment', 'feasibility'],
  },
  {
    id: 'pm', role: 'Product Manager',
    story: {
      want: 'All stakeholder conversations and requirements in one place.',
      goal: 'Build a solid PRD that breaks down every requirement and phase.',
      gap: 'Requirements stay scattered across email, Teams, PowerPoint and Jira, which leads to back-and-forth and missed deadlines.',
    },
    pov: [
      ['user', 'Product managers'],
      ['need', 'need a way to consolidate every early stakeholder requirement into one PRD,'],
      ['why', 'because it sets the initial scope and lets developers break the work down properly.'],
    ],
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
          <h4><b>1</b>User model</h4>
          <div className="pv-card">
            <p className="pv-want">{r.story.want}</p>
            <dl>
              <dt>So they can</dt><dd>{r.story.goal}</dd>
              <dt>Right now it’s causing</dt><dd>{r.story.gap}</dd>
            </dl>
          </div>
        </section>

        <span className="pv-arrow" aria-hidden style={{ '--d': '180ms' }}>→</span>

        <section className="pv-col" style={{ '--d': '260ms' }}>
          <h4><b>2</b>Problem (POV)</h4>
          <div className="pv-card is-pov">
            <p>
              {r.pov.map(([k, t]) => (
                <span key={k} className={`pv-part is-${k}`}><i>{k}</i>{t} </span>
              ))}
            </p>
          </div>
        </section>

        <span className="pv-arrow" aria-hidden style={{ '--d': '440ms' }}>→</span>

        <section className="pv-col" style={{ '--d': '520ms' }}>
          <h4><b>3</b>How might we…</h4>
          <ol className="pv-hmw">
            {r.hmw.map((k) => (
              <li key={k} className={HMW[k].main ? 'is-main' : ''}>
                <p>…{HMW[k].q}</p>
                <small><em>{HMW[k].main ? 'Astra' : 'Astra, secondarily'}</em>{HMW[k].how}</small>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
