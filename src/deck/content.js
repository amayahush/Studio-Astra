// Copy for the deck. Hooks are drafts in my voice: grey lead-in, then the point.
// Card order matches the homepage grid.
export const SLIDES = [
  { id: 'interviews', label: 'Interviews', grey: 'Before designing anything,', sub: 'The engineers kept pointing to the people around them, the PM writing requirements and the designers handing work off, so I widened the circle to the whole team.', black: ' I needed to hear how engineers actually work with AI.' },
  { id: 'thematic-analysis', label: 'Thematic Analysis', grey: 'Eight people, one pattern:', black: ' the requirements were never really finished.' },
  { id: 'ecosystem-map', label: 'Ecosystem Map', grey: 'Requirements pass through a lot of hands,', black: ' so I mapped who touches them.' },
  { id: 'journey-map', label: 'Journey Map', grey: 'Following one engineer’s day', black: ' showed exactly where the workflow falls through.' },
  { id: 'competitive-analysis', label: 'Competitive Analysis', grey: 'AI coding tools write code from a spec,', black: ' and none of them help shape the spec.' },
  { id: 'pov-user-model-hmw', label: 'POV / User Model / HMW', grey: 'The Senior Engineer knows the system best,', black: ' and still gets the requirements last.' },
  { id: 'mind-mapping', label: 'Mind Mapping', grey: 'With the problem framed,', black: ' I branched out every idea for keeping requirements clear.' },
  { id: 'wireframes', label: 'Wireframes', grey: 'The flow came first,', black: ' then the screens, version after version.' },
]

// Interview participants, anonymized (role and context only). Numbered in interview order.
// ai: where they sit from "keeps AI at arm's length" (0) to "AI is my first stop" (1).
// reviews: made a point of a person checking AI output before trusting it.
export const PEOPLE = [
  {
    id: 'P1', role: 'Developer', title: 'Full-stack developer', context: 'Large company · ~1.5 yrs on the team',
    ai: 0.45, reviews: true,
    uses: 'Uses Codex in a scoped plan mode where every change needs approval, mostly for tasks that copy an existing pattern. Commits their own work first so AI changes stay in a separate diff.',
    wish: 'An AI that chats with engineers and business leaders until the requirements are fully defined, then hands them to a PM to break into tickets.',
  },
  {
    id: 'P2', role: 'Developer', title: 'Senior developer', context: '~15 yrs of experience',
    ai: 0.08, reviews: true,
    uses: 'Only ever takes small pieces of AI output, never uses it wholesale, and avoids agents editing code on their own.',
    wish: 'Would rather AI didn’t exist. Thinks a better AI workflow might mean leaving AI out of some steps on purpose, and worries new hires can’t debug what they submit.',
  },
  {
    id: 'P3', role: 'Designer', title: 'Designer / service design researcher', context: 'Runs discovery and stakeholder workshops',
    ai: 0.4, reviews: false,
    uses: '[Confirm how P3 uses AI]',
    wish: 'To be part of discovery from the start. Big multi-stakeholder workshops surface contradictory mental models that cause overruns.',
  },
  {
    id: 'P4', role: 'Developer', title: 'Senior full-stack developer', context: '16 yrs of experience',
    ai: 0.88, reviews: true,
    uses: 'AI is their first stop for both bugs and new features. Gives it past projects for context and has it explain itself step by step to catch hallucinations, then reviews everything before pushing.',
    wish: 'Access to newer AI tools than their company’s restrictions allow.',
  },
  {
    id: 'P5', role: 'PM', title: 'Product manager', context: 'Owns requirements and the roadmap',
    ai: 0.55, reviews: false,
    uses: 'Tried Figma Make for quick concepts, but worries it skips the step of finding the real problem.',
    wish: 'A fast way to prototype and test with real customers before development, and designers involved earlier.',
  },
  {
    id: 'P6', role: 'Developer', title: 'CTO / software engineer', context: 'Small company · six-person startup',
    ai: 0.8, reviews: false,
    uses: 'Builds with agentic tools like Cursor and connects their team’s research boards to them as context.',
    wish: 'A way for someone new to pick up months of research quickly, and for requirements to keep a record of how they changed.',
  },
  {
    id: 'P7', role: 'Designer', title: 'UX/UI designer', context: 'Mobile app team · lead designer, PMs and engineers',
    ai: 0.96, reviews: true,
    uses: 'Built their own AI-first workflow with Claude that pulls tasks from their tracker and works through them. Treats it almost like another peer.',
    wish: 'For the intent behind a design to survive the handoff. A ticket marked done with a Figma link still doesn’t mean the developer knows why.',
  },
]

export const HEARD = [
  { text: 'A person has to check AI’s work before anyone trusts it.', who: ['P1', 'P2', 'P4', 'P7'] },
  { text: 'Designers get pulled in after the requirements are already set.', who: ['P3', 'P5'] },
  { text: 'The why behind a decision gets lost between people.', who: ['P6', 'P7'] },
  { text: 'Two people, separately, imagined an AI that drafts requirements from conversations.', who: ['P1', 'P5'], seed: true },
]
