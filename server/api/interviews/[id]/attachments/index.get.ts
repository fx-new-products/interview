import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviewAttachments } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }
  return db.select().from(interviewAttachments).where(eq(interviewAttachments.interviewId, id))
})
