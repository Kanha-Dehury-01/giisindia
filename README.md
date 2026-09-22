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
| 7–8 — Admin CMS, PHP API | ⏳ Not yet started (`/admin/login` shell exists; no backend to authenticate against yet) |
| 9–14 — SEO, security, responsive, performance, testing, deployment | ⏳ Not yet started |

**What you can actually run locally today:** the database schema (step 3.3), and the frontend dev server (step 3.6) — the entire public-facing site is real and interactive: homepage, course catalogue with working search/filters/pagination and detail pages, the Knowledge Center hub with real cross-content search (courses/careers/certifications/learning paths/guides/glossary, ranked and category-tabbed) plus a global quick-search overlay, career path and learning path pages with visual roadmaps, the certification explorer, and the A-Z glossary. All of it runs on placeholder data shaped exactly like the matching database table, so Phase 8's real API swap-in is additive, not a rewrite. Only `/admin/*` and anything requiring the PHP backend (login, form submission, real content) aren't functional yet — that's Phase 7/8.

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

This creates all tables and seeds:
- The two default roles (Super Admin, Editor) and their permissions.
- The 20 homepage section placeholders.
- Six homepage statistics rows, all set to `[UPDATE BEFORE LAUNCH]` — replace with real, verified numbers before going live (see `docs/ARCHITECTURE.md` §O).

Once `database/seed.sql` lands (Phase 8), you'll also run:

```bash
mysql -u root -p giisindia < database/seed.sql
```

which will create a default admin login and seed the 23 GIIS courses from the spec with placeholder descriptions.

### 3.4 Configure environment variables

From the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your local DB credentials (for a fresh XAMPP install, `DB_USER=root` and `DB_PASSWORD=` — empty — is typical; don't use root in anything beyond local dev). `backend/config/config.php` (Phase 8) loads this file automatically.

### 3.5 Point Apache at the backend (once Phase 8 lands)

Point an Apache vhost's document root at the `backend/` folder — or symlink/copy `backend/` into XAMPP's `htdocs` (e.g. `C:\xampp\htdocs\giisindia-api` or `htdocs/giisindia-api`). Make sure `mod_rewrite` is enabled (it is by default in XAMPP). The API will then be reachable at:

```
http://localhost/giisindia-api/api/...
```

(or `http://localhost/api/...` if you point the vhost's document root directly at `backend/`).

`backend/api/.htaccess` handles the routing — all requests to `/api/*` go through `backend/api/index.php`.

### 3.6 Run the frontend dev server

```bash
cd frontend
npm install
npm run dev
```

This starts Vite's dev server at `http://localhost:5173`. You should see the GIIS shell — sticky header, mobile nav drawer below `lg` width, footer, and every route from `docs/ARCHITECTURE.md` §A resolving to a page (a placeholder page, until its content phase lands). `/api/*` requests are proxied to `http://127.0.0.1` (see `vite.config.js`) so they'll reach a backend once Phase 8 exists; until then, anything that calls the API (like `/admin/login`) will fail the request rather than break the page.

To produce a production build: `npm run build` (outputs to `frontend/dist/`, ready to deploy as static files per `frontend/public/.htaccess`).

### 3.7 Log in to the admin panel

Once Phase 8's seed data is in place, the admin panel will be reachable at `http://localhost:5173/admin/login` in dev (or `/admin/login` on the built site) with a placeholder Super Admin account documented in `database/seed.sql`'s comments at that time. **Change the placeholder password immediately** — it is never a real credential committed to source control.

## 4. What works today (before Phase 8 lands)

Right now you can:
1. Follow steps 3.1–3.4 to stand up the database and inspect the schema (via phpMyAdmin, or any MySQL client) — every table from `docs/ARCHITECTURE.md` §E should be present.
2. Follow step 3.6 to run the frontend and click through the entire site's navigation, mobile menu, and every route — content is placeholder, but the shell, layout, accessibility (skip link, focus states, keyboard nav), and design tokens are real.
3. Read `docs/ARCHITECTURE.md` for the full sitemap, API surface, design tokens, and security/SEO architecture that the rest of the build follows.

Steps 3.5 and 3.7 will become real once Phase 8 lands — this file will be updated in place (not rewritten) as that phase's actual endpoints/commands are confirmed to match what's documented here.

## 5. Project structure (planned — see `docs/ARCHITECTURE.md` §C/§D for full detail)

```
giisindia/
├── frontend/               ✅ React + Vite + Tailwind app, full route tree (Phase 2)
├── backend/                PHP API (Phase 8)
├── database/
│   ├── schema.sql           ✅ full fresh-install schema (this exists now)
│   ├── seed.sql              demo/placeholder content (Phase 8)
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
