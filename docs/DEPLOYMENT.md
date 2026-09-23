# Deploying GIIS India to cPanel

This is Phase 14 of the build (`docs/ARCHITECTURE.md` §N) — a from-scratch
deployment guide for a standard shared-hosting cPanel account: Apache +
PHP 8.x + MySQL/MariaDB, no Node.js required at runtime (the React app is
built to static files locally, before upload). Nothing in this guide has
been run against a real cPanel account from this environment (no live
network access to a hosting panel here) — it's built from the actual,
tested `.htaccess`/config files already in this repo, cross-checked
against how cPanel hosting conventionally works. **Treat the first real
deploy as a rehearsal**: follow the verification checklist at the end
before pointing DNS at it or calling it done.

## 1. What you need before you start

- A cPanel account with:
  - PHP **8.1 or newer** available via *MultiPHP Manager* (this project uses PHP 8.4 in local testing; anything 8.1+ works — no 8.4-only syntax is used)
  - The `pdo_mysql` PHP extension enabled (check under *MultiPHP INI Editor* → *Installed extensions*, or `php -m | grep pdo_mysql` if you have SSH)
  - A MySQL/MariaDB database you can create (cPanel → *MySQL Databases*)
  - `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires` enabled — standard on virtually all cPanel hosts, but if a check in §6 below fails unexpectedly, this is the first thing to ask your host about
  - Ideally SSH access (makes steps 3–5 much faster); File Manager + phpMyAdmin work too, just slower
- Node.js **18+** on your own machine (or CI), only to run `npm run build` — **not** needed on the server
- A domain (or subdomain) pointed at the cPanel account, ideally with AutoSSL / Let's Encrypt already issuing a certificate for it (§7)

## 2. Understand the deployment layout first

This matters more than it looks — get it wrong and you'll either 404
everything or accidentally serve PHP source/config files to the public.

`frontend/public/.htaccess` (which becomes your site's root `.htaccess`
once deployed) assumes this exact layout, with **everything living under
one `public_html/`** (or whatever your account's document root is):

```
public_html/
├── .htaccess              ← frontend/public/.htaccess (deployed)
├── index.html              ┐
├── favicon.svg              } frontend/dist/* (the built React app)
├── robots.txt                │
├── assets/                  ┘
│
├── api/                    ← backend/api/* (index.php, .htaccess, sitemap.php, uploads/)
├── config/                 ← backend/config/* (config.php, db.php)
├── includes/               ← backend/includes/*
├── storage/                ← backend/storage/ (rate-limiter state — starts empty)
└── cron/                   ← backend/cron/ (currently empty, reserved for future use)
```

`backend/api/index.php` and friends use **relative** paths
(`__DIR__ . '/../config/config.php'`, etc.) to find `config/`/`includes/`,
so this sibling-folder structure — `api/`, `config/`, `includes/`,
`storage/` all directly under the same parent — has to be preserved
exactly. Don't flatten it, don't nest `backend/` as a subfolder inside
`public_html/` (i.e. **not** `public_html/backend/api/...`) — the paths
won't resolve.

**Security note on this layout**: `config/`, `includes/`, `storage/`, and
`cron/` end up physically inside the web root with this approach. That's
why this repo ships `.htaccess` files in each of those folders
(`Require all denied`) — Apache refuses to serve anything inside them
directly, no matter what URL is requested; only PHP's own `require()`
calls from `api/index.php` can read them. **Verify these four
`.htaccess` files actually made it into your upload** (§4) — they're the
only thing standing between "world-readable if visitors know the path"
and "genuinely unreachable." If your host supports it and you want a
stronger boundary, see the symlink alternative at the end of §4.

## 3. Build the frontend locally

```bash
cd frontend
npm install
npm run build
```

This produces `frontend/dist/` — a fully static site (HTML/CSS/JS, no
build step needed on the server). Before uploading, sanity-check it
locally:

```bash
npm run preview
```

Visit the printed URL and click through a few routes.

## 4. Upload the files

Using SSH (`rsync`/`scp`) is far less error-prone than File Manager's
drag-and-drop for this many files — use it if you have it.

1. Upload the **contents** of `frontend/dist/` to `public_html/` (the
   files themselves — `index.html`, `assets/`, etc. — not a `dist/`
   subfolder).
2. Upload `backend/api/`, `backend/config/`, `backend/includes/` to
   `public_html/api/`, `public_html/config/`, `public_html/includes/`
   respectively. **Do not upload `backend/vendor/`** — it only exists for
   the PHPUnit dev dependency (`backend/composer.json`) and has no
   runtime purpose; leaving it off is correct, not an oversight.
3. Create `public_html/storage/ratelimit/` (empty directory — it
   populates itself) and upload `backend/storage/.htaccess` into
   `public_html/storage/`.
4. Create `public_html/api/uploads/` if it doesn't already exist from
   step 2, and confirm `backend/api/uploads/.htaccess` is present inside
   it — this is what stops an uploaded file from ever being executed as
   PHP (`docs/ARCHITECTURE.md` §M).
5. **Verify all four protective `.htaccess` files are present** —
   `public_html/config/.htaccess`, `public_html/includes/.htaccess`,
   `public_html/storage/.htaccess`, `public_html/api/uploads/.htaccess`
   — before doing anything else. A quick check once the site is live:
   `curl -I https://yourdomain/config/config.php` should come back
   `403 Forbidden`, not `200`.

**If your host allows placing files outside `public_html/`** (most cPanel
accounts can — your home directory has siblings of `public_html/`), a
stronger alternative to the `.htaccess`-deny approach: move
`config/`, `includes/`, `storage/`, `cron/` to e.g.
`~/giisindia-app/` (outside the web root entirely — no URL can ever reach
them, `.htaccess` or not), and in `public_html/`, replace the real `api/`
folder with a **symlink** to `~/giisindia-app/api/` (`ln -s
~/giisindia-app/api ~/public_html/api` over SSH). PHP resolves `__DIR__`
through symlinks to the real path, so `api/index.php`'s relative
`../config/config.php` still finds `~/giisindia-app/config/config.php`
correctly — nothing in the code needs to change. This is optional (the
`.htaccess`-deny layout above is genuinely safe on its own) but worth
doing if your host supports it.

## 5. Set up the database

1. cPanel → *MySQL Databases*: create a database (e.g.
   `youruser_giisindia`) and a database user with a strong, generated
   password — cPanel prefixes both with your account username
   automatically. Add the user to the database with **All Privileges**.
2. Load the schema and seed data, via phpMyAdmin's Import tab (select the
   file, click Go) or SSH:
   ```bash
   mysql -u youruser_dbuser -p youruser_giisindia < database/schema.sql
   mysql -u youruser_dbuser -p youruser_giisindia < database/seed.sql
   ```
   Same two-file order as local dev (README §3.3) — `schema.sql` first
   (tables + RBAC seed), then `seed.sql` (real course/career/etc. content
   **and** the default Super Admin + Editor logins).
3. **Change both seeded passwords immediately** once you can log in
   (§8) — `superadmin` / `GiisAdmin#2026!` and `editor1` /
   `EditorPass123!` are placeholder credentials committed to this
   repo's source control specifically so local setup and the e2e test
   suite (`frontend/e2e/admin.spec.js`) work out of the box. They must
   never reach a real production login screen unchanged.

## 6. Configure `.env`

Create `public_html/.env` (**not** via File Manager's "New File" if it
strips the leading dot — use SSH `touch .env` if File Manager gives you
trouble, or upload it as a renamed file and rename back). Base it on
`.env.example`:

```
APP_ENV=production
APP_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=youruser_giisindia
DB_USER=youruser_dbuser
DB_PASSWORD=<the strong password from step 5>

ALLOWED_ORIGINS=https://yourdomain.com

SESSION_NAME=giisindia_session
SESSION_SECRET=<generate a long random string — e.g. `openssl rand -hex 32`>
```

A few of these matter more than they look:

- **`APP_ENV=production`** (not `development`) — this is what makes
  `backend/api/index.php` send the `Strict-Transport-Security` header
  (§7) and switches `display_errors` off / suppresses stack traces from
  ever reaching a response (`docs/ARCHITECTURE.md` §M/§10 — the global
  exception handler still logs full detail server-side regardless).
- **`ALLOWED_ORIGINS`** — CORS is checked against this exact list
  (`backend/api/index.php`). If it doesn't include your real domain
  (with the right scheme/`https://`), every admin API call will fail
  with a CORS error in the browser console even though the request
  reaches the server fine.
- **`SESSION_SECRET`** — not currently read anywhere in the codebase as
  of this phase (sessions are PHP's native file-based session storage,
  keyed by the auto-generated session ID, not a signed token), but it's
  in `.env.example` for forward compatibility if that changes. Set it to
  something real anyway rather than leaving it as the local-dev
  placeholder value.

Confirm `.env` is not web-readable the same way you checked `config/` in
§4: `curl -I https://yourdomain/.env` should **not** return your database
password. (It shouldn't be possible to request at all — `.env` has no
route — but this is cheap to verify once, and cPanel's default Apache
config sometimes protects dotfiles by default *and* sometimes doesn't,
depending on the host.) If it does come back readable, add to your root
`.htaccess`:
```apache
<Files ".env">
  Require all denied
</Files>
```

## 7. HTTPS

cPanel → *SSL/TLS Status* → *Run AutoSSL* (or check it's already issued —
most cPanel hosts auto-provision Let's Encrypt certificates). Then
cPanel → *Domains* → toggle **Force HTTPS Redirect** for the domain, so
plain `http://` requests 301 to `https://`.

This isn't optional cosmetic polish here: `start_secure_session()`
(`backend/includes/security.php`) marks the session cookie `Secure` in
any environment where `APP_ENV !== 'development'` — meaning **the admin
login cookie will not work at all over plain HTTP once `APP_ENV=production`
is set**. HTTPS has to be live and working before you can sign in to the
admin CMS on the deployed site.

## 8. First login and immediate cleanup

1. Visit `https://yourdomain.com/admin/login`, sign in as `superadmin`
   (§5.3's credentials), and immediately change the password: Users →
   click your own row → set a new password (10+ characters, enforced
   server-side in `backend/api/handlers/users.php`).
2. Do the same for `editor1`, or delete it entirely if you don't need a
   second seeded account in production (Users → Delete — note you can't
   delete the account you're currently signed in as, so do this from the
   Super Admin session).
3. Work through the placeholder content the seed data intentionally
   ships with obvious markers for (`[GIIS COURSE DESCRIPTION]`, `[ADD
   COURSE DURATION]`, `[UPDATE BEFORE LAUNCH]` statistics, etc. — the
   full list is in `docs/ARCHITECTURE.md` §O) via the admin CMS before
   treating the site as launch-ready. None of it is meant to go live
   as-is.

## 9. Post-deploy verification checklist

Run through this in order — each step assumes the previous one passed.
Replace `yourdomain.com` throughout.

```bash
# 1. Frontend loads
curl -I https://yourdomain.com/                         # expect 200

# 2. API is reachable and hitting the real database
curl -s https://yourdomain.com/api/homepage | head -c 200   # expect {"success":true,...

# 3. Protective .htaccess files are actually blocking direct access
curl -I https://yourdomain.com/config/config.php         # expect 403
curl -I https://yourdomain.com/includes/security.php     # expect 403
curl -I https://yourdomain.com/storage/                  # expect 403
curl -I https://yourdomain.com/.env                      # expect 403 or 404, never your DB password

# 4. Sitemap generates from the real (now-changed) content
curl -s https://yourdomain.com/sitemap.xml | grep -c "<url>"   # expect a number > 0

# 5. Security headers are present (Apache is honoring .htaccess)
curl -sI https://yourdomain.com/ | grep -i "x-frame-options\|content-security-policy\|strict-transport-security"

# 6. robots.txt references the real sitemap
curl -s https://yourdomain.com/robots.txt
```

Then in a real browser:

- Log in to `/admin/login`, confirm the dashboard stat cards show real
  numbers (not the seeded placeholder-only counts), sign out.
- Submit the public enquiry form (`/enquire`) once with real-looking
  test data, then confirm it shows up under Admin → Enquiries — this
  exercises the full public-facing write path end to end (rate limiter,
  validation, DB insert, admin read).
- Open dev tools' Network tab on a few pages and confirm no CORS errors
  and no mixed-content (`http://`) warnings.

If anything in this checklist fails, it is almost always one of: `.env`
values (§6), the `ALLOWED_ORIGINS` CORS list, HTTPS not actually forced
yet, or a `.htaccess` file that didn't survive the upload — check those
four before assuming it's a code issue.

## 10. Redeploying after a change

- **Frontend-only change**: `npm run build` locally, then replace
  `public_html/index.html` and `public_html/assets/` with the new build
  output (the hashed filenames in `assets/` mean old and new versions
  can briefly coexist without breaking in-flight requests — but don't
  leave stale hashed files around indefinitely). `index.html` itself is
  set to never cache (`frontend/public/.htaccess`), so the new build is
  picked up on the next page load.
- **Backend-only change**: replace the changed file(s) under
  `public_html/api/`, `config/`, or `includes/` directly — no build step,
  no restart needed (PHP is interpreted per-request by Apache/`mod_php`
  or PHP-FPM).
- **Schema change**: write a new file under `database/migrations/`
  (per `docs/ARCHITECTURE.md` §L's stated convention — this repo has no
  migrations yet since the schema hasn't changed post-Phase-1) rather
  than hand-editing the live database; run it via phpMyAdmin/SSH the
  same way as the initial schema/seed load.

## 11. Known limitations to carry into any go-live decision

These are documented as deliberate, in-scope trade-offs elsewhere in this
repo (`docs/ARCHITECTURE.md` §N/§O) — repeating them here because a
deployment guide is exactly where someone decides whether they're
acceptable for a specific launch:

- **The public-facing site does not yet read from the live database.**
  Phases 2–6 built the entire public site against placeholder data
  modules (`frontend/src/data/*Placeholder.js`); the admin CMS (Phase 7)
  and the API (Phase 8) are both real and both write to the real
  database, but nothing on the public site fetches from it yet. Content
  edited through the admin CMS will not appear on the live public pages
  until that wiring is done — **this is very likely a blocker for a real
  launch**, not a cosmetic gap, and should be resolved before pointing a
  real domain at this for real traffic.
- **No true 404 HTTP status for unmatched client-side routes** — the SPA
  fallback in `frontend/public/.htaccess` serves `index.html` (200) for
  any path Apache doesn't recognize as a real file, and React Router then
  renders a "not found" view client-side with a `noindex` meta tag as a
  search-engine mitigation. Full build-time prerendering (documented as
  deferred in `docs/ARCHITECTURE.md` §N, for the same "public site isn't
  wired to real data yet" reason above) would fix this properly.
- **The CSP header** (`docs/ARCHITECTURE.md` §10) was written against
  this app's known resource list (self + Google Fonts) but has only run
  against `php -S`/Vite dev in this environment, where `.htaccess` isn't
  processed at all — check the browser console for CSP violations on
  first real load and adjust `frontend/public/.htaccess` if anything
  legitimate gets blocked.
