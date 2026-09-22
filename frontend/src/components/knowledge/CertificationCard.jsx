import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function CertificationCard({ certification }) {
  return (
    <Link
      to={`/certifications/${certification.slug}`}
      className="group flex h-full flex-col gap-2 rounded-[var(--card-radius)] border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{capitalize(certification.level)}</Badge>
        <Badge variant="outline">{certification.domain}</Badge>
      </div>
      <h3 className="text-base group-hover:text-accent">{certification.name}</h3>
      <p className="line-clamp-2 text-sm text-text-muted">{certification.short_description}</p>
    </Link>
  )
}
