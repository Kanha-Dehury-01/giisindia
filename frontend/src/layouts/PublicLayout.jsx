import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import SkipLink from '../components/layout/SkipLink'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/layout/ScrollToTop'
import { useStructuredData } from '../hooks/useStructuredData'
import { buildOrganizationSchema, buildWebsiteSchema } from '../utils/structuredData'

export default function PublicLayout() {
  // Site-wide Organization + WebSite (with a real, working SearchAction)
  // schema — applies once across every public route (docs/ARCHITECTURE.md
  // §L), not per-page like Course/Article/BreadcrumbList.
  const siteSchemas = useMemo(() => [buildOrganizationSchema(), buildWebsiteSchema()], [])
  useStructuredData(siteSchemas)

  return (
    <>
      <ScrollToTop />
      <SkipLink />
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
