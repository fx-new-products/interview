import { and, eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviewScores, interviews } from '~~/server/database/schema'
import { QUESTIONS } from '~~/server/constants/questions'

const VALID_KEYS = new Set(QUESTIONS.map((q) => q.key))

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const questionKey = getRouterParam(event, 'questionKey') || ''
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }
  if (!VALID_KEYS.has(questionKey)) {
    throw createError({ statusCode: 400, statusMessage: `unknown question key: ${questionKey}` })
  }

  const body = await readBody<{ score?: number | null; note?: string | null }>(event)
  const score = typeof body?.score === 'number' ? body.score : null
  const note = typeof body?.note === 'string' ? body.note : null

  if (score !== null && (score < 1 || score > 4)) {
    throw createError({ statusCode: 400, statusMessage: 'score must be 1-4' })
  }

  const [existing] = await db
    .select()
    .from(interviewScores)
    .where(and(eq(interviewScores.interviewId, id), eq(interviewScores.questionKey, questionKey)))

  let row
  if (existing) {
    ;[row] = await db
      .update(interviewScores)
      .set({ score, note, updatedAt: new Date() })
      .where(eq(interviewScores.id, existing.id))
      .returning()
  } else {
    ;[row] = await db
      .insert(interviewScores)
      .values({ interviewId: id, questionKey, score, note })
      .returning()
  }

  // bump parent updated_at for sorting
  await db.update(interviews).set({ updatedAt: new Date() }).where(eq(interviews.id, id))

  return row
})
