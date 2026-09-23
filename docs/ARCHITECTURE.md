# GIIS India — Architecture (Phase 1)

Status: architecture package, delivered before implementation per project instructions.
Domain: https://giisindia.in/ · Repo: `giisindia` · Stack: React+Vite (frontend) / PHP 8 + MySQL-MariaDB (backend) / cPanel hosting.

This document is the single source of truth for sitemap, system design, database, CMS, design system, SEO and security architecture. Implementation (Phases 2–14, tracked in the task list) must follow it; changes to it should be deliberate, not incidental.

---

## A. Sitemap

### Public site

```
/                                          Homepage (20 sections, see below)
/about                                     GIIS introduction, mission, Threatsys ecosystem
/why-giis                                  Standalone deep-dive (homepage section links here)
/courses                                   Course catalogue (search, filters, sort)
/courses/[slug]                            Course detail
/certifications                            Certification explorer (filterable list)
/certifications/[slug]                     Certification detail
/leadership                                Leadership / Faculty / Industry Mentors
/careers                                   Career exploration hub (career cards/pathways)
/careers/placement                         Career & Placement (stats, process, employer angle)
/knowledge-center                          Knowledge Center hub + global search
/knowledge-center/search                   Search results page (deep-linkable, ?q=)
/knowledge-center/fundamentals/[slug]      Cybersecurity fundamentals article
/knowledge-center/domains/[slug]           Cybersecurity domain article
/knowledge-center/technologies/[slug]      Technologies & tools article
/knowledge-center/guides/[slug]            Educational guide
/knowledge-center/resources/[slug]         Insight / resource article
/knowledge-center/careers/[slug]           Career path detail (roadmap page)
/knowledge-center/learning-paths           Learning paths index
/knowledge-center/learning-paths/[slug]    Learning path detail (step flow)
/knowledge-center/certifications/[slug]    Certification explainer (knowledge-side; links to /certifications/[slug])
/knowledge-center/glossary                 A–Z glossary index
/knowledge-center/glossary/[slug]          Glossary term detail
/events                                    Events / workshops / webinars listing
/events/[slug]                             Event detail
/resources                                 Downloadable resources listing (non-Knowledge-Center, operational)
/testimonials                              Full testimonials wall (homepage shows a subset)
/faq                                       Full FAQ (categorized; homepage shows a subset)
/contact                                   Contact + enquiry form
/enquire                                   Standalone enquiry form (shared component, different entry context)
/privacy-policy
/terms-and-conditions
/cookie-policy
/disclaimer
/refund-cancellation-policy
/404                                       Not found
/500                                       Server error (static fallback page)
```

### Admin (non-indexed, `/admin/*`, auth-gated)

```
/admin/login
/admin                                     Dashboard (overview widgets)
/admin/courses                             List + CRUD
/admin/courses/categories
/admin/certifications
/admin/careers
/admin/learning-paths
/admin/knowledge-center                    List + CRUD, all content types
/admin/knowledge-center/tags
/admin/knowledge-center/glossary
/admin/leadership                          Team members CRUD
/admin/testimonials
/admin/statistics                          Homepage numbers
/admin/events
/admin/resources
/admin/faqs
/admin/homepage                            Hero slides, section visibility/copy, featured courses
/admin/media                               Media library
/admin/enquiries                           Enquiry inbox + status pipeline
/admin/seo                                 Per-entity SEO fields, redirects manager
/admin/users                               Super Admin only
/admin/settings                            Site settings (contact info, social links, footer)
/admin/audit-log                           Super Admin only
/admin/profile                             Own account (password change)
```

Rationale for splitting `/careers` (exploration) from `/careers/placement` (stats/process): section 15 ("Career & Placement") and section 19 ("Career Paths", under Knowledge Center) describe two different audiences — homepage visitors browsing "what can I become" vs. Knowledge Center visitors doing deep research on one role. The homepage links to both; `/knowledge-center/careers/[slug]` is the authoritative deep page (structure from spec §19), `/careers` is the lighter marketing-facing card grid.

---

## B. System Architecture

```
┌─────────────────────┐        HTTPS (JSON)        ┌──────────────────────┐
│  React SPA (Vite)   │ ───────────────────────────▶│  PHP 8 REST API      │
│  react-router-dom    │◀─────────────────────────── │  (hand-rolled router) │
│  static build output │                              │  api.giisindia.in/*  │
└─────────┬────────────┘                              └───────────┬──────────┘
          │ served as static files                                │ PDO (prepared statements)
          │ (Apache, same cPanel account)                          ▼
          │                                              ┌──────────────────────┐
          │                                              │  MySQL / MariaDB      │
          │                                              └──────────────────────┘
          │
          ▼
   Browser (public visitor or admin, same SPA — /admin/* is a route tree,
   not a separate app, gated by an auth check that redirects to /admin/login)
```

- One Apache vhost serves the built frontend (`frontend/dist`) as static files; `/api/*` is rewritten (via `.htaccess`) to the PHP front controller. This mirrors the existing GIIS-new pattern and is the standard cPanel-friendly shape — no Node process required in production.
- The React app is a single SPA for both public site and admin — code-split so the admin bundle (charts, rich text editor, CRUD tables) is not downloaded by public visitors (see §K, Performance).
- No SSR. SEO is handled via `react-helmet`-style per-route `<head>` management plus a **prerendering step at build time** for indexable public routes (see §L) — necessary because a pure client-rendered SPA is a real SEO risk for a marketing site; this is the one deliberate deviation from "just Vite+React" and is called out as an assumption in §O.

---

## C. Frontend Architecture

```
frontend/
├── src/
│   ├── api/                    one file per resource: courses.js, knowledge.js, careers.js,
│   │                           learningPaths.js, certifications.js, testimonials.js, team.js,
│   │                           faqs.js, events.js, enquiries.js, admin/*.js
│   │                           — all wrap a single `client.js` (fetch wrapper: base URL,
│   │                           credentials, error normalization, CSRF header injection)
│   ├── components/
│   │   ├── ui/                 primitive, reusable, brand-agnostic: Button, Badge, Card,
│   │   │                       Input, Select, Accordion, Modal, Tabs, Breadcrumbs, Pagination,
│   │   │                       Skeleton, EmptyState, Toast — these ARE the design system's
│   │   │                       component layer (design-system skill: component tokens)
│   │   ├── layout/              Header, Footer, MobileNav, SkipLink, SearchOverlay
│   │   ├── sections/            one file per homepage section (HeroSlider, TrustStrip,
│   │   │                       WhyGiis, TopCourses, LearningExperience, NumbersStats,
│   │   │                       CareerPathways, TestimonialCarousel, FaqAccordion, FinalCta …)
│   │   ├── course/              CourseCard, CourseFilterBar, CourseCurriculumAccordion
│   │   ├── knowledge/            KnowledgeSearchBar, ContentTypeFilterTabs, RelatedContentRail,
│   │   │                       GlossaryAZNav, LearningPathFlow, CareerRoadmap
│   │   └── motion/               PageTransition, RevealOnScroll, StaggerGroup, ParallaxLayer,
│   │                             SvgSceneHero1/2/3 — thin wrappers around the motion system
│   │                             (see §J); this is the ONLY place `motion/react` (Motion,
│   │                             formerly Framer Motion) primitives are imported directly.
│   ├── pages/                    one file per route in §A; thin — compose sections/data,
│   │                             no business logic
│   │   └── admin/                 CRUD screens per content type + Dashboard, Login
│   ├── layouts/                   PublicLayout (Header/Footer/SkipLink), AdminLayout (sidebar nav,
│   │                              RBAC-aware menu)
│   ├── context/                   AuthContext, ToastContext, SettingsContext (site_settings cache),
│   │                              ReducedMotionContext (reads prefers-reduced-motion once, shared)
│   ├── hooks/                     useSeo, useReveal, useFetch, useDebouncedValue (search),
│   │                              usePagination, useCsrfToken
│   ├── styles/                    tokens.css (primitive/semantic/component CSS variables),
│   │                              base.css, utilities.css — Tailwind v4 `@theme` block
│   │                              references tokens.css variables (see §G)
│   └── utils/                     formatDate, slugify, truncate, structuredData.js (JSON-LD builders)
└── public/                        favicon, robots.txt, static SVG illustrations, .htaccess
```

**Rules (spec §53 code quality):**
- No component file over ~200 lines; a section that grows past that splits into a folder (`TopCourses/index.jsx` + subcomponents).
- All copy/content comes from the API — no hardcoded homepage courses, testimonials, stats, or FAQ text (spec §10, §13, §14, §23).
- `components/ui/*` never imports from `pages/*` or `sections/*` (one-directional dependency, prevents circular imports and keeps the primitive layer reusable).

---

## D. Backend Architecture

```
backend/
├── api/
│   ├── index.php               front controller: parses route, dispatches to handler,
│   │                            wraps in try/catch → consistent JSON error envelope
│   ├── handlers/                one file per resource (courses.php, knowledge.php, careers.php,
│   │                            learning_paths.php, certifications.php, glossary.php,
│   │                            testimonials.php, team.php, faqs.php, events.php, resources.php,
│   │                            enquiries.php, statistics.php, homepage.php, search.php,
│   │                            auth.php, users.php, media.php, seo.php, redirects.php,
│   │                            settings.php, audit_log.php)
│   ├── middleware/               auth.php (session check), rbac.php (permission check),
│   │                            csrf.php, rate_limit.php
│   ├── uploads/                  media storage (git-ignored)
│   └── .htaccess                 rewrites /api/* → index.php
├── config/                       config.php (env loader), db.php (PDO singleton)
├── includes/                     security.php, helpers.php, validate.php, upload.php,
│                                 response.php (JSON envelope helpers), search.php (ranking logic)
└── cron/                         (Phase 8+) sitemap regeneration, redirect cache warm
```

- **Router pattern**: no framework — `index.php` matches `REQUEST_METHOD` + path against a small route table per handler, consistent with the existing GIIS-new backend. This keeps the app cPanel-deployable with zero Composer dependencies if desired (Composer is optional, used only for dev-time tooling like PHPUnit, not runtime).
- **Every handler function signature**: `(PDO $db, array $params, ?array $user): Response`. `$user` is null for public endpoints, populated (with role) for admin endpoints — this is what makes RBAC checks mechanical and impossible to forget (§M).
- **Response envelope** (all endpoints): `{ "success": bool, "data": ..., "error": {"code","message"} | null, "meta": {"page","per_page","total"} | null }`.

---

## E. Database — Entity Relationship Overview

Full DDL lives in `database/schema.sql` (Phase 1 deliverable, already written — see that file). Summary of table groups:

| Group | Tables |
|---|---|
| RBAC | `roles`, `permissions`, `role_permissions`, `users` |
| Courses | `course_categories`, `courses`, `course_curriculum`, `course_skills`, `course_tools`, `course_learning_outcomes`, `course_faqs`, `course_career_links`, `course_knowledge_links` |
| Certifications | `certifications` |
| Careers | `careers`, `career_certification_links` |
| Learning paths | `learning_paths`, `learning_path_steps` |
| Knowledge Center | `knowledge_categories`, `knowledge_content`, `knowledge_tags`, `knowledge_content_tags`, `knowledge_relationships` (polymorphic), `glossary_terms` |
| Homepage / marketing | `hero_slides`, `homepage_sections`, `testimonials`, `team_members`, `statistics` |
| Events/resources | `events`, `resources` |
| Support | `faqs`, `media`, `enquiries` |
| SEO/platform | `seo_metadata` (polymorphic), `redirects`, `site_settings`, `audit_logs` |

**Key design decisions:**
1. **`knowledge_relationships` is polymorphic** (`from_type`/`from_id`/`to_type`/`to_id`) because the spec's internal-linking requirement (§17) explicitly spans six different entity types (knowledge content, careers, learning paths, certifications, courses, glossary terms). A dedicated junction table per type-pair would mean 15+ tables for the same concept. MySQL can't FK-constrain a polymorphic pair, so referential integrity here is enforced in the API layer (validated on write, orphans cleaned on delete) — documented as a deliberate tradeoff, not an oversight.
2. **`seo_metadata` is also polymorphic** (`entity_type`/`entity_id`) for the same reason — every indexable content type (spec §33) needs the same 8 SEO fields; a shared table avoids repeating those columns on 10 tables.
3. **Two ISO 27001 Lead Auditor course rows** (spec §5 note) — kept as two distinct `courses` rows with distinct slugs until GIIS confirms whether they're duplicates. A `is_duplicate_suspect` boolean flags the pair for admin attention.
4. Every content table with a public URL has: `slug` (unique, indexed), `publish_status` (`draft`/`published`), timestamps. Nothing is hard-deleted from the CMS side by default — publish_status governs visibility (a real hard-delete endpoint exists for Super Admin only, per §26).
5. Indexes are placed on every foreign key, every `slug`, every `publish_status`, and composite indexes on the columns the Knowledge Center search filters by (`content_type`, `category_id`, `difficulty`).

---

## F. CMS Architecture

- **Framework-free CRUD generator pattern**: each content type gets a `List` page (table, search, filter, pagination, status badges) + a `Form` page (create/edit, shared between both) — see `components/admin/` for the shared building blocks (`DataTable`, `FormField`, `MediaPicker`, `RichTextEditor`, `StatusToggle`, `ConfirmDialog`). This is what makes 15+ CMS sections maintainable without 15 bespoke implementations.
- **RBAC enforcement is server-side only** (spec §26 explicit requirement). Every admin API handler calls `require_permission($user, 'courses.edit')` (etc.) before touching data; the React admin UI hides controls the user can't use, but that's a UX convenience, never the security boundary.
- **Roles ship as data, not code** (`roles`/`permissions`/`role_permissions` tables), so a third role (e.g. "Content Reviewer") can be added later via the `/admin/users` → roles UI without a deploy, per spec §26 "design architecture so additional roles can be added later."
- **Default permission set:**

| Permission | Super Admin | Editor |
|---|:---:|:---:|
| courses.* (create/edit/publish/delete) | ✅ | create/edit/publish; not delete |
| knowledge.* | ✅ | create/edit/publish; not delete |
| testimonials.*, events.*, faqs.* | ✅ | create/edit/publish; not delete |
| media.upload | ✅ | ✅ |
| seo.edit_basic (title, meta description, alt text) | ✅ | ✅ |
| seo.edit_advanced (canonical override, robots directive, redirects) | ✅ | ❌ |
| users.manage, roles.manage | ✅ | ❌ |
| settings.manage (site-wide, integrations) | ✅ | ❌ |
| audit_log.view | ✅ | ❌ |
| enquiries.view, enquiries.update_status | ✅ | ✅ |

- **Animation safety** (spec §27: "content changes should not break animations"): CMS fields never store markup that controls animation timing/behavior — hero slides store `heading`, `description`, `cta_label/url`, and a `svg_asset_key` (an enum picking from a fixed, developer-maintained set of SVG scene components), never raw SVG or animation code. This is the mechanism that keeps non-technical editors safely in the content lane.

---

## G. Design System

Three-layer token architecture (design-system skill convention): **Primitive → Semantic → Component**. Full CSS variables ship in Phase 2 as `frontend/src/styles/tokens.css`, values fixed now so all later work is consistent.

**Style/pattern basis** (from `ui-ux-pro-max --design-system`, verified against product type "professional certification training academy corporate trust"): pattern **Trust & Authority + Conversion**, style **Accessible & Ethical** (light+dark capable, WCAG-first, matches education/public-sector-grade trust expectations) — deliberately not the tool's first "Cyberpunk UI" match, which was rejected as exactly the neon/hacker cliché the brief prohibits.

### Primitive tokens (raw values)

```css
/* Navy scale (from verified Banking/Trust palette, --color-primary family) */
--navy-950: #020617;
--navy-900: #0F172A;   /* brand primary */
--navy-800: #1E293B;
--navy-700: #334155;
--navy-600: #475569;

/* Gold scale (from verified Banking/Trust palette, --color-accent) */
--gold-800: #713F12;
--gold-700: #A16207;   /* brand accent — AA-safe on white body text */
--gold-500: #D97706;
--gold-400: #F2A93C;   /* brighter "brand gold", decorative/on-dark use only */

/* Neutrals */
--white: #FFFFFF;
--offwhite-50: #F8FAFC;
--slate-200: #E2E8F0;
--slate-400: #94A3B8;
--slate-600: #475569;

/* Status */
--red-600: #DC2626;   /* destructive/error */
--green-600: #16A34A; /* success */
--amber-500: #D97706; /* warning */
```

### Semantic tokens (purpose aliases)

```css
--color-bg: var(--white);
--color-bg-inverse: var(--navy-900);       /* hero, footer, dark sections */
--color-surface: var(--white);
--color-surface-muted: var(--offwhite-50);
--color-surface-glass: color-mix(in srgb, var(--navy-900) 55%, transparent); /* selective use only, see §J */
--color-text: var(--navy-950);
--color-text-muted: var(--slate-600);
--color-text-inverse: var(--white);
--color-text-inverse-muted: var(--slate-400);
--color-primary: var(--navy-900);
--color-accent: var(--gold-700);           /* on light surfaces: buttons/links/badges, AA-safe */
--color-accent-on-dark: var(--gold-400);   /* on navy surfaces only */
--color-border: var(--slate-200);
--color-border-inverse: color-mix(in srgb, var(--white) 15%, transparent);
--color-focus-ring: var(--gold-500);
--color-danger: var(--red-600);
--color-success: var(--green-600);
```

### Component tokens (examples — full set in Phase 2)

```css
--button-primary-bg: var(--color-accent);
--button-primary-text: var(--navy-950);     /* dark text on gold passes AA, not white-on-gold */
--button-primary-bg-hover: var(--gold-500);
--card-bg: var(--color-surface);
--card-border: var(--color-border);
--card-radius: var(--radius-lg);
--nav-bg-scrolled: color-mix(in srgb, var(--navy-900) 92%, transparent);
```

**Tailwind v4 integration**: tokens declared once in a CSS `@theme` block that reads these variables (per verified `html-tailwind` stack guidance) — components use `bg-primary`, `text-accent`, never `bg-[var(--color-primary)]` or raw hex.

**Glass usage discipline (spec §6):** `--color-surface-glass` is used ONLY for floating/secondary UI — nav-on-scroll backdrop, hero slide indicator pills, floating "Talk to an Advisor" chip. Every primary content surface (cards, course details, Knowledge Center articles) is solid `--color-surface`. This is enforced in code review, not just convention — `components/ui/Card.jsx` has no `glass` variant; glass is a small, explicit set of named components (`GlassNavBar`, `GlassChip`) so it can't spread accidentally.

---

## H. Typography

Verified pairing (from `ui-ux-pro-max --domain typography`, mood: corporate/trustworthy/accessible/readable): **Lexend** (display/headings/UI labels) + **Source Sans 3** (body/long-form). Both are variable Google Fonts, both have excellent screen legibility at small sizes (Lexend was designed for reading-proficiency research; Source Sans 3 is built for dense body text) — a deliberate fit for a site that is highly interactive on the homepage but needs to "feel editorial and calm" in the Knowledge Center (spec §7).

| Role | Font | Size (desktop / mobile) | Weight | Line-height |
|---|---|---|---|---|
| Display (hero) | Lexend | 56px / 34px | 600 | 1.1 |
| H1 | Lexend | 40px / 28px | 600 | 1.15 |
| H2 | Lexend | 32px / 24px | 600 | 1.2 |
| H3 | Lexend | 24px / 20px | 600 | 1.25 |
| Body | Source Sans 3 | 17px / 16px | 400 | 1.6 |
| Small body | Source Sans 3 | 15px / 14px | 400 | 1.55 |
| UI label | Lexend | 14px | 500 | 1.3, tracked +0.02em |
| Button | Lexend | 15px | 600 | 1 |
| Metadata (dates, tags) | Source Sans 3 | 13px | 500 | 1.4, muted color |

Rules: two font families only, no third accent font; Knowledge Center long-form body caps line length at ~72ch; base size never below 16px on mobile body text (accessibility floor, §40).

---

## I. Color Token System

See §G primitive/semantic tables — this section states the **usage contract**:

- Navy (`--navy-900`) is the dominant surface for: hero, footer, nav-on-dark states, section dividers that need atmosphere/depth.
- Gold (`--gold-700`/`--gold-400`) is reserved for: primary CTA buttons, active/selected states, badges (Best Seller, New), progress indicators, focus rings, small accent strokes in SVG illustrations. It is **never** used as a large background fill (avoids the "excessive gold" template look explicitly prohibited).
- White/off-white (`--white`/`--offwhite-50`) is the dominant surface for course cards, Knowledge Center articles, forms, CMS.
- All text/background pairings are checked against WCAG AA (4.5:1 body, 3:1 large text) — the gold-on-white accent (`#A16207`) was specifically chosen over a brighter gold because it's the pairing that passes AA for body-sized text; the brighter `--gold-400` is reserved for decorative use on dark navy backgrounds only, where contrast is separately verified.
- Dark mode: not required by the spec for the public site (education sector default is light-content-first per the verified "Accessible & Ethical" style match); the token structure supports adding a `[data-theme="dark"]` override later without refactoring, since components only ever reference semantic tokens.

---

## J. Motion System

Layered per the mandated skill progression:

1. **motion-foundations** — the only place spring presets, duration/easing tokens, `useSafeMotion` (wraps `prefers-reduced-motion`), and SSR-safe mount guards are defined. Every other motion skill/component imports from here; no raw duration/easing numbers anywhere else in the codebase (mirrors the "no raw hex" discipline for color).
2. **motion-patterns** — button/card hover, modal open/close, toast, stagger list reveal (course grids, career cards, FAQ items), page-section scroll reveal, accordion expand (FAQ, curriculum).
3. **motion-advanced** — the three-slide hero's SVG scene choreography (node → data-flow → shield; student → terminal → secured system; learning → certify → career), scroll-linked hero movement, Knowledge Center search-result transitions, career roadmap path-drawing SVG.

**Motion tokens (defined in motion-foundations, referenced everywhere):**

```
--motion-duration-instant: 100ms
--motion-duration-fast:    180ms
--motion-duration-base:    300ms
--motion-duration-slow:    500ms
--motion-duration-scene:   1200ms   /* hero SVG scene beats only */
--motion-ease-standard:    cubic-bezier(0.4, 0, 0.2, 1)
--motion-ease-out:         cubic-bezier(0, 0, 0.2, 1)
--motion-ease-spring:      spring(stiffness: 300, damping: 30)  /* via motion/react */
```

**Reduced motion contract (spec §37/§38, non-negotiable):** `ReducedMotionContext` reads `prefers-reduced-motion` once at app root. When reduced: hero slides still change (on a timer/manual control) but via crossfade only, no SVG scene animation (a static final-state illustration renders instead); scroll reveals render content already-visible (no opacity/transform animation, so nothing is ever hidden behind JS that didn't fire); stagger becomes a single simultaneous fade; parallax layers freeze at rest position. This is implemented once, centrally, not per-component — no component is allowed to ship its own `prefers-reduced-motion` media query.

**Explicitly avoided** (spec §38): floating idle animation on every card, particle backgrounds, decorative cursor-follow effects, infinite background motion. Motion is reserved for: state change, scroll-triggered reveal (once), explicit interaction feedback, and the three hero storytelling scenes.

---

## K. Component Hierarchy

```
App
├── PublicLayout
│   ├── SkipLink
│   ├── Header (sticky, GlassNavBar on scroll)
│   │   ├── Logo
│   │   ├── PrimaryNav (Home / About / Courses / Why GIIS / Leadership / Career & Placement / Knowledge Center)
│   │   ├── SecondaryNav (Resources / Events)
│   │   ├── KnowledgeSearchTrigger → SearchOverlay
│   │   └── CTAButton ("Enquire Now")
│   ├── <route content — pages/*, composed from components/sections/*>
│   └── Footer (5 columns per spec §46)
├── AdminLayout (RBAC-aware sidebar)
│   ├── AdminHeader (user menu, quick links)
│   ├── AdminSidebar (menu items filtered by user's permissions)
│   └── <admin route content — pages/admin/*, built from DataTable/FormField/MediaPicker/RichTextEditor>
└── Shared primitives (components/ui/*): Button, Badge, Card, Input, Select, Accordion,
    Modal, Tabs, Breadcrumbs, Pagination, Skeleton, EmptyState, Toast
```

Homepage (`pages/Home.jsx`) composes, in order, the 20 sections from spec §8 — each a component in `components/sections/`, each independently data-fetched (or fed from one aggregated `/api/homepage` payload — see §K note in API spec) so a missing/slow section never blocks the rest of the page (progressive rendering, skeleton states per §49).

---

## L. SEO Architecture

- **Prerendering**: build step renders every public, published route to static HTML (crawlable without JS) while the SPA hydrates for interaction — solves the SPA/SEO tension without introducing Next.js/SSR infrastructure (stays cPanel-static-friendly). Route list for prerendering is generated from the database at build time (dynamic course/knowledge/career/glossary slugs included).
- **Per-entity SEO fields** (title, meta description, canonical, robots directive, OG title/description/image) live in `seo_metadata`, editable from `/admin/seo` and inline on each content type's edit form.
- **Structured data (JSON-LD)**, built by `utils/structuredData.js`, applied only where genuinely eligible (spec §32/§33 — "do not add structured data simply for manipulation"):
  - `Organization` + `WebSite` (with `SearchAction`) — site-wide, in root layout.
  - `BreadcrumbList` — every page with a breadcrumb trail.
  - `Course` — course detail pages.
  - `Article` — Knowledge Center guides/fundamentals/domains with a real author/reviewer and publish/update date.
  - `Person` — leadership/faculty profiles.
  - `Event` — event detail pages.
  - `FAQPage` — only on pages where the visible FAQ accordion content matches the structured data 1:1 (homepage FAQ section, course FAQ, `/faq`) — never injected speculatively.
  - `VideoObject` — reserved for future use; nothing in Phase 1–14 scope produces video content (testimonials are explicitly text-only, §14).
- **Sitemap**: `backend/api/sitemap.php` generates XML dynamically from published content (mirrors existing GIIS-new pattern), covering all public slugs; paginated sitemap index if entry count grows large.
- **Redirects**: `redirects` table (`from_path`, `to_path`, `status_code` default 301) is read by the Apache/PHP layer before 404 — this is the mechanism for migrating existing giisindia.in URLs (spec §3). Admin-manageable per spec §3/§25.
- **URLs**: all slugs lowercase-kebab-case, stable once published (editing a title does not silently change the slug — requires explicit confirm + auto-creates a redirect from the old slug).

---

## M. Security Architecture

| Concern | Implementation |
|---|---|
| Password storage | `password_hash()` (bcrypt/argon2i, PHP native), never reversible encryption |
| Session security | PHP native sessions, `HttpOnly` + `Secure` + `SameSite=Lax` cookies, session ID regenerated on login |
| CSRF | Per-session token, required on all state-changing admin requests, validated server-side before RBAC check |
| SQL injection | 100% PDO prepared statements, no string-concatenated queries anywhere (enforced by code review + a simple grep-based CI check) |
| RBAC | Server-side permission check on every admin handler (§F); frontend hiding is UX only |
| File uploads | MIME-type sniffing (not trusting extension/client-declared type), extension allowlist, max size enforced, filename regenerated (never trust client filename), stored outside webroot execution path where possible / `.htaccess` denies PHP execution in `uploads/` |
| Rate limiting | Login endpoint throttled per-IP+username (exponential backoff after N failures), enquiry form throttled per-IP to deter spam |
| Admin route protection | `/admin/*` API routes require valid session + role check; the SPA route guard is a UX convenience only |
| Audit logging | `audit_logs` records who changed what (entity_type/entity_id/action/diff) for all publish/delete/user-management actions |
| Secrets | DB credentials in `.env` (git-ignored), never in frontend bundle or committed source; `.env.example` documents required keys with placeholder values |
| Transport | HTTPS-ready config (HSTS header, secure cookies); actual TLS termination is a hosting/cPanel concern documented in deployment docs (Phase 14) |
| Input validation | Centralized in `backend/includes/validate.php`; every handler validates before touching the DB, rejects unknown fields |
| Output escaping | React escapes by default (JSX); any `dangerouslySetInnerHTML` use (rich-text Knowledge Center body) runs through a server-side sanitizer allowlist (safe tags only) before storage, not just at render |

---

## N. Development Phases

Tracked as tasks #1–#14 in this session's task list; summarized here for reference:

1. Architecture + design system (this document) — **done**
2. Frontend shell + routing — **done**
3. Homepage — **done**
4. Course catalogue + detail pages — **done**
5. Knowledge Center + search — **done**
6. Career paths + learning paths + certification explorer + glossary — **done**
8. PHP API + database — **done**, out of numeric order and ahead of 7 so the CMS is built against a real API instead of a temporary one (see below)
7. Admin CMS — **done**
9. SEO implementation — **done**
10. Security hardening — **done**
11. Responsive optimization — **done**
12. Performance optimization — **done**
13. Testing — **done**
14. cPanel deployment documentation — **done**

**Phase 7 in detail:** a config-driven CMS framework (`frontend/src/admin/resources.config.js`) describes each "plain" resource — table columns, form fields, validation hints, permission slug — once, and two generic pages (`pages/admin/generic/ResourceList.jsx`/`ResourceForm.jsx`) render every one of careers, learning paths, certifications, glossary, testimonials, team, FAQs, events, and resources from that config, so adding a tenth resource is a config entry, not a new page. Courses and Knowledge Center content get dedicated pages (`CourseForm.jsx`, `KnowledgeForm.jsx`) because they carry nested child data — curriculum/skills/tools/outcomes/FAQs, and tags respectively — a generic form can't express; Learning Paths similarly gets a dedicated reorderable step editor. Media Library, Enquiries (with its status pipeline), Users (Super Admin only), Site Settings, Redirects, a per-entity SEO metadata editor, and a read-only Audit Log round out the rest. The sidebar (`admin/nav.config.js`) and every route are filtered by the signed-in user's permissions via `AuthContext.hasPermission()` — a UX convenience only, since every admin API call is independently permission-checked server-side regardless (verified: an Editor session is redirected out of `/admin/users` even navigating there directly by URL).

Verified end-to-end in a real browser (Playwright) against a live MariaDB instance: login, dashboard stats, course create/edit/delete with curriculum content, a generic resource's (career's) edit form, the learning-path step editor, enquiries, media upload (including a rejected malicious SVG), users, site settings, and the audit log — then logout. Two real bugs were caught this way and fixed at the source rather than worked around: (1) `Login.jsx` stored the whole `{user, csrf_token}` login response as the user object instead of unwrapping `.user`, so every `hasPermission()` check silently failed after sign-in and the entire sidebar rendered empty — same latent bug existed in `fetchCurrentUser()`; (2) MySQL strict mode rejected a checkbox's `false` value for a `TINYINT` column ("Incorrect integer value: ''") because PDO's native (non-emulated) prepared statements can bind a PHP `bool` as an empty string rather than 0/1 — fixed generically in `CrudResource::normalize()` so every resource benefits, not just courses.

**Phase 8 in detail (what actually exists in `backend/`):** a custom `.env` loader and PDO singleton (`config/`); session/CSRF/RBAC/password/audit-log primitives, a generic `Validator`, a generic `CrudResource` engine (list/find/create/update/delete/child-row-replace, injection-safe via a fixed field allowlist per resource), and MIME-sniffing upload handling with SVG script-injection rejection (`includes/`); a file-based fixed-window rate limiter for auth and public enquiry submission (`api/middleware/`); ~20 handler files covering every public route plus a fully permission-gated `/admin/*` surface (`api/handlers/`); and a regex-route front controller with CORS and CSRF enforcement (`api/index.php`). `database/seed.sql` was generated directly from the frontend's placeholder data modules (via a one-time Node extraction script, not retyped) so every slug matches exactly, then applied against a real MariaDB instance and exercised end-to-end with `curl`: every public route, the full admin CRUD/publish/delete path, Super Admin vs. Editor permission boundaries, CSRF rejection, auth rate-limit lockout, and malicious SVG upload rejection. One real bug was caught and fixed in the process: the frontend's own course `slugify()` stripped `+` before collapsing punctuation, silently colliding four course-title pairs (e.g. "CGEH Elite Plus" / "CGEH Elite Plus+") onto the same slug — fixed at the source in `frontend/src/data/coursesPlaceholder.js` since it affects the live catalogue, not just the seed export.

**Phase 9 in detail:** `hooks/useSeo.js` now sets a full head — title, meta description, an always-absolute canonical URL (relative paths are resolved against `window.location.origin`), Open Graph + Twitter card tags, and a robots directive — from one call per page; every existing call site kept working unchanged since the new fields are all optional. `pages/StubPage.jsx` and `NotFound.jsx` now emit `noindex,follow` — a route whose real content template hasn't shipped, or a 404, must never compete with or precede the real page in search results. `utils/structuredData.js` gained `buildWebsiteSchema` (with a `SearchAction` that really points at `/knowledge-center/search?q=`, verified against that page's actual query param), `buildFaqPageSchema`, `buildPersonSchema`, and `buildEventSchema`, rounding out the schema list from §L; `Organization` + `WebSite` are now injected once, site-wide, from `PublicLayout`. `/faq` was built out as a real page (it was a stub) specifically because it's the only place `FAQPage` schema is valid per spec §L — the homepage's `FaqSection` shows a subset and correctly never emits the schema; `/faq`'s JSON-LD `mainEntity` count was verified to equal its visible accordion count (7) in a real browser. `backend/api/sitemap.php` is a standalone script (not routed through `index.php`, since production's `frontend/public/.htaccess` rewrites the site-root `/sitemap.xml` request straight to this physical file) that generates a real XML sitemap from every published course/knowledge-content/career/learning-path/certification/glossary-term/event slug plus the fixed static routes — verified against a live MariaDB instance to emit 97 URLs (18 static + 79 from seed data), and degrades to the static-route list rather than 500ing if the database is unreachable.

**Deliberately not done in Phase 9** (documented here rather than silently skipped): full build-time prerendering of every route to static HTML. The public site (Phases 2–6) still renders from placeholder data, not the live API — prerendering it now would bake in placeholder content as if it were final, and the dynamic-slug list it would need (courses, articles, etc.) only means something once those pages fetch from the real database. This is why unmatched client-side routes still return HTTP 200 with a client-rendered "not found" view rather than a true 404 status — the `noindex` meta tag on that view is a mitigation, not a substitute. Revisit once the public site is wired to the Phase 8 API.

**Phase 10 in detail:** a global `set_error_handler`/`set_exception_handler` pair in `api/index.php` guarantees every response is the fixed JSON envelope — never a raw PHP warning/fatal-error HTML page. This closed a real leak caught during Phase 8/9 testing: an uncaught `PDOException` (a foreign-key violation) was returning a full stack trace with server file paths directly in the HTTP response body; it now logs the same detail server-side via `error_log()` and returns a generic `server_error` message to the client — verified by deliberately triggering the same FK violation and confirming the client only ever sees the sanitized message while the real detail lands in the PHP error log. Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Strict-Transport-Security` when not `APP_ENV=development`) are now also set from PHP itself in `index.php`, not just `.htaccess` — so they apply under `php -S` for local dev too, not only Apache. `frontend/public/.htaccess` and `backend/api/.htaccess` both gained a `Content-Security-Policy` scoped to what the app actually loads (self + Google Fonts only, checked against every external URL in `src/` and `index.html`) — `style-src` needs `'unsafe-inline'` because `motion/react` animates via inline `style` attributes; this specific header has not been verified against a real Apache instance in this environment (only `php -S`/Vite dev, where `.htaccess` isn't processed at all) and should be checked in the browser console after Phase 14 deployment. `start_secure_session()` now also sets `session.use_strict_mode` (session-fixation defense) and disables `session.use_trans_sid`. The SVG upload scanner's blocklist was widened (`<iframe>`, `<embed>`, `<object>`, `<foreignObject>`, `data:text/html`) beyond the original script/event-handler/`javascript:` check. Failed login attempts are now written to `audit_logs` too (previously only successes were), with the attempted username in `meta_json` and a nullable `user_id` (`write_audit_log()`'s signature changed from `int` to `?int` for this) — surfaced in the admin Audit Log UI's new "Details" column, labeled "Unrecognized" rather than blank so a spray of failed logins against unknown usernames is visible, not silent.

**Phase 11 in detail:** a genuine verification pass, not a re-implementation — every page from Phases 2–7 was already built with Tailwind's responsive utilities from the start, so this phase's job was to actually test that in a real browser and fix what it found, rather than assume it. A Playwright script loaded all 18 public routes and all 25 admin routes at four viewports (375/768/1280/1920px — 172 page×viewport combinations) and checked `document.documentElement.scrollWidth` against `clientWidth` for horizontal overflow. The public site was clean at every combination. Every admin list page overflowed at mobile and tablet widths — a real, classic CSS bug: `AdminLayout`'s flex column wrapping the page content had no `min-width: 0`, so a flex item's default `min-width: auto` refused to let it shrink below a wide `<table>`'s intrinsic width, defeating `DataTable`'s own `overflow-x-auto` wrapper entirely and pushing the whole document wider than the viewport. Fixed by adding `min-w-0` to that flex column and to `<main>`; re-running the same 172-combination check afterward found zero remaining overflow anywhere. Also verified in a real browser: both the public and admin mobile nav drawers open, list the right links, and the admin one auto-closes on navigation; every homepage CTA button meets the 44px touch-target minimum (`components/ui/Button`'s `min-h-[44px]` already enforced this); and the course admin form's two-column field grid stays usable (~140px per field) at 375px width rather than needing to collapse to one column.

**Phase 12 in detail:** `vite.config.js` now splits React/ReactDOM/React Router into their own `react-vendor` chunk via `build.rollupOptions.output.manualChunks` — code that changes far less often than the app's own routes/pages, so a deploy that only touches app code no longer invalidates the browser cache for it. (This project's Vite build uses the rolldown engine, which requires the function form of `manualChunks` — the plain-object form Rollup also accepts throws a build-time type error here; worth flagging since it's an easy mistake to reintroduce.) Verified by inspecting the build output before/after: the main `index-*.js` entry chunk dropped from 298KB/92KB gzip to 38.5KB/9.9KB gzip, with the extracted `react-vendor-*.js` at 259KB/82KB gzip now cacheable independently of app changes.

The Knowledge Center cross-content search (`api/handlers/knowledge.php`'s `knowledge_search()`) previously fetched every published row from every searched table on every request, scoring all of them in PHP regardless of match — fine at the current seed-data scale, a real bottleneck once real content volume grows. It now pushes an equivalent `LIKE` filter (one clause per scored term — the full query plus each individual word — across the title and body columns) into the SQL `WHERE` clause before fetching, plus a defensive `LIMIT 500` per source table. The filter is a superset match of "could this row possibly score > 0" in the existing PHP ranking logic, so it narrows the fetched row set without being able to change which rows win or their scores — verified by re-running the exact same search queries used to validate the original ranking logic in Phase 8/5 (`"penetration testing"`, `"soc"`) and confirming byte-identical result sets, titles, and scores before and after.

Also: the one `<img>` tag in the whole frontend (the admin Media Library's thumbnail grid — the public site has none yet, since it has no real photography, only SVG/CSS) now has `loading="lazy"`.

**Phase 13 in detail:** two real, checked-in, currently-passing automated suites — everything before this phase was verified by hand (curl, ad hoc Playwright scripts) with no persistent artifact a future change could be checked against.

`backend/tests/` (PHPUnit, added as a dev-only Composer dependency — `backend/composer.json` documents that production still has zero runtime dependencies, unchanged): unit tests for `slugify()`, the `Validator` class, pagination helpers, and password hashing (pure logic, no DB); integration tests for `CrudResource` (create/update/delete/list/pagination/slug-collision-suffixing/child-row-replace) and `knowledge_relationships_for()` (the polymorphic relationship resolver — including that an unpublished linked target correctly never appears), run against a dedicated `giisindia_test` database via `tests/bootstrap.php`, which reuses whatever `DB_USER`/`DB_PASSWORD` are already in `.env` rather than hardcoding its own. 34 tests, 61 assertions, all passing. Deliberately does not test `require_auth()`/`require_permission()`'s failure paths — both call `json_error()`, which `exit()`s, uncatchable by PHPUnit — that boundary (401/403 behavior, CSRF rejection, rate limiting) is exactly what the e2e suite below already covers at the HTTP level, so the split is by design, not an oversight.

`frontend/e2e/` (Playwright, added as a dev dependency): `admin.spec.js` drives a real browser through the full admin flow — login, dashboard, course create/edit-content/delete, a generic resource's (career's) edit form, the learning-path step editor, every remaining admin screen loading, logout — plus an RBAC test confirming an Editor session is redirected out of `/admin/users` even by typing the URL directly. `responsive.spec.js` formalizes Phase 11's manual overflow check as a real test (8 public routes × 6 admin routes × 3 viewports). 50 tests, all passing, confirmed repeatable two runs in a row back-to-back (not just once) after fixing two real issues the suite itself surfaced while being built: (1) `test.describe.serial` does *not* share a `page`/session across tests by default — a fresh `page` fixture per test meant the login in test 1 never carried into test 2; fixed with the standard Playwright pattern of one shared `page` created in `beforeAll` for the whole serial block; (2) running the suite twice in a row hit the real, working 8-attempts/5-minute login rate limiter (`backend/api/middleware/rate_limit.php`) — correct behavior, but it made the suite itself non-repeatable, so `e2e/global-setup.js` now clears that file-based limiter state before each run, exactly as a developer would manually per the README's troubleshooting note. `database/seed.sql` also gained a seeded `editor1` account (role_id=2) specifically so the RBAC test — and manual two-role testing generally — works without a manual setup step.

**Phase 14 in detail:** `docs/DEPLOYMENT.md` — a from-scratch cPanel deployment guide, not run against a real hosting panel from this environment (no live network access to one here), but built from and cross-checked against the actual `.htaccess`/config files already in this repo rather than written speculatively. Documents the deployment layout `frontend/public/.htaccess` already assumes (`api/`, `config/`, `includes/`, `storage/` as siblings directly under the web root, alongside the built frontend), `.env` setup with an explanation of why `APP_ENV=production` and `ALLOWED_ORIGINS` specifically matter (not just "set these"), why HTTPS has to be live *before* admin login will work at all (the session cookie's `Secure` flag is unconditional once `APP_ENV !== 'development'` — `backend/includes/security.php`), and a concrete post-deploy verification checklist (curl checks for the protective `.htaccess` files, the sitemap, security headers; browser checks for the enquiry write path and CORS).

Writing it surfaced one real gap, fixed rather than just noted: `Strict-Transport-Security` was only ever being set from PHP in `api/index.php`, so it covered `/api/*` responses but never the actual HTML pages Apache serves directly (`index.html`, routed pages) — a browser's HSTS behavior is driven by the top-level page response, so the header was effectively not doing its job. Added unconditionally to `frontend/public/.htaccess` too (safe to hardcode there specifically because that file is documented as production-only — local dev never goes through Apache). Also added `Require all denied` `.htaccess` files to `backend/config/`, `backend/includes/`, and `backend/storage/` (mirroring the `.htaccess` `backend/api/uploads/` already had) — the deployment layout this guide documents places those folders under the web root as siblings of `api/`, so without an explicit deny they'd be physically reachable by URL even though nothing in the app ever routes to them.

Each phase ends in a working, committed state — not one giant final commit (spec §52).

---

## O. Assumptions & Placeholders

**Cannot verify (no live network access from this environment to giisindia.in or any reference site — confirmed blocked by environment egress policy, not skipped by choice):**
- Exact existing page inventory, existing URLs, existing SEO metadata, existing images, existing testimonials/team bios, existing contact details on the live giisindia.in. → `redirects` table and CMS are built to receive this data once supplied; nothing existing is assumed or fabricated.
- The official logo file (a rendering was shared in chat but not as a usable asset file). → color tokens above are derived from the visible navy/gold in that rendering, cross-checked against a verified accessible navy+gold palette match; the actual logo file (SVG preferred) must be added to `frontend/public/assets/` before Phase 2 header/footer implementation is considered final.
- Visual/UX specifics of threatsys.ai, threatsysone.com, craw.in, isoeh.com — same network restriction. Direction taken from the brief's own description of each (premium dark navy/gold cybersecurity brand; highly interactive scroll storytelling; cybersecurity-education IA patterns) plus verified design-system tooling output, not a live visual crawl. Recommend a follow-up pass once network access or manually-supplied screenshots are available.

**Explicitly placeholder, per spec §51/§13 (must not be fabricated as fact):**
- All homepage statistics (`statistics` table seed values = `[UPDATE BEFORE LAUNCH]`).
- All course long-form content beyond title/category/level/certification-name scaffolding (`[GIIS COURSE DESCRIPTION]`, `[ADD COURSE DURATION]`, etc.) — the 23 courses from spec §5 are seeded as real rows with real titles/categories so the catalogue/filtering is testable, but descriptions/curricula/outcomes are placeholder text pending GIIS-supplied content.
- Faculty/leadership bios, photos, testimonials, career salary claims, certification prerequisites not explicitly supplied.
- Legal page copy (privacy/terms/cookie/disclaimer/refund) — structural placeholders only; final copy requires legal review per spec §43.
- The two ISO 27001 Lead Auditor listings are kept as separate `courses` rows (`is_duplicate_suspect = true`) pending GIIS confirmation.

**Configurable-by-design (not hardcoded anywhere in the React app):** homepage section visibility/copy, hero slides, featured/best-seller/new course flags and display order, all statistics, all testimonials, all team members, all FAQs, all events/resources, all SEO fields, redirects, site-wide settings (contact info, social links).

**Deliberate technical decisions surfaced for visibility (not silent):**
- Build-time prerendering added to the "React + Vite + React Router" stack for SEO (§L) — the spec bans Next.js specifically; prerendering static HTML from the existing SPA build satisfies "no Next.js, stays cPanel-friendly" while not shipping an unindexable client-only site.
- Polymorphic relationship/SEO tables (§E) traded FK-level referential integrity for avoiding a combinatorial explosion of junction tables — integrity enforced at the API layer instead.
