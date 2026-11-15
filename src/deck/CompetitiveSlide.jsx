// Competitive analysis: what existing tools already do across a requirement's life,
// where coverage thins out, and where Astra fits. Ratings come from each product's own
// public pages (Nov 2026): 2 = documented, 1 = partly, 0 = not found in what I reviewed.
export const COMP_STEPS = 2

export const COMP_CAPTIONS = [
  'Most of what my interviewees asked for already exists somewhere. Turning meetings into tickets, one shared doc, and giving coding agents context are all covered.',
  'Coverage thins out when a requirement changes mid-build. Keeping the spec current is newer, and showing a pending change to every role before anyone builds on it is rare.',
  'Astra is designed around that last row. Scroll for why I didn’t just use one of these.',
]

const TOOLS = [
  { id: 'rovo', name: 'Jira + Confluence', sub: 'with Rovo AI' },
  { id: 'notion', name: 'Notion AI', sub: 'meeting notes + agents' },
  { id: 'pb', name: 'Productboard', sub: 'Spark' },
  { id: 'sdd', name: 'Kiro / Spec Kit', sub: 'spec-driven dev' },
  { id: 'intent', name: 'Augment Intent', sub: 'living specs' },
  { id: 'brief', name: 'Brief', sub: 'decision layer' },
  { id: 'jama', name: 'Jama Connect', sub: 'traceability' },
]

const ROWS = [
  { job: 'Turns conversations into requirements', v: { rovo: 2, notion: 2, pb: 2, sdd: 1, intent: 1, brief: 2, jama: 0 } },
  { job: 'One shared place the whole team reads', v: { rovo: 2, notion: 2, pb: 2, sdd: 1, intent: 1, brief: 1, jama: 2 } },
  { job: 'Gives coding agents defined context', v: { rovo: 2, notion: 0, pb: 2, sdd: 2, intent: 2, brief: 2, jama: 2 } },
  { job: 'Keeps the spec current when something changes mid-build', v: { rovo: 0, notion: 1, pb: 0, sdd: 1, intent: 2, brief: 1, jama: 2 }, late: true },
  { job: 'Shows a pending change to every role before anyone builds on it, and a PM approves it', v: { rovo: 1, notion: 1, pb: 0, sdd: 1, intent: 0, brief: 0, jama: 1 }, late: true, gap: true },
]

const WHY = [
  {
    name: 'Jira + Confluence with Rovo',
    does: 'Rovo can read a pasted meeting transcript, draft Jira issues with acceptance criteria for you to confirm, and write a requirements page in Confluence. An MCP server opens that data to outside AI tools.',
    stops: 'It drafts work from a conversation once. My interviewees already live in Jira and Confluence, and still said decisions never get written back. One called Confluence “where PowerPoints go to die.” Astra is about what happens after the first draft, and it could sit on top of Jira rather than replace it.',
    src: 'https://www.atlassian.com/software/rovo/use-cases/agent-meeting-transcripts-to-jira-issues',
  },
  {
    name: 'Notion AI',
    does: 'Notion transcribes meetings, and on paid plans an agent can turn action items into tasks and update project status and timelines afterward.',
    stops: 'Strong for capturing and following up on meetings. It doesn’t treat a requirement as something with an owner, a source, and a pending state that every role sees.',
    src: 'https://www.notion.com/product/ai-meeting-notes',
  },
  {
    name: 'Productboard Spark',
    does: 'Spark analyzes customer feedback, drafts specs that PM, designer and engineer can co-edit, and serves the latest spec to Claude Code, Codex or Cursor over MCP.',
    stops: 'Its strength is upstream: deciding what to build from customer evidence. The change that lands halfway through a build isn’t its focus.',
    src: 'https://www.productboard.com/use-cases/product-specification/',
  },
  {
    name: 'Kiro and GitHub Spec Kit',
    does: 'Both turn a request into requirements, a design and tasks before an agent writes code, with human approval between phases in Kiro.',
    stops: 'The spec lives in the repo and the developer drives it. Drift is a known problem: Kiro updates a spec when the developer asks, so someone has to notice the drift first. PMs and designers aren’t in that loop.',
    src: 'https://www.augmentcode.com/guides/living-specs-vs-static-specs',
  },
  {
    name: 'Augment Intent',
    does: 'The closest match on “living specs.” The spec updates as agents finish work, and requirement changes propagate to the agents still running.',
    stops: 'It keeps agents in sync inside a developer workspace. Astra is for the people around the code too: the PM who approves, the designer, the customer who changed their mind.',
    src: 'https://www.augmentcode.com/intent',
  },
  {
    name: 'Brief',
    does: 'Brief reads tools like Linear, Notion, GitHub and meeting transcripts and keeps a searchable memory of product decisions that coding agents can query.',
    stops: 'Its own docs say it isn’t for enterprise teams with formal PM processes. Most of my interviews came from exactly those teams, with restricted, approved AI tools.',
    src: 'https://briefhq.ai/docs/what-is-brief/',
  },
  {
    name: 'Jama Connect',
    does: 'Built for traceability: it links requirements to tests and risks, runs change impact analysis, highlights the items and people a change affects, and handles reviews and approvals.',
    stops: 'The closest on handling change, but it’s built for formal systems engineering in regulated industries. It starts from written requirements, not from the conversations where my interviewees said requirements actually form.',
    src: 'https://www.jamasoftware.com/?p=4775',
  },
]

function Mark({ v }) {
  return <span className={`cp-mark is-${v}`} aria-label={v === 2 ? 'documented' : v === 1 ? 'partly' : 'not found'} />
}

export default function CompetitiveSlide({ step }) {
  const rows = ROWS.filter((r) => step >= 1 || !r.late)
  const astra = step >= 2
  return (
    <div className={`cp${astra ? ' has-astra' : ''}`}>
      <div className="cp-table" role="table">
        <div className="cp-row is-head" role="row">
          <span className="cp-job" role="columnheader" />
          {TOOLS.map((t) => (
            <span key={t.id} className="cp-tool" role="columnheader"><b>{t.name}</b><small>{t.sub}</small></span>
          ))}
          <span className={`cp-tool is-astra${astra ? ' is-on' : ''}`} role="columnheader"><b>Astra</b><small>my concept</small></span>
        </div>
        {rows.map((r, i) => (
          <div key={r.job} className={`cp-row${r.gap ? ' is-gap' : ''}${r.late ? ' is-late' : ''}`} role="row" style={{ '--d': `${(r.late ? i - 3 : i) * 120}ms` }}>
            <span className="cp-job" role="rowheader">{r.job}</span>
            {TOOLS.map((t) => <span key={t.id} className="cp-cell" role="cell"><Mark v={r.v[t.id]} /></span>)}
            <span className={`cp-cell is-astra${astra ? ' is-on' : ''}`} role="cell">{astra && <Mark v={2} />}</span>
          </div>
        ))}
      </div>
      <p className="cp-key">
        <span><Mark v={2} /> documented</span>
        <span><Mark v={1} /> partly</span>
        <span><Mark v={0} /> not found</span>
        <em>From each product’s public pages, Nov 2026. Astra is a design concept, so its column shows what it’s designed to do.</em>
      </p>

      {astra && (
        <section className="cp-why">
          <h3 className="hand">Why not just use…</h3>
          <div className="cp-cards">
            {WHY.map((w, i) => (
              <article key={w.name} className="cp-card" style={{ '--d': `${200 + i * 80}ms` }}>
                <h4>{w.name}</h4>
                <p><b>What it does.</b> {w.does}</p>
                <p><b>Where it stops for my problem.</b> {w.stops}</p>
                <a href={w.src} target="_blank" rel="noreferrer">Source</a>
              </article>
            ))}
          </div>
          <p className="cp-honest">
            None of these are bad tools, and Astra borrows from several of them. It could plug into Jira or a coding agent over MCP instead of replacing them.
            What I’m designing is the human part: who gets told when a requirement changes, what they see, and who decides.
          </p>
        </section>
      )}
    </div>
  )
}
