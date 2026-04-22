<template>
  <div class="max-w-[1100px] mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-[#1B4332]">面談一覧</h1>
        <p class="text-sm text-gray-500 mt-1">
          Googleカレンダーから [recruit] タグ付きの面談を取得します
        </p>
      </div>
      <button
        class="bg-[#1B4332] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#2D6A4F] transition-colors disabled:opacity-50 flex items-center gap-2"
        :disabled="syncing"
        @click="sync"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': syncing }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {{ syncing ? '取り込み中...' : 'カレンダーから取り込む' }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-4 items-center">
      <select
        v-model="statusFilter"
        class="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white"
      >
        <option value="">すべてのステータス</option>
        <option value="scheduled">予定</option>
        <option value="completed">完了</option>
        <option value="cancelled">キャンセル</option>
      </select>
      <span class="text-xs text-gray-500">
        {{ filtered.length }} 件 / 全 {{ interviews.length }} 件
      </span>
    </div>

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-[#E8F5EE] text-[#1B4332]">
          <tr>
            <th
              class="text-left px-4 py-3 font-semibold cursor-pointer select-none hover:bg-[#d6ede0] transition-colors"
              @click="toggleSort('scheduledAt')"
            >
              日時 <span class="text-xs ml-0.5">{{ sortIndicator('scheduledAt') }}</span>
            </th>
            <th class="text-left px-4 py-3 font-semibold">候補者</th>
            <th class="text-left px-4 py-3 font-semibold">段階</th>
            <th class="text-left px-4 py-3 font-semibold">場所</th>
            <th class="text-left px-4 py-3 font-semibold">ポジション</th>
            <th class="text-left px-4 py-3 font-semibold">面談者</th>
            <th
              class="text-left px-4 py-3 font-semibold cursor-pointer select-none hover:bg-[#d6ede0] transition-colors"
              @click="toggleSort('status')"
            >
              ステータス <span class="text-xs ml-0.5">{{ sortIndicator('status') }}</span>
            </th>
            <th class="text-left px-4 py-3 font-semibold">判定</th>
            <th class="text-left px-4 py-3 font-semibold">添付</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="9" class="text-center py-12 text-gray-400">
              面談がありません。「カレンダーから取り込む」を押してください。
            </td>
          </tr>
          <tr
            v-for="row in filtered"
            :key="row.id"
            class="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
            @click="navigateTo(`/${row.id}`)"
          >
            <td class="px-4 py-3 whitespace-nowrap">
              <a
                v-if="row.calendarUrl"
                :href="row.calendarUrl"
                target="_blank"
                rel="noopener"
                class="text-[#2D6A4F] hover:underline inline-flex items-center gap-1"
                @click.stop
              >
                {{ formatDate(row.scheduledAt) }}
                <svg class="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <span v-else>{{ formatDate(row.scheduledAt) }}</span>
            </td>
            <td class="px-4 py-3 font-semibold">
              {{ row.candidateName || row.candidateInitials }}
              <span v-if="row.candidateName" class="ml-1 text-xs font-mono font-normal text-gray-400">{{ row.candidateInitials }}</span>
            </td>
            <td class="px-4 py-3">{{ row.stage || '-' }}</td>
            <td class="px-4 py-3">{{ row.location || '-' }}</td>
            <td class="px-4 py-3 text-xs">{{ row.position || '-' }}</td>
            <td class="px-4 py-3 font-mono">{{ row.interviewerInitials || '-' }}</td>
            <td class="px-4 py-3">
              <span :class="statusClass(row.status)" class="px-2 py-0.5 rounded text-xs font-semibold">
                {{ statusLabel(row.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span v-if="row.decision" :class="decisionClass(row.decision)" class="px-2 py-0.5 rounded text-xs font-semibold">
                {{ decisionLabel(row.decision) }}
              </span>
              <span v-else class="text-gray-300 text-xs">—</span>
            </td>
            <td class="px-4 py-3" @click.stop>
              <div class="flex flex-col gap-1">
                <div v-for="att in (attachments[row.id] || [])" :key="att.id" class="flex items-center gap-1 text-xs">
                  <a
                    :href="`/api/interviews/${row.id}/attachments/${att.id}`"
                    target="_blank"
                    class="text-[#2D6A4F] hover:underline truncate max-w-[120px]"
                    :title="att.originalName"
                  >
                    {{ att.originalName }}
                  </a>
                  <button
                    class="text-gray-400 hover:text-red-500 text-xs shrink-0"
                    title="削除"
                    @click="deleteAttachment(row.id, att.id, att.originalName, $event)"
                  >
                    ×
                  </button>
                </div>
                <button
                  class="text-xs text-gray-400 hover:text-[#2D6A4F] flex items-center gap-1 w-fit"
                  @click="uploadFile(row.id)"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  添付
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'

type InterviewRow = {
  id: number
  scheduledAt: string
  calendarUrl: string | null
  candidateInitials: string
  candidateName: string | null
  stage: string | null
  location: string | null
  position: string | null
  interviewerInitials: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  decision: 'pass' | 'hold' | 'fail' | null
}

type AttachmentRow = {
  id: number
  interviewId: number
  originalName: string
  mimeType: string | null
  size: number | null
}

const attachments = ref<Record<number, AttachmentRow[]>>({})

async function loadAttachments() {
  if (!interviews.value?.length) return
  const results: Record<number, AttachmentRow[]> = {}
  await Promise.all(
    interviews.value.map(async (r) => {
      try {
        const list = await $fetch<AttachmentRow[]>(`/api/interviews/${r.id}/attachments`)
        if (list.length) results[r.id] = list
      } catch {}
    }),
  )
  attachments.value = results
}

async function uploadFile(interviewId: number) {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = async () => {
    if (!input.files?.length) return
    const fd = new FormData()
    for (const f of input.files) fd.append('file', f)
    try {
      await $fetch(`/api/interviews/${interviewId}/attachments`, { method: 'POST', body: fd })
      toast.success('添付完了')
      await loadAttachments()
    } catch (e: any) {
      toast.error(`添付失敗: ${e?.message ?? 'unknown'}`)
    }
  }
  input.click()
}

async function deleteAttachment(interviewId: number, attId: number, name: string, ev: Event) {
  ev.stopPropagation()
  if (!confirm(`「${name}」を削除しますか？`)) return
  try {
    await $fetch(`/api/interviews/${interviewId}/attachments/${attId}`, { method: 'DELETE' })
    await loadAttachments()
  } catch (e: any) {
    toast.error(`削除失敗: ${e?.message ?? 'unknown'}`)
  }
}

const statusFilter = ref('')
const syncing = ref(false)

type SortKey = 'scheduledAt' | 'status'
type SortDir = 'asc' | 'desc'
const sortKey = ref<SortKey>('scheduledAt')
const sortDir = ref<SortDir>('desc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'scheduledAt' ? 'desc' : 'asc'
  }
}

function sortIndicator(key: SortKey) {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? '▲' : '▼'
}

const { data: interviews, refresh } = await useFetch<InterviewRow[]>('/api/interviews', {
  default: () => [],
})

// 画面を開いた初回に一度だけ自動同期（セッション中 30分は再実行しない）
const SYNC_KEY = 'interview:last-auto-sync'
const SYNC_INTERVAL_MS = 30 * 60 * 1000
onMounted(async () => {
  if (import.meta.server) return
  const last = Number(sessionStorage.getItem(SYNC_KEY) || '0')
  if (Date.now() - last < SYNC_INTERVAL_MS) return
  sessionStorage.setItem(SYNC_KEY, String(Date.now()))
  await sync({ silent: true })
})

// Load attachments after interviews are available
watch(interviews, () => { loadAttachments() }, { immediate: true })

const STATUS_ORDER: Record<string, number> = { scheduled: 0, completed: 1, cancelled: 2 }

const filtered = computed(() => {
  const rows = (interviews.value ?? []).filter((r) => !statusFilter.value || r.status === statusFilter.value)
  const dir = sortDir.value === 'asc' ? 1 : -1
  return rows.slice().sort((a, b) => {
    if (sortKey.value === 'scheduledAt') {
      return dir * (new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    }
    return dir * ((STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9))
  })
})

async function sync(opts: { silent?: boolean } = {}) {
  syncing.value = true
  try {
    const res = await $fetch<{ created: number; updated: number; skipped: number; total: number }>(
      '/api/interviews/sync-calendar',
      { method: 'POST' },
    )
    if (!opts.silent || res.created > 0 || res.updated > 0) {
      toast.success(`取り込み完了: 新規 ${res.created} / 更新 ${res.updated}`)
    }
    await refresh()
  } catch (e: any) {
    if (!opts.silent) {
      toast.error(`取り込み失敗: ${e?.data?.statusMessage ?? e?.message ?? 'unknown error'}`)
    } else {
      console.warn('[auto-sync] failed silently:', e)
    }
  } finally {
    syncing.value = false
  }
}

function formatDate(iso: string | number | Date) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}/${m}/${day} ${h}:${min}`
}

function statusLabel(s: string) {
  return { scheduled: '予定', completed: '完了', cancelled: 'キャンセル' }[s] ?? s
}
function statusClass(s: string) {
  return (
    {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-500',
    }[s] ?? 'bg-gray-100 text-gray-600'
  )
}
function decisionLabel(d: string) {
  return { pass: '合格', hold: '保留', fail: '不合格' }[d] ?? d
}
function decisionClass(d: string) {
  return (
    {
      pass: 'bg-green-100 text-green-800',
      hold: 'bg-yellow-100 text-yellow-800',
      fail: 'bg-red-100 text-red-700',
    }[d] ?? 'bg-gray-100 text-gray-600'
  )
}
</script>
