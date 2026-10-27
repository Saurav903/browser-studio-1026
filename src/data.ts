export type SourceCard = {
  id: string
  title: string
  domain: string
  url: string
  type: 'Article' | 'Board' | 'Clip' | 'Note' | 'Report'
  accent: 'peach' | 'blue' | 'lime' | 'purple' | 'coral'
  savedAt: string
  note: string
  tags: string[]
  state: 'To distill' | 'Spark' | 'Kept'
  progress: number
}

export type Trail = {
  id: string
  title: string
  description: string
  color: string
  count: number
}

export const trails: Trail[] = [
  { id: 'north-star', title: 'North Star', description: 'Signals for a calmer workspace', color: '#c6dd7e', count: 8 },
  { id: 'field-kit', title: 'Field kit', description: 'Tactile systems worth borrowing', color: '#99c8eb', count: 5 },
  { id: 'sunday-studio', title: 'Sunday studio', description: 'Loose references and experiments', color: '#f5bf94', count: 12 },
]

export const seedCards: SourceCard[] = [
  {
    id: 'card-1',
    title: 'The quiet power of one good default',
    domain: 'Linear Method',
    url: 'https://example.com/defaults',
    type: 'Article',
    accent: 'peach',
    savedAt: '11 min ago',
    note: 'Less surface area; the interesting choice happens before the interface appears.',
    tags: ['interaction', 'calm'],
    state: 'To distill',
    progress: 42,
  },
  {
    id: 'card-2',
    title: 'Ambient interfaces for focused teams',
    domain: 'Notes from Field',
    url: 'https://example.com/ambient',
    type: 'Report',
    accent: 'blue',
    savedAt: '34 min ago',
    note: 'A dashboard should lower the room’s volume—not become its loudest thing.',
    tags: ['teams', 'ritual'],
    state: 'Spark',
    progress: 68,
  },
  {
    id: 'card-3',
    title: 'A library card for every decision',
    domain: 'Studio Index',
    url: 'https://example.com/library-card',
    type: 'Clip',
    accent: 'lime',
    savedAt: 'Today',
    note: 'A tiny provenance cue makes a collection feel less like a junk drawer.',
    tags: ['systems', 'archive'],
    state: 'Kept',
    progress: 100,
  },
  {
    id: 'card-4',
    title: 'Slow looking, shared meaning',
    domain: 'Are.na',
    url: 'https://example.com/slow-looking',
    type: 'Board',
    accent: 'purple',
    savedAt: 'Yesterday',
    note: 'The artifact is the conversation around the link, not the link alone.',
    tags: ['research', 'craft'],
    state: 'Spark',
    progress: 79,
  },
  {
    id: 'card-5',
    title: 'Make room for the unfinished',
    domain: 'Personal note',
    url: '#note',
    type: 'Note',
    accent: 'coral',
    savedAt: 'Oct 24',
    note: 'A gentle holding space gives ideas permission to be useful later.',
    tags: ['practice'],
    state: 'To distill',
    progress: 28,
  },
]

export const activity = [
  { time: '09:42', text: 'You added 3 signals from your morning tabs.' },
  { time: 'Yesterday', text: '“Slow looking” became a Spark.' },
  { time: 'Fri', text: 'North Star moved from a pile to a trail.' },
]

export const demoTabTitles = [
  { title: 'Designing for calm attention', url: 'https://designnotes.example/calm-attention' },
  { title: 'Field guide: useful constraints', url: 'https://fieldguide.example/constraints' },
  { title: 'Browser Studio 1026 — trail map', url: 'https://studio.example/trail-map' },
]
