import { Navigate, useParams } from 'react-router-dom'

// Redirects to the authoritative /certifications/[slug] page rather than
// duplicating its content under a second URL — two near-identical pages
// for the same certification would be a real duplicate-content SEO
// problem (spec §32) for no real benefit, since /certifications/[slug]
// already carries the Knowledge Center's related-content links back in.
export default function CertificationExplainer() {
  const { slug } = useParams()
  return <Navigate to={`/certifications/${slug}`} replace />
}
