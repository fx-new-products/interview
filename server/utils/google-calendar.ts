import { google } from 'googleapis'

export function getOAuth2Client() {
  const config = useRuntimeConfig()
  if (!config.googleClientId || !config.googleClientSecret || !config.googleRefreshToken) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Google OAuth credentials are not configured. Set NUXT_GOOGLE_CLIENT_ID / _SECRET / _REFRESH_TOKEN.',
    })
  }
  const client = new google.auth.OAuth2(config.googleClientId, config.googleClientSecret)
  client.setCredentials({ refresh_token: config.googleRefreshToken })
  return client
}

export type RawCalendarEvent = {
  id: string
  summary: string
  start: Date
  status: 'confirmed' | 'tentative' | 'cancelled' | string
  htmlLink: string | null
}

export async function fetchCalendarEvents(
  from: Date,
  to: Date,
  opts: { query?: string } = {},
): Promise<RawCalendarEvent[]> {
  const config = useRuntimeConfig()
  const auth = getOAuth2Client()
  const calendar = google.calendar({ version: 'v3', auth })

  const res = await calendar.events.list({
    calendarId: config.calendarId || 'primary',
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
    q: opts.query,
  })

  const items = res.data.items ?? []
  return items
    .filter((e) => !!e.id && !!e.summary)
    .map((e) => {
      const startStr = e.start?.dateTime ?? e.start?.date ?? new Date().toISOString()
      return {
        id: e.id!,
        summary: e.summary!,
        start: new Date(startStr),
        status: (e.status ?? 'confirmed') as RawCalendarEvent['status'],
        htmlLink: e.htmlLink ?? null,
      }
    })
}
