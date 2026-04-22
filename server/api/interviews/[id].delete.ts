import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviews } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }
  const res = await db.delete(interviews).where(eq(interviews.id, id)).returning({ id: interviews.id })
  if (!res.length) throw createError({ statusCode: 404, statusMessage: 'not found' })
  return { deleted: res[0]!.id }
})
