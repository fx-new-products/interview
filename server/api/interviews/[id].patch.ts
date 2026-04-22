import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviews } from '~~/server/database/schema'

const ALLOWED = [
  'stage',
  'location',
  'position',
  'status',
  'interviewerInitials',
  'decision',
  'goodNotes',
  'concernNotes',
  'availabilityNotes',
  'overallAiAptitude',
  'overallCommunication',
  'overallTotal',
] as const

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }
  const body = await readBody<Record<string, unknown>>(event)
  const patch: Record<string, unknown> = { updatedAt: new Date() }
  for (const k of ALLOWED) {
    if (k in body) patch[k] = body[k]
  }

  const [row] = await db.update(interviews).set(patch).where(eq(interviews.id, id)).returning()
  if (!row) throw createError({ statusCode: 404, statusMessage: 'not found' })
  return row
})
