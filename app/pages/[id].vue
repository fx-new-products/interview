<template>
  <div v-if="detail" class="cheat-sheet">
    <!-- Screen view -->
    <div class="screen-view">
    <!-- Header -->
    <div class="cs-header">
      <div class="cs-container">
        <div class="header-top">
          <span class="company-name">FREEDOM X Inc.</span>
          <span class="header-badge">INTERVIEW SHEET</span>
        </div>
        <h1>インターン面談 インタビューシート</h1>
        <p class="header-sub">AI駆動開発アシスタント ─ 長期インターン候補者用</p>
      </div>
    </div>

    <!-- Scoring Guide -->
    <div class="scoring-bar">
      <div class="cs-container">
        <div class="scoring-inner">
          <span class="scoring-label">評価基準</span>
          <div class="scoring-items">
            <div class="scoring-item"><div class="score-dot" /> 1 ─ 不十分</div>
            <div class="scoring-item">
              <div class="score-dot" /><div class="score-dot" /> 2 ─ やや不足
            </div>
            <div class="scoring-item">
              <div class="score-dot" /><div class="score-dot" /><div class="score-dot" /> 3 ─ 十分
            </div>
            <div class="scoring-item">
              <div class="score-dot" /><div class="score-dot" /><div class="score-dot" /><div class="score-dot" /> 4 ─ 期待以上
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action bar (no-print) -->
    <div class="action-bar no-print">
      <div class="cs-container flex justify-between items-center">
        <NuxtLink to="/" class="text-sm text-[#2D6A4F] hover:underline">
          ← 面談一覧に戻る
        </NuxtLink>
        <div class="flex items-center gap-3 text-xs">
          <span class="text-gray-500">
            <span v-if="saveStatus === 'saving'" class="text-amber-600">保存中...</span>
            <span v-else-if="saveStatus === 'saved'" class="text-green-600">✓ 保存済み</span>
            <span v-else-if="saveStatus === 'error'" class="text-red-600">保存エラー</span>
            <span v-else>&nbsp;</span>
          </span>
          <div
            v-if="detail.candidateName"
            class="inline-flex items-center rounded-md border border-gray-300 overflow-hidden text-xs"
          >
            <button
              class="px-2 py-1 transition-colors"
              :class="pdfNameMode === 'name' ? 'bg-[#1B4332] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
              @click="pdfNameMode = 'name'"
            >
              PDF: 名前
            </button>
            <button
              class="px-2 py-1 transition-colors"
              :class="pdfNameMode === 'initials' ? 'bg-[#1B4332] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
              @click="pdfNameMode = 'initials'"
            >
              PDF: イニシャル
            </button>
          </div>
          <button
            class="bg-[#1B4332] text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-[#2D6A4F]"
            @click="printSheet"
          >
            📄 PDF出力（印刷）
          </button>
        </div>
      </div>
    </div>

    <!-- Meta -->
    <div class="meta-bar">
      <div class="cs-container">
        <div class="meta-inner">
          <div class="meta-item">
            <div class="meta-dot" />候補者：
            <strong>{{ detail.candidateName || detail.candidateInitials }}</strong>
            <span v-if="detail.candidateName" class="ml-1 text-xs font-mono text-gray-400">{{ detail.candidateInitials }}</span>
            <span v-if="detail.stage" class="text-xs ml-2 text-gray-500">({{ detail.stage }})</span>
          </div>
          <div class="meta-item">
            <div class="meta-dot" />面談日：
            <strong>{{ formatDate(detail.scheduledAt) }}</strong>
          </div>
          <div class="meta-item">
            <div class="meta-dot" />面談者：
            <input
              v-model="interviewerInitials"
              type="text"
              placeholder="例: K.U."
              class="border-b border-gray-400 bg-transparent px-1 py-0 text-sm font-semibold w-24 focus:outline-none focus:border-[#2D6A4F]"
              @input="onMetaInput"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div class="cs-main">
      <div class="cs-container">
        <!-- Tips -->
        <div class="tips-banner no-print">
          <div class="tips-title">📋 面談のポイント</div>
          <div class="tips-list">
            <div class="tip-item">
              <span class="tip-check">✓</span> コーディング経験の有無より「試行錯誤の姿勢」を見る
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span> 正解を求めず、考えるプロセスを聞く
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span> 緊張をほぐすアイスブレイクから始める
            </div>
            <div class="tip-item">
              <span class="tip-check">✓</span> 質問は全部聞かなくてOK、★を優先
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div v-for="cat in categories" :key="cat.id" class="category">
          <div class="category-header">
            <div class="category-number">{{ cat.number }}</div>
            <div class="category-title">{{ cat.title }}</div>
            <span class="category-tag" :class="`tag-${cat.tagClass}`">{{ cat.tag }}</span>
          </div>
          <div class="category-intent">{{ cat.intent }}</div>
          <div class="questions">
            <div
              v-for="q in questionsByCategory(cat.id)"
              :key="q.key"
              class="q-card"
              :class="{ 'priority-high': q.priority }"
            >
              <span class="q-icon">{{ q.priority ? '★' : '◻' }}</span>
              <div class="q-content">
                <div class="q-text">{{ q.text }}</div>
                <div v-if="q.hint" class="q-hint">{{ q.hint }}</div>
                <textarea
                  v-model="scores[q.key].note"
                  rows="2"
                  placeholder="メモ..."
                  class="note-input"
                  @input="onScoreChange(q.key)"
                />
              </div>
              <ScoreRadio
                v-model="scores[q.key].score"
                @update:model-value="onScoreChange(q.key)"
              />
            </div>
          </div>
        </div>

        <!-- Overall Evaluation -->
        <div class="overall-eval">
          <div class="eval-item">
            <div class="eval-label">AI活用への適性</div>
            <ScoreRadio v-model="overall.aiAptitude" class="justify-center" @update:model-value="onOverallChange" />
          </div>
          <div class="eval-item">
            <div class="eval-label">コミュニケーション</div>
            <ScoreRadio v-model="overall.communication" class="justify-center" @update:model-value="onOverallChange" />
          </div>
          <div class="eval-item">
            <div class="eval-label">総合評価</div>
            <ScoreRadio v-model="overall.total" class="justify-center" @update:model-value="onOverallChange" />
          </div>
        </div>

        <!-- Notes -->
        <div class="notes-area">
          <div class="notes-title">✏️ 面談メモ</div>
          <div class="notes-grid">
            <div class="note-box">
              <div class="note-box-label">良かった点・印象に残った回答</div>
              <textarea
                v-model="notes.goodNotes"
                rows="4"
                class="note-textarea"
                @input="onNotesChange"
              />
            </div>
            <div class="note-box">
              <div class="note-box-label">懸念点・確認が必要な点</div>
              <textarea
                v-model="notes.concernNotes"
                rows="4"
                class="note-textarea"
                @input="onNotesChange"
              />
            </div>
            <div class="note-box">
              <div class="note-box-label">勤務可能な曜日・時間帯</div>
              <textarea
                v-model="notes.availabilityNotes"
                rows="3"
                class="note-textarea"
                @input="onNotesChange"
              />
            </div>
            <div class="note-box">
              <div class="note-box-label">合否判断</div>
              <div class="decision-buttons">
                <button
                  type="button"
                  class="decision-btn"
                  :class="{ active: decision === 'pass' }"
                  @click="setDecision('pass')"
                >
                  合格
                </button>
                <button
                  type="button"
                  class="decision-btn"
                  :class="{ active: decision === 'hold' }"
                  @click="setDecision('hold')"
                >
                  保留
                </button>
                <button
                  type="button"
                  class="decision-btn"
                  :class="{ active: decision === 'fail' }"
                  @click="setDecision('fail')"
                >
                  不合格
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cs-footer">
      <div class="cs-container">
        FREEDOM X Inc. ─ AI駆動開発アシスタント インターン面談シート ─ Confidential
      </div>
    </div>
    </div>
    <!-- End screen-view -->

    <!-- Print summary (1ページ) -->
    <div class="print-summary">
      <header class="ps-header">
        <div class="ps-brand">FREEDOM X Inc. ─ 面談サマリー</div>
        <div class="ps-title">
          <span class="ps-initials">{{ displayCandidate }}</span>
          <span class="ps-stage">{{ detail.stage || '面接' }}</span>
        </div>
        <div class="ps-meta">
          <span>日時：<strong>{{ formatDateTime(detail.scheduledAt) }}</strong></span>
          <span>場所：<strong>{{ detail.location || '-' }}</strong></span>
          <span>ポジション：<strong>{{ detail.position || '-' }}</strong></span>
          <span>面談者：<strong>{{ interviewerInitials || '-' }}</strong></span>
        </div>
      </header>

      <!-- Overall + Decision -->
      <section class="ps-row">
        <div class="ps-overall">
          <div class="ps-section-label">総合評価</div>
          <div class="ps-overall-grid">
            <div class="ps-ov-item">
              <div class="ps-ov-label">AI活用への適性</div>
              <div class="ps-ov-score">{{ overall.aiAptitude ?? '—' }}<span class="ps-ov-max">/4</span></div>
            </div>
            <div class="ps-ov-item">
              <div class="ps-ov-label">コミュニケーション</div>
              <div class="ps-ov-score">{{ overall.communication ?? '—' }}<span class="ps-ov-max">/4</span></div>
            </div>
            <div class="ps-ov-item">
              <div class="ps-ov-label">総合</div>
              <div class="ps-ov-score">{{ overall.total ?? '—' }}<span class="ps-ov-max">/4</span></div>
            </div>
          </div>
        </div>
        <div class="ps-decision" :class="decision ? `d-${decision}` : 'd-none'">
          <div class="ps-section-label">合否判断</div>
          <div class="ps-decision-val">{{ decisionLabel(decision) }}</div>
        </div>
      </section>

      <!-- Category averages -->
      <section class="ps-section">
        <div class="ps-section-label">カテゴリ別スコア</div>
        <div class="ps-categories">
          <div v-for="cat in categories" :key="cat.id" class="ps-cat">
            <div class="ps-cat-title">
              <span class="ps-cat-num">{{ cat.number }}</span>
              {{ cat.title }}
            </div>
            <div class="ps-cat-bar">
              <div
                class="ps-cat-fill"
                :style="{ width: `${((categoryAverages[cat.id] ?? 0) / 4) * 100}%` }"
              />
            </div>
            <div class="ps-cat-score">
              <template v-if="categoryAverages[cat.id] !== null">
                {{ categoryAverages[cat.id]!.toFixed(1) }}
              </template>
              <template v-else>—</template>
            </div>
          </div>
        </div>
      </section>

      <!-- Priority questions -->
      <section class="ps-section">
        <div class="ps-section-label">★ 優先質問のスコア</div>
        <div class="ps-priority-list">
          <div v-for="q in priorityQuestions" :key="q.key" class="ps-pri-item">
            <span class="ps-pri-score">{{ scores[q.key]?.score ?? '—' }}</span>
            <span class="ps-pri-text">{{ q.text }}</span>
          </div>
        </div>
      </section>

      <!-- Notes -->
      <section class="ps-notes">
        <div class="ps-note-box">
          <div class="ps-section-label">良かった点</div>
          <div class="ps-note-body">{{ notes.goodNotes || '（記入なし）' }}</div>
        </div>
        <div class="ps-note-box">
          <div class="ps-section-label">懸念点</div>
          <div class="ps-note-body">{{ notes.concernNotes || '（記入なし）' }}</div>
        </div>
        <div class="ps-note-box ps-note-wide">
          <div class="ps-section-label">勤務可能な曜日・時間帯</div>
          <div class="ps-note-body">{{ notes.availabilityNotes || '（記入なし）' }}</div>
        </div>
      </section>

      <footer class="ps-footer">
        FREEDOM X Inc. ─ Confidential ─ 出力日: {{ formatDate(new Date()) }}
      </footer>
    </div>
  </div>
  <div v-else class="p-10 text-center text-gray-400">読み込み中...</div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { toast } from 'vue-sonner'
import ScoreRadio from '~/components/ScoreRadio.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const id = Number(route.params.id)

type Detail = {
  id: number
  candidateInitials: string
  candidateName: string | null
  scheduledAt: string
  stage: string | null
  location: string | null
  position: string | null
  interviewerInitials: string | null
  decision: 'pass' | 'hold' | 'fail' | null
  goodNotes: string | null
  concernNotes: string | null
  availabilityNotes: string | null
  overallAiAptitude: number | null
  overallCommunication: number | null
  overallTotal: number | null
  scores: Record<string, { score: number | null; note: string | null }>
}

type QuestionsResponse = {
  categories: Array<{
    id: string
    number: string
    title: string
    tag: string
    tagClass: string
    intent: string
  }>
  questions: Array<{
    key: string
    categoryId: string
    text: string
    hint?: string
    priority: boolean
  }>
}

const { data: detail } = await useFetch<Detail>(`/api/interviews/${id}`)
const { data: qData } = await useFetch<QuestionsResponse>('/api/questions')

const categories = computed(() => qData.value?.categories ?? [])
const allQuestions = computed(() => qData.value?.questions ?? [])
function questionsByCategory(catId: string) {
  return allQuestions.value.filter((q) => q.categoryId === catId)
}

const priorityQuestions = computed(() => allQuestions.value.filter((q) => q.priority))

const categoryAverages = computed<Record<string, number | null>>(() => {
  const out: Record<string, number | null> = {}
  for (const cat of categories.value) {
    const qs = allQuestions.value.filter((q) => q.categoryId === cat.id)
    const vals = qs.map((q) => scores[q.key]?.score).filter((s): s is number => typeof s === 'number')
    out[cat.id] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  return out
})

function decisionLabel(d: string | null) {
  return { pass: '合格', hold: '保留', fail: '不合格' }[d ?? ''] ?? '判定なし'
}

function formatDateTime(iso: string | number | Date) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${h}:${min}`
}

// Local reactive state
const scores = reactive<Record<string, { score: number | null; note: string | null }>>({})
const interviewerInitials = ref('')
const decision = ref<'pass' | 'hold' | 'fail' | null>(null)
const overall = reactive({
  aiAptitude: null as number | null,
  communication: null as number | null,
  total: null as number | null,
})
const notes = reactive({
  goodNotes: '' as string,
  concernNotes: '' as string,
  availabilityNotes: '' as string,
})

const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

// PDF出力時の候補者名表記：'name' | 'initials'
const pdfNameMode = ref<'name' | 'initials'>('name')
const displayCandidate = computed(() => {
  if (!detail.value) return ''
  if (pdfNameMode.value === 'initials') return detail.value.candidateInitials
  return detail.value.candidateName || detail.value.candidateInitials
})

// Initialize state once detail + questions are loaded
watch(
  [detail, qData],
  () => {
    if (!detail.value || !qData.value) return
    // seed score slots for every question
    for (const q of qData.value.questions) {
      if (!scores[q.key]) {
        const existing = detail.value.scores?.[q.key]
        scores[q.key] = {
          score: existing?.score ?? null,
          note: existing?.note ?? '',
        }
      }
    }
    interviewerInitials.value = detail.value.interviewerInitials ?? ''
    decision.value = detail.value.decision
    overall.aiAptitude = detail.value.overallAiAptitude
    overall.communication = detail.value.overallCommunication
    overall.total = detail.value.overallTotal
    notes.goodNotes = detail.value.goodNotes ?? ''
    notes.concernNotes = detail.value.concernNotes ?? ''
    notes.availabilityNotes = detail.value.availabilityNotes ?? ''
  },
  { immediate: true },
)

// Debounced save helpers
const pendingScoreKeys = new Set<string>()

const flushScores = useDebounceFn(async () => {
  if (pendingScoreKeys.size === 0) return
  saveStatus.value = 'saving'
  try {
    const keys = Array.from(pendingScoreKeys)
    pendingScoreKeys.clear()
    await Promise.all(
      keys.map((k) =>
        $fetch(`/api/interviews/${id}/scores/${k}`, {
          method: 'PUT',
          body: {
            score: scores[k]?.score ?? null,
            note: scores[k]?.note ?? null,
          },
        }),
      ),
    )
    saveStatus.value = 'saved'
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle'
    }, 1500)
  } catch (e: any) {
    saveStatus.value = 'error'
    toast.error(`保存失敗: ${e?.message ?? 'unknown'}`)
  }
}, 1200)

function onScoreChange(key: string) {
  pendingScoreKeys.add(key)
  flushScores()
}

const flushMeta = useDebounceFn(async () => {
  saveStatus.value = 'saving'
  try {
    await $fetch(`/api/interviews/${id}`, {
      method: 'PATCH',
      body: {
        interviewerInitials: interviewerInitials.value || null,
        decision: decision.value,
        goodNotes: notes.goodNotes || null,
        concernNotes: notes.concernNotes || null,
        availabilityNotes: notes.availabilityNotes || null,
        overallAiAptitude: overall.aiAptitude,
        overallCommunication: overall.communication,
        overallTotal: overall.total,
      },
    })
    saveStatus.value = 'saved'
    setTimeout(() => {
      if (saveStatus.value === 'saved') saveStatus.value = 'idle'
    }, 1500)
  } catch (e: any) {
    saveStatus.value = 'error'
    toast.error(`保存失敗: ${e?.message ?? 'unknown'}`)
  }
}, 1200)

function onMetaInput() {
  flushMeta()
}
function onOverallChange() {
  flushMeta()
}
function onNotesChange() {
  flushMeta()
}
function setDecision(d: 'pass' | 'hold' | 'fail') {
  decision.value = decision.value === d ? null : d
  flushMeta()
}

function printSheet() {
  const original = document.title
  const base = pdfNameMode.value === 'name' && detail.value?.candidateName
    ? detail.value.candidateName
    : (detail.value?.candidateInitials || 'interview')
  const safe = base.replace(/[\s.\\/:*?"<>|]/g, '')
  const d = detail.value ? new Date(detail.value.scheduledAt) : new Date()
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  document.title = `interview_${safe}_${stamp}`
  window.print()
  setTimeout(() => {
    document.title = original
  }, 500)
}

function formatDate(iso: string | number | Date) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}
</script>

<style>
/* Cheat sheet — scoped would break the kebab selectors from the source HTML */
.cheat-sheet {
  font-family: 'Noto Sans JP', sans-serif;
  line-height: 1.7;
  color: #1a1a1a;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  background: #fafaf7;
}
.cheat-sheet .cs-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 24px;
}
.cheat-sheet .cs-header {
  background: #1b4332;
  color: white;
  padding: 48px 0 40px;
  position: relative;
  overflow: hidden;
}
.cheat-sheet .header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.cheat-sheet .company-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.7;
}
.cheat-sheet .header-badge {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}
.cheat-sheet h1 {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.5px;
  line-height: 1.3;
  margin-bottom: 8px;
}
.cheat-sheet .header-sub {
  font-size: 14px;
  opacity: 0.6;
  font-weight: 300;
}
.cheat-sheet .scoring-bar {
  background: #2d6a4f;
  color: white;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.cheat-sheet .scoring-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 12px;
}
.cheat-sheet .scoring-label {
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 1px;
  white-space: nowrap;
  opacity: 0.8;
}
.cheat-sheet .scoring-items {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.cheat-sheet .scoring-item {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}
.cheat-sheet .score-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
}
.cheat-sheet .action-bar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
}
.cheat-sheet .meta-bar {
  padding: 20px 0;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}
.cheat-sheet .meta-inner {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}
.cheat-sheet .meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}
.cheat-sheet .meta-item strong {
  color: #1a1a1a;
  font-weight: 600;
}
.cheat-sheet .meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #52b788;
}
.cheat-sheet .cs-main {
  padding: 32px 0 60px;
}
.cheat-sheet .category {
  margin-bottom: 32px;
}
.cheat-sheet .category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.cheat-sheet .category-number {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: #1b4332;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cheat-sheet .category-title {
  font-size: 16px;
  font-weight: 700;
  color: #1b4332;
}
.cheat-sheet .category-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  letter-spacing: 0.5px;
  margin-left: auto;
  white-space: nowrap;
}
.cheat-sheet .tag-core {
  background: #e8f5ee;
  color: #2d6a4f;
}
.cheat-sheet .tag-ai {
  background: #dbeafe;
  color: #1e40af;
}
.cheat-sheet .tag-comm {
  background: #fce7f3;
  color: #be185d;
}
.cheat-sheet .tag-mind {
  background: #fef3c7;
  color: #92400e;
}
.cheat-sheet .tag-fit {
  background: #d1fae5;
  color: #2d6a4f;
}
.cheat-sheet .category-intent {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
  padding-left: 40px;
  font-style: italic;
}
.cheat-sheet .questions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 40px;
}
.cheat-sheet .q-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  transition: box-shadow 0.2s;
}
.cheat-sheet .q-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
.cheat-sheet .q-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}
.cheat-sheet .q-content {
  flex: 1;
}
.cheat-sheet .q-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  color: #1a1a1a;
}
.cheat-sheet .q-hint {
  font-size: 11px;
  color: #40916c;
  margin-top: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}
.cheat-sheet .q-hint::before {
  content: '→';
  font-size: 10px;
}
.cheat-sheet .note-input {
  width: 100%;
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-family: inherit;
  resize: vertical;
  background: #fafaf7;
}
.cheat-sheet .note-input:focus {
  outline: none;
  border-color: #52b788;
  background: white;
}
.cheat-sheet .priority-high {
  border-left: 3px solid #52b788;
}
.cheat-sheet .tips-banner {
  background: linear-gradient(135deg, #e8f5ee 0%, #f0fdf4 100%);
  border: 1px solid #c6f6d5;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 32px;
}
.cheat-sheet .tips-title {
  font-size: 12px;
  font-weight: 700;
  color: #1b4332;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
}
.cheat-sheet .tips-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.cheat-sheet .tip-item {
  font-size: 12px;
  color: #2d6a4f;
  display: flex;
  align-items: center;
  gap: 6px;
}
.cheat-sheet .tip-check {
  color: #52b788;
  font-weight: 700;
}
.cheat-sheet .overall-eval {
  background: #1b4332;
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
.cheat-sheet .eval-item {
  text-align: center;
}
.cheat-sheet .eval-label {
  font-size: 11px;
  opacity: 0.7;
  margin-bottom: 10px;
  font-weight: 500;
}
.cheat-sheet .overall-eval .q-score {
  justify-content: center;
}
.cheat-sheet .overall-eval .q-score-circle {
  border-color: rgba(255, 255, 255, 0.4);
  background: transparent;
}
.cheat-sheet .overall-eval .q-score-circle.active {
  background: #52b788;
  border-color: white;
}
.cheat-sheet .overall-eval .q-score-circle .dot {
  background: white;
}
.cheat-sheet .notes-area {
  margin-top: 40px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}
.cheat-sheet .notes-title {
  font-size: 13px;
  font-weight: 700;
  color: #1b4332;
  margin-bottom: 16px;
}
.cheat-sheet .notes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.cheat-sheet .note-box {
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  min-height: 80px;
}
.cheat-sheet .note-box-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.cheat-sheet .note-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.6;
}
.cheat-sheet .note-textarea:focus {
  outline: none;
}
.cheat-sheet .decision-buttons {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}
.cheat-sheet .decision-btn {
  flex: 1;
  padding: 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  color: #6b7280;
}
.cheat-sheet .decision-btn:hover {
  border-color: #52b788;
}
.cheat-sheet .decision-btn.active {
  background: #1b4332;
  border-color: #1b4332;
  color: white;
}
.cheat-sheet .cs-footer {
  text-align: center;
  padding: 24px 0 40px;
  font-size: 11px;
  color: #6b7280;
  opacity: 0.6;
}

/* Print summary — hidden on screen, shown when printing */
.cheat-sheet .print-summary {
  display: none;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 10mm;
  }
  html,
  body {
    background: white !important;
  }
  .cheat-sheet {
    background: white;
  }
  .no-print {
    display: none !important;
  }
  .cheat-sheet .screen-view {
    display: none !important;
  }
  .cheat-sheet .print-summary {
    display: block !important;
    font-family: 'Noto Sans JP', sans-serif;
    color: #1a1a1a;
    font-size: 10pt;
    line-height: 1.45;
  }
}

/* Summary layout (defined outside @media so type-checking works; activated only via parent .print-summary) */
.cheat-sheet .print-summary .ps-header {
  border-bottom: 2px solid #1b4332;
  padding-bottom: 8px;
  margin-bottom: 12px;
}
.cheat-sheet .print-summary .ps-brand {
  font-family: 'DM Sans', sans-serif;
  font-size: 9pt;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 4px;
}
.cheat-sheet .print-summary .ps-title {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 6px;
}
.cheat-sheet .print-summary .ps-initials {
  font-size: 22pt;
  font-weight: 900;
  color: #1b4332;
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 1px;
}
.cheat-sheet .print-summary .ps-stage {
  font-size: 12pt;
  color: #2d6a4f;
  font-weight: 700;
  background: #e8f5ee;
  padding: 2px 10px;
  border-radius: 4px;
}
.cheat-sheet .print-summary .ps-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  font-size: 9pt;
  color: #4b5563;
}
.cheat-sheet .print-summary .ps-meta strong {
  color: #1a1a1a;
  font-weight: 600;
}
.cheat-sheet .print-summary .ps-section-label {
  font-size: 8.5pt;
  font-weight: 700;
  color: #1b4332;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.cheat-sheet .print-summary .ps-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.cheat-sheet .print-summary .ps-overall,
.cheat-sheet .print-summary .ps-decision {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 10px;
}
.cheat-sheet .print-summary .ps-overall-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
}
.cheat-sheet .print-summary .ps-ov-item {
  text-align: center;
}
.cheat-sheet .print-summary .ps-ov-label {
  font-size: 8pt;
  color: #6b7280;
  margin-bottom: 2px;
}
.cheat-sheet .print-summary .ps-ov-score {
  font-family: 'DM Sans', sans-serif;
  font-size: 18pt;
  font-weight: 700;
  color: #1b4332;
  line-height: 1;
}
.cheat-sheet .print-summary .ps-ov-max {
  font-size: 10pt;
  color: #9ca3af;
  font-weight: 400;
}
.cheat-sheet .print-summary .ps-decision {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.cheat-sheet .print-summary .ps-decision-val {
  font-size: 18pt;
  font-weight: 900;
  padding: 6px 0;
}
.cheat-sheet .print-summary .ps-decision.d-pass {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}
.cheat-sheet .print-summary .ps-decision.d-hold {
  background: #fef3c7;
  border-color: #d97706;
  color: #92400e;
}
.cheat-sheet .print-summary .ps-decision.d-fail {
  background: #fee2e2;
  border-color: #dc2626;
  color: #991b1b;
}
.cheat-sheet .print-summary .ps-decision.d-none {
  color: #9ca3af;
}
.cheat-sheet .print-summary .ps-section {
  margin-bottom: 12px;
}
.cheat-sheet .print-summary .ps-categories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
}
.cheat-sheet .print-summary .ps-cat {
  display: grid;
  grid-template-columns: 1fr 90px 30px;
  gap: 8px;
  align-items: center;
  font-size: 9pt;
  padding: 2px 0;
}
.cheat-sheet .print-summary .ps-cat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cheat-sheet .print-summary .ps-cat-num {
  font-family: 'DM Sans', sans-serif;
  font-size: 7.5pt;
  font-weight: 700;
  color: white;
  background: #1b4332;
  padding: 1px 5px;
  border-radius: 3px;
}
.cheat-sheet .print-summary .ps-cat-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}
.cheat-sheet .print-summary .ps-cat-fill {
  height: 100%;
  background: #52b788;
}
.cheat-sheet .print-summary .ps-cat-score {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  text-align: right;
  color: #1b4332;
}
.cheat-sheet .print-summary .ps-priority-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cheat-sheet .print-summary .ps-pri-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 8px;
  font-size: 9pt;
  padding: 1px 0;
}
.cheat-sheet .print-summary .ps-pri-score {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  color: #1b4332;
  text-align: center;
  background: #e8f5ee;
  border-radius: 3px;
}
.cheat-sheet .print-summary .ps-pri-text {
  color: #1a1a1a;
  line-height: 1.4;
}
.cheat-sheet .print-summary .ps-notes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}
.cheat-sheet .print-summary .ps-note-box {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 6px 10px;
  min-height: 50px;
}
.cheat-sheet .print-summary .ps-note-wide {
  grid-column: 1 / span 2;
  min-height: 30px;
}
.cheat-sheet .print-summary .ps-note-body {
  font-size: 9pt;
  color: #1a1a1a;
  white-space: pre-wrap;
  line-height: 1.5;
}
.cheat-sheet .print-summary .ps-footer {
  margin-top: 12px;
  text-align: center;
  font-size: 8pt;
  color: #9ca3af;
  border-top: 1px solid #e5e7eb;
  padding-top: 6px;
}

@media (max-width: 600px) {
  .cheat-sheet h1 {
    font-size: 22px;
  }
  .cheat-sheet .questions {
    padding-left: 0;
  }
  .cheat-sheet .category-intent {
    padding-left: 0;
  }
  .cheat-sheet .meta-inner {
    gap: 16px;
  }
  .cheat-sheet .notes-grid {
    grid-template-columns: 1fr;
  }
  .cheat-sheet .overall-eval {
    grid-template-columns: 1fr;
  }
  .cheat-sheet .scoring-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
