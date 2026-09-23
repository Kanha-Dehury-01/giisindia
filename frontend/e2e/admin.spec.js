import { test, expect } from '@playwright/test'

const SUPERADMIN = { username: 'superadmin', password: 'GiisAdmin#2026!' }
const TEST_COURSE_TITLE = `E2E Test Course ${Date.now()}`

/**
 * Full admin CMS flow against a real backend + MariaDB (Phase 7/8) — not
 * mocked. Requires the seeded Super Admin + Editor accounts from
 * database/seed.sql and both dev servers running (README §7).
 *
 * Steps share a single page across the whole serial block (a fresh `page`
 * fixture per test, Playwright's default, would mean the login from step
 * 1 never carries over to step 2) — the standard pattern for a serial,
 * stateful flow like "log in once, then act on that session."
 */
test.describe.serial('Admin CMS', () => {
  /** @type {import('@playwright/test').Page} */
  let page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('logs in as the seeded Super Admin', async () => {
    await page.goto('/admin/login')
    await page.fill('#username', SUPERADMIN.username)
    await page.fill('#password', SUPERADMIN.password)
    await page.click('button[type=submit]')
    await page.waitForURL('**/admin')
    await expect(page.getByText('Welcome')).toBeVisible()
  })

  test('dashboard shows content-module stat cards', async () => {
    await expect(page.getByText('Courses', { exact: true }).first()).toBeVisible()
  })

  test('creates, edits content for, and deletes a course', async () => {
    await page.getByRole('link', { name: 'Courses', exact: true }).click()
    await page.waitForURL('**/admin/courses')
    await expect(page.locator('table tbody tr').first()).toBeVisible()
    const rowsBefore = await page.locator('table tbody tr').count()
    expect(rowsBefore).toBeGreaterThan(0)

    await page.getByText('+ New Course').click()
    await page.waitForURL('**/admin/courses/new')
    await page.locator('input[type=text]').first().fill(TEST_COURSE_TITLE)
    await page.getByRole('button', { name: 'Save Course Details' }).click()
    await expect(page).toHaveURL(/\/admin\/courses\/\d+$/)

    // Course content editor (curriculum/skills/FAQs) only appears once the
    // course exists — exercises the child-row replace path.
    await page.locator('textarea').first().fill('Outcome A\nOutcome B')
    await page.getByRole('button', { name: 'Save Content' }).click()
    await expect(page.getByText('Course content saved.')).toBeVisible()

    // Clean up: delete the course this test created.
    await page.getByRole('link', { name: 'Courses', exact: true }).click()
    await page.waitForURL('**/admin/courses')
    const row = page.locator('tr', { hasText: TEST_COURSE_TITLE })
    await row.getByText('Delete').click()
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText(TEST_COURSE_TITLE)).toHaveCount(0)
  })

  test('edits a generic resource (career) via the config-driven form', async () => {
    await page.getByRole('link', { name: 'Careers', exact: true }).click()
    await page.waitForURL('**/admin/careers')
    await page.locator('table tbody tr').first().getByText('Edit').click()
    await expect(page).toHaveURL(/\/admin\/careers\/\d+$/)
    await expect(page.getByText('Edit Career')).toBeVisible()
  })

  test('opens the reorderable learning-path step editor', async () => {
    await page.getByRole('link', { name: 'Learning Paths', exact: true }).click()
    await page.waitForURL('**/admin/learning-paths')
    await page.locator('table tbody tr').first().getByText('Edit').click()
    await expect(page).toHaveURL(/\/admin\/learning-paths\/\d+$/)
    await page.getByRole('button', { name: 'Edit Steps' }).click()
    await expect(page).toHaveURL(/\/admin\/learning-paths\/\d+\/steps$/)
    await expect(page.getByText('Step 1')).toBeVisible()
  })

  test('Enquiries, Media Library, Users, Site Settings, and Audit Log all load', async () => {
    for (const [label, urlPattern] of [
      ['Enquiries', '**/admin/enquiries'],
      ['Media Library', '**/admin/media'],
      ['Users', '**/admin/users'],
      ['Site Settings', '**/admin/settings'],
      ['Audit Log', '**/admin/audit-log'],
    ]) {
      await page.getByRole('link', { name: label, exact: true }).click()
      await page.waitForURL(urlPattern)
    }
    await expect(page.getByText('Signed in as GIIS Super Admin')).toBeVisible()
  })

  test('logs out and is redirected to login', async () => {
    await page.getByRole('button', { name: 'Sign out' }).click()
    await page.waitForURL('**/admin/login')
  })
})

test.describe('RBAC enforcement', () => {
  test('an Editor cannot reach Super-Admin-only screens, even by direct URL', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('#username', 'editor1')
    await page.fill('#password', 'EditorPass123!')
    await page.click('button[type=submit]')
    await page.waitForURL('**/admin')

    await expect(page.getByRole('link', { name: 'Users', exact: true })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Redirects', exact: true })).toHaveCount(0)

    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/admin$/)
  })
})
