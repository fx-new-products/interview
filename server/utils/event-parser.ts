export type ParsedRecruitEvent = {
  candidateName: string
  stage: string
  location: string
  position: string | null
}

const RECRUIT_TAG = '[recruit]'

// 例: 井伊勇斗様｜一次面接＠web[recruit]（FX_生成AI活用インターン）
const PATTERN =
  /^(?<name>.+?)様[｜|]\s*(?<stage>[^＠@]+?)\s*[＠@]\s*(?<location>[^\[]+?)\s*\[recruit\](?:\s*[（(]\s*(?<position>[^）)]+?)\s*[）)])?/

export function parseRecruitEvent(summary: string | null | undefined): ParsedRecruitEvent | null {
  if (!summary) return null
  const s = summary.trim()
  if (!s.includes(RECRUIT_TAG)) return null

  const m = PATTERN.exec(s)
  if (!m || !m.groups) return null

  const { name, stage, location, position } = m.groups
  if (!name || !stage || !location) return null

  return {
    candidateName: name.trim(),
    stage: stage.trim(),
    location: location.trim(),
    position: position ? position.trim() : null,
  }
}
