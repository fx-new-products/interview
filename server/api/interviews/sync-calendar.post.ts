import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { interviews } from '~~/server/database/schema'
import { fetchCalendarEvents } from '~~/server/utils/google-calendar'
import { parseRecruitEvent } from '~~/server/utils/event-parser'
import { nameToInitials } from '~~/server/utils/initials'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ fromDaysAgo?: number; toDaysAhead?: number }>(event).catch(() => ({}))
  const fromDaysAgo = body?.fromDaysAgo ?? 7
  const toDaysAhead = body?.toDaysAhead ?? 30

  const now = Date.now()
  const from = new Date(now - fromDaysAgo * 86400_000)
  const to = new Date(now + toDaysAhead * 86400_000)

  // oauth2-proxy 経由のログインユーザー (X-Email) を優先。dev のダミー email は除外して
  // NUXT_CALENDAR_ID (.env.local) にフォールバック。前提: refresh_token 所有者が対象
  // ユーザーのカレンダーに閲覧権限を持っていること (freedom.co.jp 内で共有済み)。
  const config = useRuntimeConfig()
  const authEmail = event.context.auth?.email
  const isDevDummy = authEmail === 'dev@freedom.co.jp'
  const calendarId = (!isDevDummy && authEmail) || config.calendarId || 'primary'

  const events = await fetchCalendarEvents(from, to, { query: '[recruit]', calendarId })

  let created = 0
  let updated = 0
  let skipped = 0

  for (const ev of events) {
    const parsed = parseRecruitEvent(ev.summary)
    if (!parsed) {
      skipped++
      continue
    }

    const { initials, hash } = await nameToInitials(parsed.candidateName)
    const status: 'scheduled' | 'cancelled' | 'completed' =
      ev.status === 'cancelled' ? 'cancelled' : ev.start.getTime() < now ? 'completed' : 'scheduled'

    const [existing] = await db
      .select()
      .from(interviews)
      .where(eq(interviews.calendarEventId, ev.id))

    if (existing) {
      await db
        .update(interviews)
        .set({
          candidateInitials: initials,
          candidateName: parsed.candidateName,
          candidateHash: hash,
          stage: parsed.stage,
          location: parsed.location,
          position: parsed.position,
          calendarUrl: ev.htmlLink,
          scheduledAt: ev.start,
          status: existing.status === 'completed' ? existing.status : status,
          updatedAt: new Date(),
        })
        .where(eq(interviews.id, existing.id))
      updated++
    } else {
      await db.insert(interviews).values({
        calendarEventId: ev.id,
        candidateInitials: initials,
        candidateName: parsed.candidateName,
        candidateHash: hash,
        stage: parsed.stage,
        location: parsed.location,
        position: parsed.position,
        calendarUrl: ev.htmlLink,
        scheduledAt: ev.start,
        status,
      })
      created++
    }
  }

  return { created, updated, skipped, total: events.length }
})
