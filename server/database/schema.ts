import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const interviews = sqliteTable('interviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  calendarEventId: text('calendar_event_id').unique(),
  candidateInitials: text('candidate_initials').notNull(),
  candidateName: text('candidate_name'),
  candidateHash: text('candidate_hash').notNull(),
  stage: text('stage'),
  location: text('location'),
  position: text('position'),
  calendarUrl: text('calendar_url'),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp_ms' }).notNull(),
  status: text('status', { enum: ['scheduled', 'completed', 'cancelled'] })
    .notNull()
    .default('scheduled'),
  interviewerInitials: text('interviewer_initials'),
  decision: text('decision', { enum: ['pass', 'hold', 'fail'] }),
  goodNotes: text('good_notes'),
  concernNotes: text('concern_notes'),
  availabilityNotes: text('availability_notes'),
  overallAiAptitude: integer('overall_ai_aptitude'),
  overallCommunication: integer('overall_communication'),
  overallTotal: integer('overall_total'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export const interviewScores = sqliteTable(
  'interview_scores',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    interviewId: integer('interview_id')
      .notNull()
      .references(() => interviews.id, { onDelete: 'cascade' }),
    questionKey: text('question_key').notNull(),
    score: integer('score'),
    note: text('note'),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    uniqueInterviewQuestion: uniqueIndex('uniq_interview_question').on(
      t.interviewId,
      t.questionKey,
    ),
  }),
)

export const interviewAttachments = sqliteTable('interview_attachments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  interviewId: integer('interview_id')
    .notNull()
    .references(() => interviews.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type'),
  size: integer('size'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export type Interview = typeof interviews.$inferSelect
export type NewInterview = typeof interviews.$inferInsert
export type InterviewScore = typeof interviewScores.$inferSelect
export type NewInterviewScore = typeof interviewScores.$inferInsert
export type InterviewAttachment = typeof interviewAttachments.$inferSelect
