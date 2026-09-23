import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { coursesAdminApi, knowledgeAdminApi, enquiriesAdminApi } from '../../api/admin'
import { RESOURCE_CONFIGS } from '../../admin/resources.config'

const QUICK_LINKS = [
  { label: 'Add a Course', to: '/admin/courses/new', permission: 'courses.manage' },
  { label: 'Add Knowledge Article', to: '/admin/knowledge/new', permission: 'knowledge.manage' },
  { label: 'Review New Enquiries', to: '/admin/enquiries?status=new', permission: 'enquiries.view' },
  { label: 'Upload Media', to: '/admin/media', permission: 'media.upload' },
]

/** Overview widgets — quick counts + shortcuts (spec §26 dashboard requirement) so nothing needs a click-through just to see "is anything new?" */
export default function Dashboard() {
  const { user, hasPermission } = useAuth()
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      coursesAdminApi.list({ per_page: 1 }),
      knowledgeAdminApi.list({ per_page: 1 }),
      enquiriesAdminApi.list({ per_page: 1, status: 'new' }),
    ]).then(([courses, knowledge, newEnquiries]) => {
      setCounts({
        courses: courses.status === 'fulfilled' ? courses.value.meta?.total : null,
        knowledge: knowledge.status === 'fulfilled' ? knowledge.value.meta?.total : null,
        newEnquiries: newEnquiries.status === 'fulfilled' ? newEnquiries.value.meta?.total : null,
      })
    })
  }, [])

  return (
    <div>
      <h1 className="text-xl">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="mt-2 text-text-muted">{user?.role_name} — manage the GIIS India site from here.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Courses" value={counts?.courses} to="/admin/courses" />
        <StatCard label="Knowledge Articles" value={counts?.knowledge} to="/admin/knowledge" />
        <StatCard label="New Enquiries" value={counts?.newEnquiries} to="/admin/enquiries?status=new" highlight={Boolean(counts?.newEnquiries)} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {QUICK_LINKS.filter((l) => hasPermission(l.permission)).map((link) => (
            <Link key={link.to} to={link.to} className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-medium text-text hover:border-accent hover:text-accent">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Content modules</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Object.values(RESOURCE_CONFIGS)
            .filter((c) => hasPermission(c.permission))
            .map((c) => (
              <Link key={c.key} to={`/admin/${c.key}`} className="rounded-lg border border-border bg-surface p-4 text-sm font-medium hover:border-accent">
                {c.label}
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, to, highlight }) {
  return (
    <Link to={to} className={`block rounded-lg border p-5 ${highlight ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-text">{value ?? '—'}</p>
    </Link>
  )
}
