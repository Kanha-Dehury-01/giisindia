import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import RequirePermission from './admin/components/RequirePermission'
import { RESOURCE_CONFIGS } from './admin/resources.config'

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
const CareerPaths = lazy(() => import('./pages/knowledge-center/CareerPaths'))
const CareerPathDetail = lazy(() => import('./pages/knowledge-center/CareerPathDetail'))
const LearningPaths = lazy(() => import('./pages/knowledge-center/LearningPaths'))
const LearningPathDetail = lazy(() => import('./pages/knowledge-center/LearningPathDetail'))
const CertificationExplainer = lazy(() => import('./pages/knowledge-center/CertificationExplainer'))
const Glossary = lazy(() => import('./pages/knowledge-center/Glossary'))
const GlossaryTerm = lazy(() => import('./pages/knowledge-center/GlossaryTerm'))

const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminCoursesList = lazy(() => import('./pages/admin/CoursesList'))
const AdminCourseForm = lazy(() => import('./pages/admin/CourseForm'))
const AdminCourseCategories = lazy(() => import('./pages/admin/CourseCategories'))
const AdminKnowledgeList = lazy(() => import('./pages/admin/KnowledgeList'))
const AdminKnowledgeForm = lazy(() => import('./pages/admin/KnowledgeForm'))
const AdminLearningPathSteps = lazy(() => import('./pages/admin/LearningPathSteps'))
const AdminMediaLibrary = lazy(() => import('./pages/admin/MediaLibrary'))
const AdminEnquiries = lazy(() => import('./pages/admin/Enquiries'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminSiteSettings = lazy(() => import('./pages/admin/SiteSettings'))
const AdminRedirects = lazy(() => import('./pages/admin/Redirects'))
const AdminAuditLog = lazy(() => import('./pages/admin/AuditLog'))
const AdminSeoEditor = lazy(() => import('./pages/admin/SeoEditor'))
const AdminResourceList = lazy(() => import('./pages/admin/generic/ResourceList'))
const AdminResourceForm = lazy(() => import('./pages/admin/generic/ResourceForm'))

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
            <Route path="careers" element={<CareerPaths />} />
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

          <Route
            path="courses"
            element={
              <RequirePermission permission="courses.manage">
                <AdminCoursesList />
              </RequirePermission>
            }
          />
          <Route
            path="courses/:id"
            element={
              <RequirePermission permission="courses.manage">
                <AdminCourseForm />
              </RequirePermission>
            }
          />
          <Route
            path="course-categories"
            element={
              <RequirePermission permission="courses.manage">
                <AdminCourseCategories />
              </RequirePermission>
            }
          />

          <Route
            path="knowledge"
            element={
              <RequirePermission permission="knowledge.manage">
                <AdminKnowledgeList />
              </RequirePermission>
            }
          />
          <Route
            path="knowledge/:id"
            element={
              <RequirePermission permission="knowledge.manage">
                <AdminKnowledgeForm />
              </RequirePermission>
            }
          />

          {Object.values(RESOURCE_CONFIGS).map((config) => (
            <Route key={config.key} path={config.key}>
              <Route
                index
                element={
                  <RequirePermission permission={config.permission}>
                    <AdminResourceList resourceKey={config.key} />
                  </RequirePermission>
                }
              />
              <Route
                path=":id"
                element={
                  <RequirePermission permission={config.permission}>
                    <AdminResourceForm resourceKey={config.key} />
                  </RequirePermission>
                }
              />
              {config.hasSteps && (
                <Route
                  path=":id/steps"
                  element={
                    <RequirePermission permission={config.permission}>
                      <AdminLearningPathSteps />
                    </RequirePermission>
                  }
                />
              )}
            </Route>
          ))}

          <Route
            path="media"
            element={
              <RequirePermission permission="media.upload">
                <AdminMediaLibrary />
              </RequirePermission>
            }
          />
          <Route
            path="enquiries"
            element={
              <RequirePermission permission="enquiries.view">
                <AdminEnquiries />
              </RequirePermission>
            }
          />
          <Route
            path="seo"
            element={
              <RequirePermission permission="seo.edit_basic">
                <AdminSeoEditor />
              </RequirePermission>
            }
          />
          <Route
            path="redirects"
            element={
              <RequirePermission permission="redirects.manage">
                <AdminRedirects />
              </RequirePermission>
            }
          />
          <Route
            path="settings"
            element={
              <RequirePermission permission="settings.manage">
                <AdminSiteSettings />
              </RequirePermission>
            }
          />
          <Route
            path="users"
            element={
              <RequirePermission permission="users.manage">
                <AdminUsers />
              </RequirePermission>
            }
          />
          <Route
            path="audit-log"
            element={
              <RequirePermission permission="audit_log.view">
                <AdminAuditLog />
              </RequirePermission>
            }
          />
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
