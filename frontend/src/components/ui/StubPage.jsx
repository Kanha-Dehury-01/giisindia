import PageHeader from './PageHeader'
import Breadcrumbs from './Breadcrumbs'
import { useSeo } from '../../hooks/useSeo'

/**
 * Shared shell for pages whose full content template lands in a later
 * phase (Phases 4-6). Wires up breadcrumbs, an H1, and basic SEO now so
 * routing/IA can be reviewed before the real page design exists — replaced
 * section-by-section as each phase implements its route, not rewritten
 * wholesale.
 */
export default function StubPage({ eyebrow, title, description, breadcrumbs, phaseNote }) {
  useSeo({ title: `${title} | GIIS India`, description })

  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      {phaseNote && (
        <div className="container py-10">
          <p className="rounded-md border border-dashed border-border bg-surface-muted p-4 text-sm text-text-muted">
            {phaseNote}
          </p>
        </div>
      )}
    </div>
  )
}
