import { useAuth } from '../../context/AuthContext'

// Full dashboard (overview widgets: enquiries, content counts, quick links
// per module) lands in Phase 7. This stub confirms the auth guard + shell
// routing works end-to-end.
export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl">Welcome{user?.name ? `, ${user.name}` : ''}</h1>
      <p className="mt-2 text-text-muted">
        The full CMS dashboard (courses, Knowledge Center, leadership, testimonials, statistics, events, FAQs, media
        library, enquiries, SEO, users, settings) lands in Phase 7.
      </p>
    </div>
  )
}
