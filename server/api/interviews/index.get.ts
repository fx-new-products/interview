import { and, desc, gte, lte, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviews } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const conds = []
  if (typeof q.status === 'string' && q.status) conds.push(eq(interviews.status, q.status as any))
  if (typeof q.from === 'string' && q.from) conds.push(gte(interviews.scheduledAt, new Date(q.from)))
  if (typeof q.to === 'string' && q.to) conds.push(lte(interviews.scheduledAt, new Date(q.to)))

  const rows = await db
    .select()
    .from(interviews)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(interviews.scheduledAt))

  return rows
})
