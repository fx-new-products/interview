import { createHash } from 'node:crypto'
// @ts-expect-error — package types are sparse
import KuroshiroMod from 'kuroshiro'
// @ts-expect-error — package types are sparse
import KuromojiAnalyzerMod from 'kuroshiro-analyzer-kuromoji'

// Handle CJS/ESM interop differences across Node versions
const Kuroshiro: any = (KuroshiroMod as any).default ?? KuroshiroMod
const KuromojiAnalyzer: any = (KuromojiAnalyzerMod as any).default ?? KuromojiAnalyzerMod

let instance: any = null
let initPromise: Promise<any> | null = null

async function getKuroshiro() {
  if (instance) return instance
  if (!initPromise) {
    const k = new Kuroshiro()
    initPromise = k
      .init(new KuromojiAnalyzer())
      .then(() => {
        instance = k
        return k
      })
      .catch((e: unknown) => {
        initPromise = null
        throw e
      })
  }
  return initPromise
}

function hashName(name: string): string {
  return createHash('sha256').update(name).digest('hex')
}

// "井伊勇斗" → "I.Y."  /  "Taro Yamada" → "T.Y."  /  "山田太郎" → "Y.T." (姓名と解釈)
export async function nameToInitials(rawName: string): Promise<{
  initials: string
  hash: string
}> {
  const name = rawName
    .trim()
    .replace(/様$/, '')
    .replace(/^(.+?)\s*[\(（][^\)）]*[\)）]\s*$/, '$1')
    .trim()

  const hash = hashName(name)
  if (!name) return { initials: '??', hash }

  // ASCII-only name: split by whitespace, take first letters
  if (/^[\x00-\x7F\s]+$/.test(name)) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return { initials: '??', hash }
    const initials = parts.map((p) => p[0]!.toUpperCase()).join('.') + '.'
    return { initials, hash }
  }

  // Split Japanese full name by ASCII/fullwidth spaces if present
  const explicitParts = name.split(/[\s\u3000]+/).filter(Boolean)

  try {
    const kuroshiro = await getKuroshiro()

    if (explicitParts.length >= 2) {
      const initials =
        (await Promise.all(
          explicitParts.map(async (p: string) => {
            const r: string = await kuroshiro.convert(p, { to: 'romaji', romajiSystem: 'hepburn' })
            return (r.trim()[0] || '').toUpperCase()
          }),
        ))
          .filter(Boolean)
          .join('.') + '.'
      return { initials: initials.length > 1 ? initials : '??', hash }
    }

    // No space: assume first 1-2 chars are 姓, rest 名 (best effort for 2-char or longer names).
    // 2-char name: 1 + 1. 3-char: 1 + 2 (common pattern like 山田太 unusual → default姓1char).
    // 4-char+: try 2 + rest.
    const chars = Array.from(name)
    let surname = ''
    let given = ''
    if (chars.length <= 1) {
      const r: string = await kuroshiro.convert(name, { to: 'romaji', romajiSystem: 'hepburn' })
      const first = (r.trim()[0] || '?').toUpperCase()
      return { initials: `${first}.`, hash }
    } else if (chars.length <= 3) {
      surname = chars[0]!
      given = chars.slice(1).join('')
    } else {
      surname = chars.slice(0, 2).join('')
      given = chars.slice(2).join('')
    }
    const [rs, rg]: [string, string] = await Promise.all([
      kuroshiro.convert(surname, { to: 'romaji', romajiSystem: 'hepburn' }),
      kuroshiro.convert(given, { to: 'romaji', romajiSystem: 'hepburn' }),
    ])
    const si = (rs.trim()[0] || '').toUpperCase()
    const gi = (rg.trim()[0] || '').toUpperCase()
    if (!si || !gi) return { initials: hash.slice(0, 6).toUpperCase(), hash }
    return { initials: `${si}.${gi}.`, hash }
  } catch (e) {
    console.error('[initials] kuroshiro failed', e)
    return { initials: hash.slice(0, 6).toUpperCase(), hash }
  }
}
