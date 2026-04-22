import { describe, expect, it } from 'vitest'
import { parseRecruitEvent } from '../event-parser'

describe('parseRecruitEvent', () => {
  it('parses a standard recruit event title', () => {
    const r = parseRecruitEvent('井伊勇斗様｜一次面接＠web[recruit]（FX_生成AI活用インターン）')
    expect(r).toEqual({
      candidateName: '井伊勇斗',
      stage: '一次面接',
      location: 'web',
      position: 'FX_生成AI活用インターン',
    })
  })

  it('parses without position', () => {
    const r = parseRecruitEvent('山田太郎様｜二次面接＠対面[recruit]')
    expect(r).toEqual({
      candidateName: '山田太郎',
      stage: '二次面接',
      location: '対面',
      position: null,
    })
  })

  it('handles half-width @ and |', () => {
    const r = parseRecruitEvent('Doe John様|final@zoom[recruit]')
    expect(r).toEqual({
      candidateName: 'Doe John',
      stage: 'final',
      location: 'zoom',
      position: null,
    })
  })

  it('tolerates surrounding whitespace', () => {
    const r = parseRecruitEvent('  佐藤花子様｜一次面接＠web[recruit]（AIインターン）  ')
    expect(r?.candidateName).toBe('佐藤花子')
    expect(r?.position).toBe('AIインターン')
  })

  it('returns null when [recruit] tag is missing', () => {
    expect(parseRecruitEvent('井伊勇斗様｜一次面接＠web（FX_生成AI）')).toBeNull()
  })

  it('returns null on empty input', () => {
    expect(parseRecruitEvent('')).toBeNull()
    expect(parseRecruitEvent(null)).toBeNull()
    expect(parseRecruitEvent(undefined)).toBeNull()
  })

  it('returns null when pattern does not match', () => {
    expect(parseRecruitEvent('ミーティング[recruit]')).toBeNull()
  })
})
