// Every artifact I made along the way (final versions). Shown in the panel when presentation mode is off.
// img: file name in /public/archive (full size .webp plus a -thumb.webp). card: the deck card it links to.
const H = (t) => ({ h: t })
const P = (t) => ({ p: t })
const R = (segs) => ({ r: segs })
// a heading that starts a highlighted section (same purple callout as a final statement)
const HL = (t, label) => ({ h: t, hl: label })
// an item tabbed under the one above it
const SUB = (t, c) => ({ i: t, c: c || '', badge: '', url: '', more: null, sub: true })
const S = (t, label) => ({ s: t, label, c: 'kept' })
const I = (t, c, badge, url, more) => ({ i: t, c: c || '', badge: badge || '', url: url || '', more: more || null })

export const DOCS = {
  guide: { eyebrow: 'Interview guide', title: 'My interview guides', tabs: [
    { label: 'Developer guide', blocks: [
      P('I added an intro and consent script and grouped questions by goal. The AI section branches for people who use AI and people who don’t.'),
      H('Warm-up · role and day-to-day'),
      I('Can you describe your role and a bit of background on how you got here?'),
      I('Can you walk me through your day yesterday?'),
      H('Workflow · process and tools'),
      I('Can you describe your typical workflow for completing a project, from initial ticket to completion?'),
      I('What are some of the challenges you face within your workflow?'),
      I('What tools do you typically use within your workflow, and why?'),
      H('Collaboration · who is involved'),
      I('Can you describe the different stakeholders in your process and how they contribute?'),
      I('Do designers or PMs shape your day-to-day work? If so, where do they show up?'),
      H('AI · if they use it'),
      I('Can you walk me through the last time you used an AI tool? What were you doing right before, and right after?'),
      I('What part of the workflow do you feel confident should stay manual?'),
      H('Closing · magic wand'),
      I('If you could change anything about your current process, what would it be and why?')
    ]},
    { label: 'Designer, PM & story guides', blocks: [
      P('Developers kept naming designers and PMs, so I wrote guides for them. Later, with my research partner, I tried a story-based guide.'),
      H('Designer guide'),
      I('Where does your work start, and where does it “hand off” to someone else?'),
      I('At what point does engineering enter the picture? How early or late is that, ideally vs. in reality?'),
      I('What tools do you use to communicate design intent to engineers?'),
      H('PM guide'),
      P('My goal: understand how initial requirements come into play, and who figures out the need for a product.'),
      I('Think about the last new project that came onto your plate. How did it actually start?'),
      I('When you’re figuring out what a project should be, who do you go to?'),
      I('Once you’ve got that clarity, how does it get from you to the people building it?'),
      H('Story-based guide (P7)'),
      I('Tell me about the last thing you worked on that went from an idea to something built.', 'kept'),
      P('With follow-ups whenever a change comes up.')
    ]}
  ]},
  secondary: { eyebrow: 'Secondary research', title: 'Filling in what one organization couldn’t show me', blocks: [
    P('Context on Codex workflows, data schemas and spec-driven development.'),
    H('Sources'),
    I('What do software engineers do on a daily basis?', '', '', 'https://www.linkedin.com/pulse/what-do-software-engineers-daily-basis-duckki-oe/', [
      'Work gets split into issues small enough to finish in under a week. Each issue holds the problem, the plan, progress updates and how to test it.',
      'The goal is that anyone reading a finished issue can tell what was done and how to test it, so the tracker is meant to be the record.',
      'Ideas and decisions still live across wikis, Google Docs, Slack, email and meetings. The record is spread across tools, like my interviewees described.'
    ]),
    I('Effective Software Development Workflow: From Idea to Delivery', '', '', 'https://dev.to/ifechukwuobiezue/effective-software-development-workflow-from-idea-to-delivery-47d8', [
      'The textbook flow runs in order: ideation, requirements, design, development, testing, deployment, maintenance. Requirements get gathered and approved before design starts.',
      'It barely covers requirements changing midway. New requests go into a backlog for the product owner to prioritize next sprint.',
      'Requirement documents are meant to be shared references that stay current. That one-way flow is what my ecosystem map showed before I added the loop.'
    ]),
    I('How I AI: 3 Advanced Codex Workflows for Faster, Smarter Development with OpenAI’s Alex Embiricos', '', '', 'https://chatprd.ai/how-i-ai/advanced-codex-workflows-with-openai-alex-embiricos', [
      'Orient before changing anything: ask Codex how the project runs and where the behavior lives.',
      'For bigger work, write a plan with verification steps first (a Plans.md file), revise it, then build from the approved plan.',
      'Keep something reviewable at every step: a diff, a separate branch, the plan file or a PR comment. The person stays in control of the decisions.'
    ]),
    I('A Practical Path to Spec-Driven Development with Codex', '', '', 'https://mmarcosab.medium.com/a-practical-path-to-spec-driven-development-with-codex-a3cec3ef554a', [
      'The spec is the source of truth. A change goes into the spec first, the agent updates the code, then a person reviews it.',
      'Specs need acceptance criteria. Vague specs like “create a payment system” produce fragile projects.',
      'Code can drift from the spec without anyone noticing: a review agent caught a field that wasn’t in the spec. A spec only works if it stays current.'
    ])
  ]},
  reframe: { eyebrow: 'Reframing the problem', title: 'Keeping requirements clear as they evolve', blocks: [
    P('My themes showed the problem was not a bad PRD at the start. Requirements keep changing, and the shared record falls behind.'),
    S('Requirements emerge through conversations and iteration across many roles, but the shared record lags behind the decisions. Spec-driven development depends on that record being current.', 'Final problem statement'),
    H('What I updated to match'),
    I('Stakeholder map: PM and designer moved to direct influence; developers to mild, marked as most affected. The PM and designer control the record. Developers feel the lag but don’t control it.'),
    I('Ecosystem map: added a loop from deploy back to identifying needs, and where decisions actually live. Requirements change mid-build (P1, P3, P5).'),
    I('Spec-driven link: no participant used spec-driven development, so I framed it as a consequence, not something I observed.')
  ]},
  pov: { eyebrow: 'POV', title: 'My problem statement', blocks: [
    R([['Senior software developers', 'user'], [' need a way to ', ''], ['trust that the requirements in front of them are grounded in a validated problem', 'need'], [', because ', ''], ['building on an unvalidated assumption wastes implementation time, delays delivery, and erodes confidence that the next set of requirements will hold up either.', 'insight']])
  ]},
  hmw: { eyebrow: 'How might we', title: 'The questions I designed around', blocks: [
      S('How might we keep everyone aligned when requirements change mid-process?', 'My main How Might We'),
      P('Supporting questions under it. How might we…'),
      SUB('help stakeholders and developers arrive at “complete enough” requirements without slowing down iteration?', 'kept'),
      SUB('structure a shared requirements artifact so it also works as reusable context for developers working with AI agents?', 'kept'),
      SUB('give non-technical stakeholders a lightweight way to see technical feasibility early?'),
      SUB('make sure early product decisions reflect both design and engineering judgment?'),
      SUB('build trust that developers and designers are building for the correct customer problem?')
    ]},
  stories: { eyebrow: 'User story', title: 'The senior developer', blocks: [
      H('The need'),
      P('The senior software engineer needs a way to easily access and make changes to the requirements and specs, to understand the project scope so they can work spec-driven, align feasibility with stakeholders, and have a proper source of truth for documentation and future AI context.'),
      H('The problem today'),
      P('The current inability to do this is causing large reworks later in the process, and a lack of cohesive documentation makes it hard to scale similar products and give AI proper context.'),
      H('The value'),
      P('Enabling this would add measurable value by reducing costly late-stage reworks and shortening the overall build cycle.')
    ]},
  comp: { eyebrow: 'Competitive analysis', title: 'What existing tools already cover', blocks: [
    P('I rated seven tools on what my interviewees asked for, using each product’s own public pages (Nov 2026).'),
    H('Turns conversations into requirements'),
    I('Documented: Jira + Confluence with Rovo, Notion AI, Productboard Spark, Brief'),
    I('Partly: Kiro / Spec Kit, Augment Intent · Not found: Jama Connect', 'gray'),
    H('One shared place the whole team reads'),
    I('Documented: Jira + Confluence, Notion AI, Productboard Spark, Jama Connect'),
    I('Partly: Kiro / Spec Kit, Augment Intent, Brief', 'gray'),
    H('Gives coding agents defined context'),
    I('Documented: Jira + Confluence, Productboard Spark, Kiro / Spec Kit, Augment Intent, Brief, Jama Connect'),
    I('Not found: Notion AI', 'gray'),
    H('Keeps the spec current when something changes mid-build'),
    I('Documented: Augment Intent, Jama Connect'),
    I('Partly: Notion AI, Kiro / Spec Kit, Brief · Not found: Jira + Confluence, Productboard', 'gray'),
    HL('Shows a pending change to every role before anyone builds on it, and a PM approves it', 'The gap'),
    I('Documented: none of the seven', 'kept'),
    I('Partly: Jira + Confluence, Notion AI, Kiro / Spec Kit, Jama Connect · Not found: Productboard, Augment Intent, Brief', 'gray')
  ]},
  test: { eyebrow: 'Usability test', title: 'Testing Astra with three people', tabs: [
   { label: 'Test and findings', blocks: [
    P('A moderated, task-based test with think-aloud. Each task puts the participant in a different role. I scored each step with the cognitive walkthrough’s four questions.'),
    H('Tasks'),
    I('You’re the engineer. Something in the requirements needs to change. Send a message to Dana, the PM, asking her to update the PRD.'),
    I('Using Astra’s map, find R4 on LAB-E1 and tell me what happened on October 1st at 4:00 PM.'),
    I('You’re the designer. There’s a pending change to the PRD. Review and accept it, then update the Figma screens to match.'),
    H('What I saw · three sessions, Nov 2026'),
    I('The Map stood out as the strongest feature, the part to highlight.', 'kept'),
    I('The designer flow felt too simple.'),
    I('The most confusing moment: what travels where on the map.'),
    I('One tester didn’t realize Astra lives inside Codex.'),
    I('On the timeline, empty stretches should jump to the next event.'),
    I('After choosing a role, show which scenario you’re in.')
   ]},
   { label: 'What I changed', blocks: [
    H('Navigation and orientation'),
    I('Added a home icon to the top nav that takes you back to the scenario picker. P2 used Codex’s own home icon instead of Astra’s.'),
    I('The current scenario’s name now shows in the nav. P2 picked PM when they meant to pick Designer and couldn’t tell which scenario they were in.'),
    I('The time skip and end cards now say they’re part of the scenario, so testers don’t mistake them for the platform. This came from P2’s note about the time change.'),
    I('Scenario cards are styled differently from Astra, and they keep their own buttons in every tool and in light mode.'),
    H('Task 1 (messaging Dana)'),
    I('Dana now appears under “Linked to R4”. P1 looked for her among the participants, didn’t find her, and assumed they were in the wrong place.'),
    I('The submit summary can now be collapsed. P2 spent a long time reading everything before they clicked Propose change.'),
    H('Task 2 (the Map)'),
    I('Connectors have arrowheads that show the flow from source to requirement to work. P1 wanted to see where a requirement came from and which way it traveled.'),
    I('Records that lag behind a decision are drawn dashed, and the tape shows a band for how long each record was out of date. This answers P1’s question of how to show that something is outdated.'),
    I('During an event, people who aren’t involved fade back. P2 said the map should only show major changes.'),
    I('Hovering on the timeline now shows a short preview, and the callout gives the full account with the actor. P3 needed the full explanation on the card within the map.'),
    I('At Live, the Play button reads “Replay from Sep 24” so the jump back in time is announced. There’s also a scope chip showing which requirement and epic the tape covers.'),
    I('The Live callout was removed. At Live, the transport shows only the epic and requirement chip.'),
    I('Show insights based on patterns identified on the epic level, where users can drill down to the spec level for specifics.'),
    H('Polish (not from test feedback)'),
    I('Fixed light-mode button colors and the text on the “Starts in Figma” chip.'),
    I('Cleaned up Map card borders and highlight strokes.')
   ]}
  ]}
};


export const GROUPS = [
  { name: 'Research · Aug to Oct', items: [
    { id: 'guide', kind: 'doc', title: 'Interview guides', meta: 'Developer, designer, PM and story-based', takeaway: 'Each change came from what I was hearing, or from who I was about to talk to next.' },
    { id: 'interviews', kind: 'img', dark: true, img: 'interviews', title: 'Interviews', meta: '8 interviews', card: 'interviews', takeaway: 'Developers kept naming the designers and PMs they depend on, so I talked to them too.' },
    { id: 'secondary', kind: 'doc', title: 'Secondary research', meta: 'Codex, data schemas, spec-driven dev', takeaway: 'It filled in context I couldn’t get from one organization.' }
  ]},
  { name: 'Mapping the service · Aug 31 to Sep 11', items: [
    { id: 'stake', kind: 'img', explore: 'stake', dark: true, img: 'stake', title: 'Stakeholder map', meta: 'Influence over the requirements record', takeaway: 'The PM and designer control the record. Developers feel the lag but don’t control it.' },
    { id: 'eco', kind: 'img', explore: 'eco', dark: true, img: 'eco', title: 'Ecosystem map', meta: 'Four phases with a loop back', card: 'ecosystem-map', takeaway: 'The four phases read as one-way, but requirements change mid-build, so I added a loop from deploy back to identifying needs.' },
    { id: 'blueprint', kind: 'img', explore: 'blueprint', img: 'blueprint', title: 'Service blueprint', meta: 'Six phases, frontstage to backstage', takeaway: 'Its last opportunity became the heart of Astra: show how a requirement change ripples to design and code before it’s approved.' }
  ]},
  { name: 'Synthesis · Sep 11 to Oct 3', items: [
    { id: 'themes', kind: 'img', explore: 'thematic', img: 'themes', title: 'Thematic analysis', meta: 'Four themes, quotes and codes', card: 'thematic-analysis', takeaway: 'I went back and coded every transcript so my themes came from all eight interviews, not just the ones I remembered best.' },
    { id: 'reframe', kind: 'doc', title: 'Reframing the problem', meta: 'Final center statement', takeaway: 'The problem wasn’t a bad PRD at the start. Requirements keep changing, and the shared record falls behind.' },
    { id: 'journey', kind: 'img', explore: 'journey', img: 'journey', title: 'Journey map', meta: 'Six phases, ask to release', card: 'journey-map', takeaway: 'The low point comes mid-build, when something changes after building has already started.' },
    { id: 'comp', kind: 'doc', title: 'Competitive analysis', meta: '7 tools compared', card: 'competitive-analysis', takeaway: 'Most of the pieces already exist. What’s missing is the moment a requirement changes mid-build.' }
  ]},
  { name: 'Framing the problem', items: [
    { id: 'pov', kind: 'doc', title: 'POV', meta: 'My problem statement', card: 'pov-user-model-hmw', takeaway: 'The senior engineer knows the system best, and still gets the requirements last.' },
    { id: 'hmw', kind: 'doc', title: 'How might we', meta: 'Final set of questions', takeaway: 'Keep iteration alive instead of forcing a rigid waterfall.' },
    { id: 'stories', kind: 'doc', title: 'User story', meta: 'Senior developer', takeaway: 'The developer wants to share feasibility early and get settled requirements, so building doesn’t turn into large reworks later.' },
    { id: 'mind', kind: 'img', explore: 'mind', dark: true, img: 'mind', title: 'Mind map', meta: 'Themes, pains and ideas', card: 'mind-mapping', takeaway: 'What I carried into Astra: a living PRD with change and drift alerts, and a drafting tool that listens to conversations.' }
  ]},
  { name: 'Designing Astra', items: [
    { id: 'flowfinal', kind: 'img', img: 'flowfinal', title: 'User flow', meta: 'Full flow, and how I scoped the prototype', takeaway: 'Flow 1 starts from a VP request. Flow 2 picks up mid-build, when someone learns something new and proposes a change.',
      views: [
        { label: 'Full flow', img: 'flowfinal', explore: 'flowfull', takeaway: 'Flow 1 starts from a VP request. Flow 2 picks up mid-build, when someone learns something new and proposes a change.' },
        { label: 'How I scoped the prototype', img: 'flow', explore: 'flowscope', takeaway: 'Anyone can propose a change. Only the PM finalizes it.' }
      ] },
    { id: 'high', kind: 'img', dark: true, img: 'high', title: 'Wireframes', meta: 'Low-fi to high-fi, three rounds', card: 'wireframes', takeaway: 'Built around one scenario: the PRD says the dashboard refreshes every 15 minutes, but the data only updates once an hour.',
      views: [
        { label: 'Low-fi', img: 'low', takeaway: 'A developer notices a mismatch, attaches the code as evidence, and the PM validates or denies the change.' },
        { label: 'Mid-fi', img: 'mid2', takeaway: 'A fuller version wired into Jira, GitLab, Figma and Teams, so the PRD stays connected to where the work happens.' },
        { label: 'High-fi', img: 'high', takeaway: 'Built around one scenario: the PRD says the dashboard refreshes every 15 minutes, but the data only updates once an hour.' }
      ], startView: 2 }
  ]},
  { name: 'Testing · Nov 2026', items: [
    { id: 'test', kind: 'doc', title: 'Usability test', meta: 'Think-aloud · three tasks', takeaway: 'Testers called the Map the strongest part and the designer flow too simple. The confusing part was what moves where on the map.' }
  ]}
];

