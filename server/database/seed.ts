import { createHash } from 'node:crypto'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from '../utils/db'
import { interviews, interviewScores } from './schema'
import { QUESTIONS } from '../constants/questions'

type SeedRow = {
  candidateInitials: string
  stage: string
  location: string
  position: string | null
  daysOffset: number
  hour: number
  status: 'scheduled' | 'completed' | 'cancelled'
  interviewer?: string
  decision?: 'pass' | 'hold' | 'fail'
  scoreProfile?: 'high' | 'mid' | 'low' | 'mixed'
  goodNotes?: string
  concernNotes?: string
  availabilityNotes?: string
  overall?: { ai: number; comm: number; total: number }
}

const SEEDS: SeedRow[] = [
  {
    candidateInitials: 'A.S.',
    stage: '一次面接',
    location: 'web',
    position: 'FX_生成AI活用インターン',
    daysOffset: 5,
    hour: 14,
    status: 'scheduled',
  },
  {
    candidateInitials: 'B.T.',
    stage: '一次面接',
    location: '対面',
    position: 'FX_生成AI活用インターン',
    daysOffset: 3,
    hour: 10,
    status: 'scheduled',
    interviewer: 'K.U.',
  },
  {
    candidateInitials: 'C.M.',
    stage: '二次面接',
    location: 'web',
    position: 'FX_生成AI活用インターン',
    daysOffset: -2,
    hour: 15,
    status: 'completed',
    interviewer: 'K.U.',
    decision: 'pass',
    scoreProfile: 'high',
    overall: { ai: 4, comm: 3, total: 4 },
    goodNotes: 'プロンプトの工夫を試行錯誤したエピソードが具体的。自走力◎',
    concernNotes: '週4コミット可能か学期開始後に要確認',
    availabilityNotes: '月・水・金（10-18時）, 火木は授業',
  },
  {
    candidateInitials: 'D.K.',
    stage: '一次面接',
    location: 'web',
    position: 'FX_生成AI活用インターン',
    daysOffset: -4,
    hour: 11,
    status: 'completed',
    interviewer: 'K.U.',
    decision: 'hold',
    scoreProfile: 'mid',
    overall: { ai: 2, comm: 3, total: 2 },
    goodNotes: '素直で伸びしろは感じる',
    concernNotes: 'AI触った経験が薄い。具体的な試行錯誤の話が出てこなかった',
    availabilityNotes: '週3可',
  },
  {
    candidateInitials: 'E.N.',
    stage: '一次面接',
    location: '対面',
    position: 'FX_生成AI活用インターン',
    daysOffset: -6,
    hour: 16,
    status: 'completed',
    interviewer: 'K.U.',
    decision: 'fail',
    scoreProfile: 'low',
    overall: { ai: 1, comm: 2, total: 1 },
    goodNotes: '礼儀正しい',
    concernNotes: 'AI活用の動機が曖昧。流行りだからという回答以上が出てこず',
    availabilityNotes: '週2希望（要件と不一致）',
  },
  {
    candidateInitials: 'F.H.',
    stage: '一次面接',
    location: 'web',
    position: 'FX_生成AI活用インターン',
    daysOffset: -1,
    hour: 13,
    status: 'completed',
    interviewer: 'K.U.',
    scoreProfile: 'mixed',
    overall: { ai: 3, comm: 2, total: 3 },
    goodNotes: 'AIの指示工夫を具体例付きで説明できた',
    concernNotes: '報連相の感覚はこれから慣れが必要そう',
    availabilityNotes: '水木金（10-17時）',
  },
  {
    candidateInitials: 'G.O.',
    stage: '一次面接',
    location: 'web',
    position: null,
    daysOffset: -8,
    hour: 14,
    status: 'cancelled',
  },
]

function pickScore(profile: SeedRow['scoreProfile'], priority: boolean): number | null {
  if (!profile) return null
  const rand = Math.random()
  switch (profile) {
    case 'high':
      return priority ? (rand < 0.7 ? 4 : 3) : rand < 0.5 ? 4 : 3
    case 'mid':
      return priority ? (rand < 0.6 ? 3 : 2) : rand < 0.5 ? 3 : 2
    case 'low':
      return priority ? (rand < 0.6 ? 2 : 1) : rand < 0.5 ? 2 : 1
    case 'mixed':
      return [1, 2, 3, 4][Math.floor(rand * 4)]!
    default:
      return null
  }
}

const SAMPLE_NOTES: Record<string, string[]> = {
  high: [
    'プロンプトの具体例まで即答できた',
    '自分の言葉で語れていた',
    'エピソードが具体的',
    '思考プロセスがクリア',
  ],
  mid: ['概ね答えられる', '一部抽象的', 'もう一歩踏み込みが欲しい', '可もなく不可もなく'],
  low: ['抽象的な回答', 'エピソード出てこず', '定型的な答えに終始', '深掘りできず'],
  mixed: ['質問による濃淡あり', '得意分野は鋭い', '苦手領域は即興に弱い', ''],
}

function pickNote(profile: SeedRow['scoreProfile']): string | null {
  if (!profile) return null
  const pool = SAMPLE_NOTES[profile] ?? []
  if (Math.random() > 0.6) return null
  return pool[Math.floor(Math.random() * pool.length)] || null
}

function hashOf(label: string): string {
  return createHash('sha256').update(`seed:${label}`).digest('hex')
}

export async function seed() {
  console.log('[seed] ensuring migrations...')
  migrate(db, { migrationsFolder: 'server/database/migrations' })

  console.log('[seed] clearing existing data...')
  await db.delete(interviewScores)
  await db.delete(interviews)

  console.log('[seed] inserting interviews...')
  const now = Date.now()

  for (const s of SEEDS) {
    const scheduled = new Date(now + s.daysOffset * 86400_000)
    scheduled.setHours(s.hour, 0, 0, 0)

    const [row] = await db
      .insert(interviews)
      .values({
        candidateInitials: s.candidateInitials,
        candidateHash: hashOf(s.candidateInitials),
        stage: s.stage,
        location: s.location,
        position: s.position,
        scheduledAt: scheduled,
        status: s.status,
        interviewerInitials: s.interviewer ?? null,
        decision: s.decision ?? null,
        goodNotes: s.goodNotes ?? null,
        concernNotes: s.concernNotes ?? null,
        availabilityNotes: s.availabilityNotes ?? null,
        overallAiAptitude: s.overall?.ai ?? null,
        overallCommunication: s.overall?.comm ?? null,
        overallTotal: s.overall?.total ?? null,
      })
      .returning()

    if (s.scoreProfile && row) {
      for (const q of QUESTIONS) {
        const score = pickScore(s.scoreProfile, q.priority)
        if (score === null) continue
        await db.insert(interviewScores).values({
          interviewId: row.id,
          questionKey: q.key,
          score,
          note: pickNote(s.scoreProfile),
        })
      }
    }
  }

  console.log(`[seed] done. ${SEEDS.length} interviews inserted.`)
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[seed] failed', e)
    process.exit(1)
  })
