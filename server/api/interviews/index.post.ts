import { db } from '~~/server/utils/db'
import { interviews } from '~~/server/database/schema'
import { nameToInitials } from '~~/server/utils/initials'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    candidateName?: string
    stage?: string
    location?: string
    position?: string
    scheduledAt?: string | number
  }>(event)

  if (!body?.candidateName || !body?.scheduledAt) {
    throw createError({ statusCode: 400, statusMessage: 'candidateName and scheduledAt required' })
  }

  const { initials, hash } = await nameToInitials(body.candidateName)

  const [row] = await db
    .insert(interviews)
    .values({
      candidateInitials: initials,
      candidateHash: hash,
      stage: body.stage ?? null,
      location: body.location ?? null,
      position: body.position ?? null,
      scheduledAt: new Date(body.scheduledAt),
    })
    .returning()

  return row
})
