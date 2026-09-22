import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'

// Route-level code splitting (spec §41/§53): the admin bundle (forms,
// data tables, rich text editor once Phase 7 lands) never ships to public
// visitors, and no public page pays for another page's JS.
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const WhyGiis = lazy(() => import('./pages/WhyGiis'))
const Courses = lazy(() => import('./pages/Courses'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const Certifications = lazy(() => import('./pages/Certifications'))
const CertificationDetail = lazy(() => import('./pages/CertificationDetail'))
const Leadership = lazy(() => import('./pages/Leadership'))
const Careers = lazy(() => import('./pages/Careers'))
const CareerPlacement = lazy(() => import('./pages/CareerPlacement'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Resources = lazy(() => import('./pages/Resources'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const Faq = lazy(() => import('./pages/Faq'))
const Contact = lazy(() => import('./pages/Contact'))
const Enquire = lazy(() => import('./pages/Enquire'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

const KnowledgeCenter = lazy(() => import('./pages/knowledge-center/KnowledgeCenter'))
const KnowledgeSearch = lazy(() => import('./pages/knowledge-center/KnowledgeSearch'))
const ArticleDetail = lazy(() => import('./pages/knowledge-center/ArticleDetail'))
const CareerPathDetail = lazy(() => import('./pages/knowledge-center/CareerPathDetail'))
const LearningPaths = lazy(() => import('./pages/knowledge-center/LearningPaths'))
const LearningPathDetail = lazy(() => import('./pages/knowledge-center/LearningPathDetail'))
const CertificationExplainer = lazy(() => import('./pages/knowledge-center/CertificationExplainer'))
const Glossary = lazy(() => import('./pages/knowledge-center/Glossary'))
const GlossaryTerm = lazy(() => import('./pages/knowledge-center/GlossaryTerm'))

const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="why-giis" element={<WhyGiis />} />

          <Route path="courses" element={<Courses />} />
          <Route path="courses/:slug" element={<CourseDetail />} />

          <Route path="certifications" element={<Certifications />} />
          <Route path="certifications/:slug" element={<CertificationDetail />} />

          <Route path="leadership" element={<Leadership />} />
          <Route path="careers" element={<Careers />} />
          <Route path="careers/placement" element={<CareerPlacement />} />

          <Route path="knowledge-center">
            <Route index element={<KnowledgeCenter />} />
            <Route path="search" element={<KnowledgeSearch />} />
            <Route path="fundamentals/:slug" element={<ArticleDetail contentType="fundamental" />} />
            <Route path="domains/:slug" element={<ArticleDetail contentType="domain" />} />
            <Route path="technologies/:slug" element={<ArticleDetail contentType="technology" />} />
            <Route path="guides/:slug" element={<ArticleDetail contentType="guide" />} />
            <Route path="resources/:slug" element={<ArticleDetail contentType="resource" />} />
            <Route path="careers/:slug" element={<CareerPathDetail />} />
            <Route path="learning-paths" element={<LearningPaths />} />
            <Route path="learning-paths/:slug" element={<LearningPathDetail />} />
            <Route path="certifications/:slug" element={<CertificationExplainer />} />
            <Route path="glossary" element={<Glossary />} />
            <Route path="glossary/:slug" element={<GlossaryTerm />} />
          </Route>

          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="resources" element={<Resources />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="enquire" element={<Enquire />} />

          <Route path="privacy-policy" element={<LegalPage title="Privacy Policy" />} />
          <Route path="terms-and-conditions" element={<LegalPage title="Terms & Conditions" />} />
          <Route path="cookie-policy" element={<LegalPage title="Cookie Policy" />} />
          <Route path="disclaimer" element={<LegalPage title="Disclaimer" />} />
          <Route path="refund-cancellation-policy" element={<LegalPage title="Refund & Cancellation Policy" />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          {/* Courses, Knowledge Center, leadership, testimonials, statistics,
              events, FAQs, media library, enquiries, SEO, users, settings
              CRUD routes are added in Phase 7. */}
        </Route>
      </Routes>
    </Suspense>
  )
}

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
    </div>
  )
}
