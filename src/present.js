// Presentation mode: the condensed 8-minute talk.
// Cards marked skip stay on the site but are grayed out and passed over by clicks and arrow keys.
// label / caption are the plain-language versions shown while presenting; the method name stays small.
export const PRESENT = {
  interviews: { num: 1, label: 'Who I talked to', caption: '8 people who build software, and how they use (or avoid) AI' },
  'thematic-analysis': { num: 2, label: 'What they told me', caption: 'Four patterns across everything I heard' },
  'ecosystem-map': { skip: true, label: 'Who’s involved', caption: 'Everyone a single requirement passes through' },
  'journey-map': { num: 3, label: 'Where it breaks', caption: 'Following one requirement from ask to release' },
  'competitive-analysis': { num: 4, label: 'What’s already out there', caption: 'The gap today’s AI tools leave open' },
  'pov-user-model-hmw': { num: 5, label: 'Who I designed for', caption: 'The senior engineer knows the most and hears last' },
  'mind-mapping': { skip: true, label: 'Ideas I explored', caption: 'Every idea for keeping requirements clear' },
  wireframes: { skip: true, label: 'Screen versions', caption: 'From user flow to screens' },
}

// The method name each card is known by on the full site (shown small while presenting).
export const METHOD = {
  interviews: 'Interviews',
  'thematic-analysis': 'Thematic analysis',
  'ecosystem-map': 'Ecosystem map',
  'journey-map': 'Journey map',
  'competitive-analysis': 'Competitive analysis',
  'pov-user-model-hmw': 'Problem + design question',
  'mind-mapping': 'Mind map',
  wireframes: 'Wireframes',
}
