import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../utils/db'

export default defineNitroPlugin(() => {
  try {
    migrate(db, { migrationsFolder: 'server/database/migrations' })
    console.log('[migrate] applied')
  } catch (e) {
    console.error('[migrate] failed', e)
  }
})
