import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { db } from '~~/server/utils/db'
import { interviewAttachments } from '~~/server/database/schema'

const UPLOAD_DIR = 'data/attachments'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid id' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'no files uploaded' })
  }

  const results = []
  for (const file of formData) {
    if (!file.filename || !file.data) continue

    const dir = join(UPLOAD_DIR, String(id))
    mkdirSync(dir, { recursive: true })

    const ts = Date.now()
    const safeName = `${ts}_${file.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    writeFileSync(join(dir, safeName), file.data)

    const [row] = await db
      .insert(interviewAttachments)
      .values({
        interviewId: id,
        fileName: safeName,
        originalName: file.filename,
        mimeType: file.type || 'application/octet-stream',
        size: file.data.length,
      })
      .returning()

    results.push(row)
  }

  return results
})
