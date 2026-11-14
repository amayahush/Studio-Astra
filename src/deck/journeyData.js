// From my final User Journey Map in Figma ("User Journey Map · Final").
// Pain point codes link back to my thematic analysis tags.

export const FOCUS = 4 // index of phase 05, my prototype focus

export const PHASES = [
  {
    n: '01', name: 'Request arrives', lead: ['VP / business leader', 'PM'],
    goal: 'Turn a leader’s ask into a real problem worth solving',
    happens: ['Leader asks a PM for a change, often ASAP', 'PM says yes and starts scoping', 'Deadline is set before the problem is defined'],
    pain: [['Requests arrive as orders, not problems', 'O3'], ['Schedule pressure starts work before requirements settle', 'O1'], ['The people who know the need sit several steps from the builders', 'O3']],
    said: [['In the past, it’s sometimes been more like taking an order.', 'P5 · PM'], ['A lot of times a business leader comes straight to a PM and says, ‘We need this change in this application ASAP.’', 'P1 · Developer']],
    works: [['PM distills the ask down to the true problem before solutioning', 'P5']],
    feel: 'Pressured', y: 0.62,
    opp: 'Capture the ask with its problem, goal, and deadline at intake, with the source attached',
    themes: ['T1', 'T2'], touch: ['Outlook', 'Teams', 'Meetings'],
  },
  {
    n: '02', name: 'Discover and define', lead: ['PM', 'Designer', 'Customers / SMEs'],
    goal: 'Find the true need before anything gets built',
    happens: ['Designer designs to get requirements', 'Customer walkthroughs and quick prototypes', 'PM reconciles conflicting stakeholder input'],
    pain: [['Needs only surface once people see something', 'O2'], ['Stakeholders contradict each other', 'C4'], ['Discovery gets skipped or rushed under deadlines', 'O1']],
    said: [['We don’t start with requirements. We are designing to get requirements.', 'P3 · Designer'], ['…oftentimes they don’t know exactly what they want until they see it.', 'P1 · Developer']],
    works: [['Figma Make mockups to get early buy-in', 'P5'], ['Two-day fail-fast design cycles with customers', 'P3']],
    feel: 'Engaged, unsure', y: 0.4,
    opp: 'Draft the PRD from kickoff and customer sessions; tag each requirement AI drafted, PM edited, or approved',
    themes: ['T1', 'T4'], touch: ['Figma', 'Figma Make', 'Word docs', 'Customer calls'],
  },
  {
    n: '03', name: 'Hand off to build', lead: ['PM / Designer', 'Developer'],
    goal: 'Give devs what they need to build the right thing',
    happens: ['PM breaks features into Jira stories', 'Designer walks dev through the file', 'Dev reviews tickets, designs, and data schema', 'Dev flags what looks infeasible'],
    pain: [['The why behind a requirement gets lost', 'H1'], ['Handoff is one-way; dev joins late', 'H4'], ['Non-technical stakeholders underestimate complexity', 'H2']],
    said: [['A lot of times they had two-thirds of the puzzle and were missing the last piece.', 'P7 · Designer'], ['…there’s not a lot of back-and-forth. I usually take what they have…', 'P4 · Developer']],
    works: [['Standing 30-minute Q&A slots for dev questions', 'P3'], ['Tickets that state what, why, and acceptance criteria', 'P7']],
    feel: 'Unclear', y: 0.62,
    opp: 'One PRD with a slice per role; every requirement keeps its reason and source link',
    themes: ['T2', 'T3'], touch: ['Jira', 'Figma Dev Mode', 'Handoff meeting', 'Teams'],
  },
  {
    n: '04', name: 'Build with AI', lead: ['Developer'],
    goal: 'Ship working code fast without losing control of it',
    happens: ['Dev scopes AI to known patterns and files', 'Plans with AI, then reviews every change', 'Waits on a human code review'],
    pain: [['Loose requirements leave AI without context', 'A1'], ['No one owns AI-written code; review is a bottleneck', 'A3'], ['Only approved, older AI tools allowed (parked)', 'X1']],
    said: [['I feel like Codex works best when it has a pattern to follow.', 'P1 · Developer'], ['…the blame doesn’t get pointed at an AI. It’s pointed at us.', 'P2 · Developer']],
    works: [['Commit own work first so AI changes stay separate', 'P1'], ['Ask AI to explain its fix step by step', 'P4']],
    feel: 'Confident when scoped', y: 0.0,
    opp: 'The approved PRD gives AI defined context; people define and verify, AI executes',
    themes: ['T4'], touch: ['Codex', 'VS Code', 'GitHub', 'Jira'],
  },
  {
    n: '05', name: 'Something changes mid-build', lead: ['Whoever learns it', 'PM decides'],
    goal: 'Agree on the change and get it to everyone affected',
    happens: ['Dev hits a limit or a customer gives new input', 'Tradeoffs get negotiated in a meeting or side by side', 'The decision lives in someone’s head, an email, or chat', 'Others keep building on the old version'],
    pain: [['Feasibility forces tradeoffs; someone has to lose', 'C2'], ['Decisions never get written back to the tracker', 'H3'], ['Late changes cause rework', 'C1']],
    said: [['…it’s easy to just talk to someone and not translate that knowledge back into Asana so the PM knows.', 'P7 · Designer'], ['Right now it lives in emails, PowerPoints, Word docs, and some of it in Jira.', 'P5 · PM']],
    works: [['Talking it through side by side', 'P7'], ['Marking unfinished items in the design file', 'P3']],
    feel: 'Frustrated', y: 1.0,
    opp: 'Propose a change with reason and source; it shows as pending, “don’t build yet,” in every slice; owners get a heads-up; the PM finalizes',
    themes: ['T1', 'T2', 'T3'], touch: ['Teams', 'Email', 'Jira', 'Figma'],
  },
  {
    n: '06', name: 'Deliver and realign', lead: ['Developer', 'PM', 'Customers'],
    goal: 'Ship what was actually needed and keep stakeholders informed',
    happens: ['Code moves to test, then production', 'PM reports status and delays', 'Customers react after launch'],
    pain: [['Status and delays are hard to track and share', 'C3'], ['The product misses the mark after delivery', 'C1'], ['User feedback comes after launch, not before', 'O2']],
    said: [['Then when we deliver the product, it doesn’t hit home as much as I think it could.', 'P5 · PM'], ['…it’s the feedback loop from users early, instead of after.', 'P5 · PM']],
    works: [['Peer review before merge', 'P1 · P4']],
    feel: 'Mixed', y: 0.4,
    opp: 'Version history shows what changed and why; status stays visible in every slice',
    themes: ['T1', 'T3'], touch: ['GitHub', 'Jira', 'Teams', 'Outlook'],
  },
]

// Draft, in my voice: what the journey map taught me
export const LEARNED = [
  'The low point comes mid-build, when something changes after building has already started.',
  'Teams already handle the change itself well: they talk it through side by side. What breaks is everything after, because the decision stays in someone’s head, an email or a chat while others keep building on the old version.',
  'So my prototype starts here. A change gets proposed with its reason and source, shows as pending in every role’s view, and the PM makes the final call.',
]
