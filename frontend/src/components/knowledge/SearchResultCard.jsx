import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

const CATEGORY_LABELS = {
  guide: 'Guide',
  concept: 'Concept',
  career: 'Career Path',
  course: 'Course',
  certification: 'Certification',
  learning_path: 'Learning Path',
  glossary: 'Glossary',
}

export default function SearchResultCard({ result }) {
  return (
    <Link
      to={result.url}
      className="group flex flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <Badge variant="outline">{CATEGORY_LABELS[result.resultCategory] ?? result.resultCategory}</Badge>
      <h3 className="text-base group-hover:text-accent">{result.title}</h3>
      {result.description && <p className="line-clamp-2 text-sm text-text-muted">{result.description}</p>}
    </Link>
  )
}
