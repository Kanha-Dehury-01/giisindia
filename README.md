# GIIS India — Website

Production website for **GIIS (educational wing of Threatsys)** — a React (Vite) frontend backed by a PHP + MySQL/MariaDB REST API, with a full content-management admin panel. Marketing + course-discovery + enquiry site — no payments, no student login/LMS.

## Current build status

This repo is being built in phases (tracked in `docs/ARCHITECTURE.md` §N). As of now:

| Phase | Status |
|---|---|
| 1 — Architecture + database schema + design tokens | ✅ Done (`docs/ARCHITECTURE.md`, `database/schema.sql`) |
| 2 — Frontend shell (Vite/React/Tailwind scaffold, full route tree, layout) | ✅ Done (`frontend/`) |
| 3 — Homepage (all 20 sections, motion system, three-slide hero) | ✅ Done |
| 4 — Course catalogue (search/filter/sort/pagination) + detail pages | ✅ Done |
| 5 — Knowledge Center hub, real search, article template | ✅ Done |
| 6 — Career paths, learning paths, certification explorer, glossary | ✅ Done |
| 8 — PHP API + database (real backend, live MySQL/MariaDB) | ✅ Done (`backend/`, `database/seed.sql`) |
| 7 — Admin CMS (frontend, wired to the real API from Phase 8) | ⏳ Not yet started |
| 9–14 — SEO, security, responsive, performance, testing, deployment | ⏳ Not yet started |

**What you can actually run locally today:** the full database — schema *and* seed data (step 3.3) — and a real, tested PHP REST API (step 3.5) alongside the frontend dev server (step 3.6). The backend is genuine: 60+ endpoints across courses, the Knowledge Center + cross-content search, careers, learning paths, certifications, glossary, testimonials, team, FAQs, events, resources, and public enquiry submission, plus a fully RBAC-enforced `/admin/*` surface (session auth, CSRF via double-submit cookie, per-permission checks on every write, file-based auth/enquiry rate limiting, an audit log, and media upload with real MIME-sniffing and SVG script-injection rejection) — all backed by live MySQL/MariaDB, not mocks or in-memory fixtures. It was verified end-to-end against a real MariaDB instance: every public route, the full admin create/update/delete/publish path, Super Admin vs. Editor permission boundaries, CSRF rejection on a missing token, auth rate-limit lockout, and a malicious SVG upload actually being rejected.

The public-facing React site (Phases 2–6) still renders from the placeholder data modules in `frontend/src/data/` — it was intentionally built that way so each content phase could ship without waiting on the backend. Wiring those pages to fetch from the real API above, and building the admin CMS UI that edits that same data, is Phase 7's job next (deliberately sequenced after Phase 8, so the CMS is built against a real API instead of a temporary one).

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS v4 (`@theme` tokens) |
| Backend | PHP 8.x, PDO, hand-rolled REST router (no framework) |
| Database | MySQL 5.7+ / MariaDB 10.3+ |
| Auth | PHP sessions + CSRF tokens (no JWT, no third-party auth) |
| Hosting | Any standard Apache + PHP + MySQL cPanel host. No Node.js required in production (Vite build output is static). |

## 2. Requirements for local development (XAMPP)

Install [XAMPP](https://www.apachefriends.org/) (or an equivalent Apache + PHP + MySQL/MariaDB stack) with:

- PHP 8.1+ with the `pdo_mysql` extension enabled (default in XAMPP)
- MySQL/MariaDB (bundled with XAMPP)
- Apache (bundled with XAMPP)
- Node.js 18+ and npm — **only needed for the frontend dev server / production build**, not required by the PHP backend itself

## 3. Local setup, step by step

### 3.1 Get the code

```bash
git clone https://github.com/Kanha-Dehury-01/giisindia.git
cd giisindia
```

### 3.2 Start XAMPP

Open the XAMPP Control Panel and start **Apache** and **MySQL**.

### 3.3 Create the database and import the schema

Using the XAMPP shell (or `mysql` if it's on your PATH — on Windows this is typically `C:\xampp\mysql\bin\mysql.exe`, on macOS/Linux XAMPP it's under `/opt/lampp/bin/mysql`):

```bash
mysql -u root -p -e "CREATE DATABASE giisindia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p giisindia < database/schema.sql
```

(XAMPP's default MySQL root user usually has **no password** — just press Enter when prompted, or use phpMyAdmin at `http://localhost/phpmyadmin` and import `database/schema.sql` there instead of the command line.)

`schema.sql` creates all tables and seeds:
- The two default roles (Super Admin, Editor) and their permissions.
- The 20 homepage section placeholders.
- Six homepage statistics rows, all set to `[UPDATE BEFORE LAUNCH]` — replace with real, verified numbers before going live (see `docs/ARCHITECTURE.md` §O).

Then load the real content data:

```bash
mysql -u root -p giisindia < database/seed.sql
```

This seeds the 23 real GIIS courses (with curriculum/skills/tools/outcomes/FAQs), the 10 careers, 12 certifications, 7 learning paths (with steps), 15 Knowledge Center articles (with tags and cross-content relationships), 12 glossary terms, FAQs, the 3 hero slides, starter site settings, and — most importantly — **a default Super Admin login**:

```
Username: superadmin
Password: GiisAdmin#2026!
```

**Change this password immediately after your first login** (`PUT /api/admin/users/1`) — it is a placeholder shipped in source control, never a real production credential. All descriptive text (course descriptions, durations, bios, testimonial quotes, etc.) is an obvious `[PLACEHOLDER]` per the project brief — replace it with GIIS-supplied content via the admin CMS (Phase 7) before launch.

### 3.4 Configure environment variables

From the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your local DB credentials (for a fresh XAMPP install, `DB_USER=root` and `DB_PASSWORD=` — empty — is typical; don't use root in anything beyond local dev). `backend/config/config.php` loads this file automatically — it reads the project-root `.env` first, falling back to `backend/.env` if you'd rather keep it colocated with the API. **Never commit a real `.env`** — it's git-ignored; only `.env.example` (a template with no real secrets) is tracked.

### 3.5 Run the backend

**Quickest option — PHP's built-in server** (no Apache/vhost config needed, good for local dev):

```bash
php -S localhost:8000 -t backend
```

The API is then reachable at `http://localhost:8000/api/...`. This is exactly how the backend was tested during development (see "What you can actually run locally today" above).

**Or, via Apache/XAMPP:** point a vhost's document root at the `backend/` folder — or symlink/copy `backend/` into XAMPP's `htdocs` (e.g. `C:\xampp\htdocs\giisindia-api`). Make sure `mod_rewrite` is enabled (default in XAMPP). The API is then reachable at `http://localhost/giisindia-api/api/...` (or `http://localhost/api/...` if the vhost's document root points directly at `backend/`).

Either way, `backend/api/.htaccess` (Apache) or the router in `backend/api/index.php` handles the routing — all requests to `/api/*` go through the front controller at `backend/api/index.php`. A quick smoke test once the server is up:

```bash
curl http://localhost:8000/api/homepage
curl http://localhost:8000/api/courses
```

Both should return `{"success":true,"data":[...],...}` once `database/seed.sql` has been loaded.

### 3.6 Run the frontend dev server

```bash
cd frontend
npm install
npm run dev
```

This starts Vite's dev server at `http://localhost:5173`. You should see the GIIS shell — sticky header, mobile nav drawer below `lg` width, footer, and every route from `docs/ARCHITECTURE.md` §A resolving to a page. `/api/*` requests are proxied to `http://127.0.0.1` (see `vite.config.js`) so they'll reach the backend from step 3.5 once the frontend is wired to call it (Phase 7) — until then the public pages still render from `frontend/src/data/*Placeholder.js`, so nothing on the public site depends on the backend being up yet.

To produce a production build: `npm run build` (outputs to `frontend/dist/`, ready to deploy as static files per `frontend/public/.htaccess`).

### 3.7 Log in to the admin panel (API-level, until Phase 7's UI exists)

The `/admin/login` **page** is still a Phase 7 UI task, but the **API underneath it is real today**. You can authenticate against it directly:

```bash
curl -c cookies.txt -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"GiisAdmin#2026!"}'

curl -b cookies.txt http://localhost:8000/api/admin/courses
```

The login response includes a `csrf_token` — every non-GET admin request after that must send it back as an `X-CSRF-Token` header (double-submit-cookie pattern; see `docs/ARCHITECTURE.md` §M), e.g.:

```bash
curl -b cookies.txt -X PUT http://localhost:8000/api/admin/courses/1 \
  -H "Content-Type: application/json" -H "X-CSRF-Token: <token from login response>" \
  -d '{"is_featured": true}'
```

**Change the placeholder password immediately** (`PUT /api/admin/users/1`) — it is never a real credential to keep past initial setup.

## 4. What works today

Right now you can:
1. Follow steps 3.1–3.4 to stand up the database with real content (schema + seed) — every table from `docs/ARCHITECTURE.md` §E is present and populated.
2. Follow step 3.5 to run the real PHP API and exercise it directly with `curl` (public routes) or via the login flow above (admin routes) — see `backend/api/index.php` for the full route table.
3. Follow step 3.6 to run the frontend and click through the entire site's navigation, mobile menu, and every route — content is placeholder (from `frontend/src/data/`), but the shell, layout, accessibility (skip link, focus states, keyboard nav), and design tokens are real.
4. Read `docs/ARCHITECTURE.md` for the full sitemap, API surface, design tokens, and security/SEO architecture that the rest of the build follows.

Phase 7 will wire the frontend (both the public site and a new `/admin` CMS UI) to the API from step 3.5 — this file will be updated in place as that lands.

## 5. Project structure (see `docs/ARCHITECTURE.md` §C/§D for full detail)

```
giisindia/
├── frontend/               ✅ React + Vite + Tailwind app, full route tree (Phase 2)
├── backend/                ✅ PHP 8 REST API — config/, includes/ (security, CRUD, upload,
│                              validation), api/handlers/ (~20 files), api/index.php (router)
├── database/
│   ├── schema.sql           ✅ full fresh-install schema (37 tables)
│   ├── seed.sql              ✅ real course/career/certification/etc. content + admin user
│   └── migrations/           incremental migrations, once schema changes post-launch
├── docs/
│   └── ARCHITECTURE.md      ✅ sitemap, system/frontend/backend/CMS/SEO/security architecture
├── .env.example             ✅ environment variable template
└── README.md                this file
```

## 6. Troubleshooting

- **`mysql` command not found**: use phpMyAdmin (`http://localhost/phpmyadmin`) instead — click your new `giisindia` database, go to Import, and select `database/schema.sql`.
- **Foreign key errors on import**: make sure you're importing `database/schema.sql` in one shot (it sets `FOREIGN_KEY_CHECKS = 0` at the top and restores it at the end) rather than copy-pasting partial sections.
- **Port conflicts**: if Apache won't start because port 80 is taken, change XAMPP's Apache port in `httpd.conf`, or stop the conflicting service (commonly Skype or another local web server).
- **API returns `{"error":{"code":"db_unavailable",...}}`**: MySQL/MariaDB isn't running, or `.env`'s `DB_*` values don't match a real user/database. Confirm with `mysqladmin ping` and double-check `DB_NAME`/`DB_USER`/`DB_PASSWORD` against what you created in step 3.3.
- **`{"error":{"code":"csrf_mismatch",...}}` on an admin request**: every non-GET `/api/admin/*` (and any non-GET request besides login/enquiry submission) needs an `X-CSRF-Token` header matching the `csrf_token` from your login response (or `GET /api/csrf-token`) — see step 3.7.
- **`{"error":{"code":"rate_limited",...}}`**: the file-based limiter in `backend/api/middleware/rate_limit.php` caps login attempts and enquiry submissions per IP. During local testing this state lives in `backend/storage/ratelimit/` — delete that folder's contents to reset it.
