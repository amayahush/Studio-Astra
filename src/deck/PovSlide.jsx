// POV / User model / HMW. Step 0: my problem statement, rewritten until it held up (earlier
// versions get crossed out). Step 1: the three user stories. Step 2: the HMW questions, with
// the ones Astra answers marked.
export const POV_STEPS = 2

export const POV_CAPTIONS = [
  'I rewrote my problem statement five times. Each version got closer to what the research was actually saying.',
  'Then I wrote one story per role: what they want, what’s in the way, and why it matters to the business.',
  'Those turned into How Might We questions. The purple ones are the ones Astra answers.',
]

const DRAFTS = [
  'Developers need solidified, in-depth product requirements, so they don’t have to adjust back and forth as requirements change.',
  'Developers need clear visibility into product requirements, so the product gets built and broken down correctly.',
  'Developers need to understand the full scope before implementation starts, because a partial scope leads to rework.',
  'Developers need to trust that requirements are grounded in a validated problem, because building on an assumption wastes time.',
]

// final POV, split into the template's three parts: user / need / why
const FINAL = {
  user: 'Senior software developers',
  need: 'need a way to know what changed in a requirement, why, and whether it’s final,',
  why: 'because requirements keep shifting after building starts, and the decisions behind them get lost in chats, emails and meetings, so developers end up building on an outdated version.',
}

const STORIES = [
  {
    role: 'Senior Developer',
    want: 'Easily access and make changes to the requirements and specs.',
    goal: 'Understand the project scope, work spec-driven, align feasibility with stakeholders, and have one source of truth that documents decisions and gives AI tools context.',
    gap: 'Large reworks late in the build, and documentation too scattered to scale similar products or give AI proper context.',
    value: 'Fewer costly late-stage reworks and a shorter build cycle.',
  },
  {
    role: 'Designer',
    want: 'Talk with customers early.',
    goal: 'Understand the true problem to design for.',
    gap: 'The team solves the wrong problem, or builds from rigid requirements without speaking to customers.',
    value: 'The right problem gets solved the first time, with less wasted design and development effort.',
  },
  {
    role: 'Product Manager',
    want: 'All stakeholder conversations and requirements centralized in one place.',
    goal: 'Build a solid PRD that breaks down every requirement and phase.',
    gap: 'Requirements and updates stay scattered across email, Teams, PowerPoint and Jira, which leads to back-and-forth and missed deadlines.',
    value: 'Less miscommunication, development aligned with real priorities, and deadlines hit more consistently.',
  },
]

const HMW = [
  { q: 'help stakeholders and developers arrive at “complete enough” requirements without slowing down iteration?', astra: true },
  { q: 'give non-technical stakeholders (business leaders, SMEs) a lightweight way to see technical feasibility early, before a design is fully built?', astra: false },
  { q: 'make sure early product decisions reflect both design and engineering judgment?', astra: false },
  { q: 'build trust that developers and designers are building for the correct customer problem?', astra: false },
  { q: 'keep everyone aligned when requirements change mid-process?', astra: true },
  { q: 'structure a shared requirements artifact so it also works as reusable context for developers working with AI agents?', astra: true },
]

export default function PovSlide({ step }) {
  if (step === 0) {
    return (
      <div className="pv" key="pov">
        <ol className="pv-drafts">
          {DRAFTS.map((d, i) => (
            <li key={i} style={{ '--d': `${i * 650}ms` }}>
              <small>v{i + 1}</small>
              <span><s>{d}</s></span>
            </li>
          ))}
        </ol>
        <div className="pv-final" style={{ '--d': `${DRAFTS.length * 650 + 300}ms` }}>
          <small>v5 · where I landed</small>
          <p>
            <mark className="is-user"><i>user</i>{FINAL.user}</mark>{' '}
            <mark className="is-need"><i>need</i>{FINAL.need}</mark>{' '}
            <mark className="is-why"><i>why</i>{FINAL.why}</mark>
          </p>
        </div>
      </div>
    )
  }

  if (step === 1) {
    return (
      <div className="pv-stories" key="stories">
        {STORIES.map((s, i) => (
          <article key={s.role} className="pv-story" style={{ '--d': `${i * 140}ms` }}>
            <h3>{s.role}</h3>
            <dl>
              <dt>Wants</dt><dd>{s.want}</dd>
              <dt>So they can</dt><dd>{s.goal}</dd>
              <dt>Right now it’s causing</dt><dd>{s.gap}</dd>
              <dt>Why it matters</dt><dd>{s.value}</dd>
            </dl>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="pv-hmw" key="hmw">
      <span className="pv-hmw-lead hand">How might we…</span>
      <ol>
        {HMW.map((h, i) => (
          <li key={i} className={h.astra ? 'is-astra' : ''} style={{ '--d': `${i * 120}ms` }}>
            <span>…{h.q}</span>
            {h.astra && <em>Astra answers this</em>}
          </li>
        ))}
      </ol>
    </div>
  )
}
