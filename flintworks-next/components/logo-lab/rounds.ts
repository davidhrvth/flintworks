import { FINAL_CONCEPT } from './final-mark'
import { ROUND_1, type Concept } from './marks'
import { ROUND_2 } from './marks-r2'
import type { WordmarkKey } from './wordmarks'

export type Round = {
  id: string
  /** 'final' rounds refine one chosen mark instead of comparing concepts. */
  kind?: 'final'
  title: string
  intro: string
  /** What the previous round's feedback said, and what this round does about it. */
  heard?: { said: string; did: string }[]
  concepts: Concept[]
  wordmarks: WordmarkKey[]
  storageKey: string
}

export const ROUNDS: Round[] = [
  {
    id: '01',
    title: 'Finding the mark.',
    intro:
      'Eight directions, deliberately far apart. Don’t judge the polish yet — look for the one you keep coming back to.',
    concepts: ROUND_1,
    wordmarks: ['wide', 'dot', 'unbounded', 'split', 'editorial', 'terminal'],
    storageKey: 'flintworks_logo_lab_r1',
  },
  {
    id: '02',
    title: 'The shard family.',
    intro:
      'Everything here grows out of 02 Strike and 03 Knapped, pushed toward the kind of mark you named — one silhouette, one idea, works in one colour — with more “we build software” in every one.',
    heard: [
      { said: '♥ 02 Strike, 03 Knapped', did: 'Every mark is now a flint shard. Two are straight refinements of your picks.' },
      { said: 'Nike · Apple · Playboy · Spotify', did: 'Single bold silhouettes with one twist. Check each one in One-colour — that’s the real test.' },
      { said: '06 “not techy”', did: 'Tech cues built in: angle brackets, a hexagon, a mouse cursor.' },
      { said: '✕ 01, 05 · 08 “cool but weird”', did: 'Spirals, tiles and scanlines are gone.' },
      { said: 'Type: A, C, F', did: 'Kept those three, plus a sibling each for C and F.' },
    ],
    concepts: ROUND_2,
    wordmarks: ['wide', 'unbounded', 'unbounded-caps', 'terminal', 'tag'],
    storageKey: 'flintworks_logo_lab_r2',
  },
  {
    id: '03',
    kind: 'final',
    title: 'The mark, in motion.',
    intro:
      'Knapped it is. Three calls left: which way to write the name, how the logo moves, and the badge that sits on every client site you ship.',
    heard: [
      { said: '“Go with the knapped one”', did: 'Locked in Knapped II. The facet gaps are now real geometry instead of a mask — clean for print, export and animation.' },
      { said: '“Can’t decide between A and F”', did: 'Head-to-head below, on the same surfaces. Both are now outlined vector letters, not live fonts.' },
      { said: '“I want a logo animation”', did: 'Three intros to pick from, each ending with the name writing itself.' },
      { said: 'Hover badge for client sites (HTML + CSS only)', did: 'A copy-paste snippet — no JavaScript, no fonts, no requests. Mark only, spells out Flintworks on hover, links to your quote page.' },
    ],
    concepts: [FINAL_CONCEPT],
    wordmarks: ['wide', 'terminal'],
    storageKey: 'flintworks_logo_lab_r3',
  },
]
