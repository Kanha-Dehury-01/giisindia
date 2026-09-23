import { existsSync, readdirSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Runs once before the whole suite. Clears the backend's file-based auth
 * rate limiter (backend/storage/ratelimit/ — see
 * backend/api/middleware/rate_limit.php) so re-running this suite twice
 * in a row doesn't fail on a 429 from the previous run's login attempts;
 * the limiter is a real, working protection (8 attempts/5min per IP) and
 * this suite's own logins count against it just like a real user's would.
 * Safe to delete: it's regenerated automatically and holds no real data.
 */
export default function globalSetup() {
  const dir = path.resolve(fileURLToPath(import.meta.url), '../../../backend/storage/ratelimit')
  if (!existsSync(dir)) return
  for (const file of readdirSync(dir)) {
    if (file.endsWith('.json')) unlinkSync(path.join(dir, file))
  }
}
