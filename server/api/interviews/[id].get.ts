import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviews, interviewScores } from '~~/server/database/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }
  const [row] = await db.select().from(interviews).where(eq(interviews.id, id))
  if (!row) throw createError({ statusCode: 404, statusMessage: 'not found' })

  const scoreRows = await db
    .select()
    .from(interviewScores)
    .where(eq(interviewScores.interviewId, id))

  const scores: Record<string, { score: number | null; note: string | null }> = {}
  for (const s of scoreRows) {
    scores[s.questionKey] = { score: s.score, note: s.note }
  }

  return { ...row, scores }
})
