import { test, expect } from '@playwright/test'

/**
 * Formalizes the manual overflow check from Phase 11 (docs/ARCHITECTURE.md
 * §N) — every public and admin route at four breakpoints, checked for
 * horizontal overflow via scrollWidth vs. clientWidth. This is exactly
 * the check that caught the AdminLayout min-w-0 flexbox bug; keeping it
 * as a real test means a regression there fails CI, not a future manual
 * pass someone forgets to run.
 */
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1280, height: 800 },
}

const PUBLIC_ROUTES = ['/', '/about', '/courses', '/certifications', '/careers', '/knowledge-center', '/faq', '/contact']

const ADMIN_ROUTES = ['/admin', '/admin/courses', '/admin/knowledge', '/admin/careers', '/admin/certifications', '/admin/faqs']

async function assertNoHorizontalOverflow(page, path) {
  await page.goto(path, { waitUntil: 'networkidle' })
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(scrollWidth, `${path} overflows horizontally at ${clientWidth}px`).toBeLessThanOrEqual(clientWidth + 2)
}

for (const [name, viewport] of Object.entries(VIEWPORTS)) {
  test.describe(`No horizontal overflow — ${name} (${viewport.width}px)`, () => {
    test.use({ viewport })

    for (const route of PUBLIC_ROUTES) {
      test(`public: ${route}`, async ({ page }) => {
        await assertNoHorizontalOverflow(page, route)
      })
    }
  })
}

test.describe.serial('No horizontal overflow — admin routes (all viewports, one session)', () => {
  /** @type {import('@playwright/test').Page} */
  let page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/admin/login')
    await page.fill('#username', 'superadmin')
    await page.fill('#password', 'GiisAdmin#2026!')
    await page.click('button[type=submit]')
    await page.waitForURL('**/admin')
  })

  test.afterAll(async () => {
    await page.close()
  })

  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    for (const route of ADMIN_ROUTES) {
      test(`${name} (${viewport.width}px): ${route}`, async () => {
        await page.setViewportSize(viewport)
        await assertNoHorizontalOverflow(page, route)
      })
    }
  }
})
