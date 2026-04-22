import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviewAttachments } from '~~/server/database/schema'

const UPLOAD_DIR = 'data/attachments'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const attachmentId = Number(getRouterParam(event, 'attachmentId'))
  if (!Number.isFinite(id) || !Number.isFinite(attachmentId)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  const [att] = await db
    .select()
    .from(interviewAttachments)
    .where(eq(interviewAttachments.id, attachmentId))

  if (!att || att.interviewId !== id) {
    throw createError({ statusCode: 404, statusMessage: 'attachment not found' })
  }

  const filePath = join(UPLOAD_DIR, String(id), att.fileName)
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'file missing from disk' })
  }

  const data = readFileSync(filePath)
  setHeader(event, 'Content-Type', att.mimeType || 'application/octet-stream')
  setHeader(event, 'Content-Disposition', `inline; filename="${encodeURIComponent(att.originalName)}"`)
  return data
})
