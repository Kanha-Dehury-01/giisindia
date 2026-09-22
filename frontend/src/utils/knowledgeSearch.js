// Client-side stand-in for the Knowledge Center search (spec §18). Ranking
// rules and field weights here are the same ones docs/ARCHITECTURE.md §L
// commits to porting into PHP + MySQL FULLTEXT search in Phase 8 (the
// FULLTEXT indexes on knowledge_content/glossary_terms in
// database/schema.sql already anticipate this) — so the RANK_WEIGHTS
// below aren't just a frontend convenience, they're the spec this data
// model's real search implementation follows.
//
// Ranking priority (spec §18, highest to lowest):
//   1. Exact title match
//   2. Keyword/tag match
//   3. Category match
//   4. Content match

import { PLACEHOLDER_COURSES } from '../data/coursesPlaceholder'
import { PLACEHOLDER_KNOWLEDGE_CONTENT } from '../data/knowledgeContentPlaceholder'
import { PLACEHOLDER_CAREERS } from '../data/careersPlaceholder'
import { PLACEHOLDER_CERTIFICATIONS } from '../data/certificationsPlaceholder'
import { PLACEHOLDER_LEARNING_PATHS } from '../data/learningPathsPlaceholder'
import { PLACEHOLDER_GLOSSARY } from '../data/glossaryPlaceholder'

export const RESULT_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'guide', label: 'Guides' },
  { value: 'concept', label: 'Concepts' },
  { value: 'career', label: 'Careers' },
  { value: 'course', label: 'Courses' },
  { value: 'certification', label: 'Certifications' },
  { value: 'learning_path', label: 'Learning Paths' },
  { value: 'glossary', label: 'Glossary' },
]

const RANK_WEIGHTS = { exactTitle: 1000, titleContains: 400, tagOrKeyword: 250, category: 100, content: 25, wordMatch: 60 }

// Query words below this length (a, of, is, the, …) are too noisy to
// score individually — they'd match almost everything.
const MIN_WORD_LENGTH = 3

function queryWords(q) {
  return q.split(/\s+/).filter((w) => w.length >= MIN_WORD_LENGTH)
}

function knowledgeContentUrlPrefix(contentType) {
  return { fundamental: 'fundamentals', domain: 'domains', technology: 'technologies', guide: 'guides', resource: 'resources' }[contentType]
}

function buildIndex() {
  const entries = []

  PLACEHOLDER_COURSES.forEach((c) =>
    entries.push({
      id: `course-${c.id}`,
      resultCategory: 'course',
      title: c.title,
      description: c.short_description,
      category: c.category,
      tags: [c.level, c.certification_name].filter(Boolean),
      content: c.long_description,
      url: `/courses/${c.slug}`,
    }),
  )

  PLACEHOLDER_KNOWLEDGE_CONTENT.forEach((k) =>
    entries.push({
      id: `knowledge-${k.id}`,
      resultCategory: k.content_type === 'guide' || k.content_type === 'resource' ? 'guide' : 'concept',
      title: k.title,
      description: k.short_description,
      category: k.category,
      tags: k.tags,
      content: k.body,
      url: `/knowledge-center/${knowledgeContentUrlPrefix(k.content_type)}/${k.slug}`,
    }),
  )

  PLACEHOLDER_CAREERS.forEach((c) =>
    entries.push({
      id: `career-${c.id}`,
      resultCategory: 'career',
      title: c.title,
      description: `Explore the ${c.title} career path.`,
      category: 'Career Paths',
      tags: [],
      content: '',
      url: `/knowledge-center/careers/${c.slug}`,
    }),
  )

  PLACEHOLDER_CERTIFICATIONS.forEach((c) =>
    entries.push({
      id: `certification-${c.id}`,
      resultCategory: 'certification',
      title: c.name,
      description: c.short_description,
      category: c.domain,
      tags: [c.level],
      content: c.body,
      url: `/certifications/${c.slug}`,
    }),
  )

  PLACEHOLDER_LEARNING_PATHS.forEach((p) =>
    entries.push({
      id: `learning-path-${p.id}`,
      resultCategory: 'learning_path',
      title: p.title,
      description: p.description,
      category: 'Learning Paths',
      tags: [],
      content: '',
      url: `/knowledge-center/learning-paths/${p.slug}`,
    }),
  )

  PLACEHOLDER_GLOSSARY.forEach((g) =>
    entries.push({
      id: `glossary-${g.id}`,
      resultCategory: 'glossary',
      title: g.term,
      description: g.definition,
      category: 'Glossary',
      tags: [],
      content: g.definition,
      url: `/knowledge-center/glossary/${g.slug}`,
    }),
  )

  return entries
}

let cachedIndex = null
function getIndex() {
  if (!cachedIndex) cachedIndex = buildIndex()
  return cachedIndex
}

function scoreEntry(entry, q) {
  const title = entry.title.toLowerCase()
  const tags = entry.tags.filter(Boolean).map((t) => t.toLowerCase())
  const words = queryWords(q)
  let score = 0

  if (title === q) {
    score += RANK_WEIGHTS.exactTitle
  } else if (title.includes(q)) {
    score += RANK_WEIGHTS.titleContains
  } else if (words.length > 0) {
    // Word-level fallback: "penetration testing" should still surface the
    // "Penetration Tester" career even though it's not a phrase match —
    // without this, results with no dedicated tags/body (careers,
    // learning paths) are nearly unfindable for anything but an exact
    // title match, which fails spec §18's "real search" bar.
    const matchedWords = words.filter((w) => title.includes(w)).length
    if (matchedWords > 0) score += RANK_WEIGHTS.wordMatch * (matchedWords / words.length)
  }

  if (tags.some((tag) => tag.includes(q) || q.includes(tag) || words.includes(tag))) {
    score += RANK_WEIGHTS.tagOrKeyword
  }
  if (entry.category?.toLowerCase().includes(q)) score += RANK_WEIGHTS.category

  const haystack = `${entry.description ?? ''} ${entry.content ?? ''}`.toLowerCase()
  if (haystack.includes(q)) {
    score += RANK_WEIGHTS.content
  } else if (words.length > 0) {
    const matchedWords = words.filter((w) => haystack.includes(w)).length
    if (matchedWords > 0) score += (RANK_WEIGHTS.content / 2) * (matchedWords / words.length)
  }

  return score
}

/** Returns ranked results for `query`, optionally narrowed to one resultCategory. */
export function searchKnowledgeCenter(query, category = 'all') {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return getIndex()
    .filter((entry) => category === 'all' || entry.resultCategory === category)
    .map((entry) => ({ ...entry, score: scoreEntry(entry, q) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function countByCategory(query) {
  const results = searchKnowledgeCenter(query, 'all')
  const counts = { all: results.length }
  RESULT_CATEGORIES.forEach((c) => {
    if (c.value !== 'all') counts[c.value] = results.filter((r) => r.resultCategory === c.value).length
  })
  return counts
}
