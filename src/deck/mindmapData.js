// My revised mind map (Figma "Mind Map Revised", node 386:798), regrouped by theme.
// kind: pain = pain point, work = current workaround, idea = potential solution, core = core concept
// sub items hang off the item before them.

export const GOAL = 'Keep everyone aligned with proper documentation and a source of truth as requirements emerge and change, so devs can do spec-driven code'

export const THEMES = [
  {
    id: 're', tag: 'T1 + T3', label: 'Requirements evolve / change', x: 500, y: 95, focus: true,
    items: [
      { kind: 'pain', text: 'Nothing captures & flags when work drifts from initial requirements' },
      { kind: 'pain', text: 'Leadership changes shift priorities & metrics' },
      { kind: 'idea', text: 'Living PRD: change & drift alerts', subs: [
        'Live document stays updated as work evolves',
        'Notifications when requirements change',
        'Jira / GitHub sync flags drift automatically',
        'Agent flags stakeholders of risks when requirements change',
      ] },
    ],
  },
  {
    id: 't2', tag: 'T2', label: 'Fragmented collaboration across roles & teams', x: 175, y: 175,
    items: [
      { kind: 'pain', text: 'PMs & micro-teams work in silos' },
      { kind: 'pain', text: 'No consistent entry point for design', subs: [
        'PM hands set requirements to design',
        'Design skipped; dev starts first, causing rework',
      ] },
      { kind: 'pain', text: 'Dev enters at handoff, not during design', subs: [
        'The why behind a requirement gets lost at handoff',
        'Feasibility / constraints are not visible early',
      ] },
      { kind: 'pain', text: 'Non-technical stakeholders underestimate complexity' },
      { kind: 'pain', text: 'Schedule pressure pushes dev to start early' },
      { kind: 'pain', text: 'PMs are overallocated' },
      { kind: 'idea', text: 'Visibility into design / code across all stakeholders (video playback or documentation help). Outcome: builds stakeholder trust' },
    ],
  },
  {
    id: 't1', tag: 'T1', label: 'Discovering the real problem', x: 175, y: 445, note: 'Covered in my full user flow, not the prototype',
    items: [
      { kind: 'pain', text: 'Customers don’t know what they want until they see / use it' },
      { kind: 'pain', text: 'Stakeholders contradict each other' },
      { kind: 'pain', text: 'Validation happens after launch, with proxies instead of end users', subs: ['Idea: customer walkthroughs validate direction early'] },
      { kind: 'pain', text: 'Customer discovery happens inconsistently', subs: ['Idea: early user research & designer involvement'] },
      { kind: 'work', text: 'Designers run discovery by default, designing to get requirements (because PMs are overallocated)' },
      { kind: 'work', text: 'Figma Make mockups to get early buy-in' },
    ],
  },
  {
    id: 't3', tag: 'T3', label: 'No single source of truth', x: 825, y: 175, focus: true,
    items: [
      { kind: 'pain', text: 'Requirements scattered across email, Teams, PPTs & Jira' },
      { kind: 'pain', text: 'Hard to track feature status & communicate delays' },
      { kind: 'core', text: 'PRD drafting tool listens to conversations or transcripts', subs: ['Capture customer problem & success metrics'] },
    ],
  },
  {
    id: 't4', tag: 'T4', label: 'AI tools need context to be useful', x: 825, y: 445,
    items: [
      { kind: 'pain', text: 'Vague requirements limit what AI can do', subs: [
        'Idea: better context for AI tools when a PRD exists',
        'Idea: ongoing repository recognizes patterns & builds context for AI',
      ] },
      { kind: 'pain', text: 'Restricted AI tools & privacy concerns' },
      { kind: 'pain', text: 'AI code nobody fully owns; human review is a bottleneck' },
      { kind: 'work', text: 'Scope AI to one file & commit its changes separately' },
    ],
  },
]

// the yellow dashed "cross-theme cause" links, in the order they read as a chain
export const CAUSES = [
  { from: 't2', to: 't1', label: 'schedule pressure skips discovery & validation', d: 'M 120 203 C 92 280, 92 340, 120 417', lx: 175, ly: 310 },
  { from: 't2', to: 're', label: 'dev starts before design → rework', d: 'M 210 147 C 230 95, 300 95, 398 95', lx: 280, ly: 90 },
  { from: 't1', to: 're', label: 'needs only surface once people see something', d: 'M 262 418 C 330 380, 300 170, 430 119', lx: 330, ly: 372 },
  { from: 're', to: 't3', label: 'changes scatter across channels', d: 'M 602 95 C 720 95, 800 100, 818 147', lx: 712, ly: 90 },
  { from: 't3', to: 't4', label: 'scattered input limits AI & review', d: 'M 880 203 C 908 280, 908 340, 880 417', lx: 825, ly: 310 },
]

// the ideas on my focus branches that I carried into Astra
export const TAKEN = [
  { from: 'Requirements evolve', text: 'Living PRD with change & drift alerts' },
  { from: 'No single source of truth', text: 'PRD drafting tool that listens to conversations' },
]
