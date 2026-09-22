import { describe, expect, it } from 'vitest'
import { parseNeighborRanges, serializeNeighborRanges } from '../../engine/neighborRanges'

describe('parseNeighborRanges', () => {
  it('parses a mix of single numbers and ranges', () => {
    expect(parseNeighborRanges('1, 4, 6-11, 24')).toEqual(
      new Set([1, 4, 6, 7, 8, 9, 10, 11, 24]),
    )
  })

  it('parses a single number', () => {
    expect(parseNeighborRanges('3')).toEqual(new Set([3]))
  })

  it('parses a single range', () => {
    expect(parseNeighborRanges('5-7')).toEqual(new Set([5, 6, 7]))
  })

  it('handles a reversed range (high-low) the same as low-high', () => {
    expect(parseNeighborRanges('11-6')).toEqual(new Set([6, 7, 8, 9, 10, 11]))
  })

  it('de-duplicates overlapping numbers and ranges', () => {
    expect(parseNeighborRanges('3, 2-4, 4')).toEqual(new Set([2, 3, 4]))
  })

  it('tolerates extra whitespace around commas and dashes', () => {
    expect(parseNeighborRanges('  1 ,4 , 6 - 11 ')).toEqual(new Set([1, 4, 6, 7, 8, 9, 10, 11]))
  })

  it('ignores empty segments (trailing/double commas)', () => {
    expect(parseNeighborRanges('1,,4,')).toEqual(new Set([1, 4]))
  })

  it('ignores unparseable tokens rather than throwing', () => {
    expect(parseNeighborRanges('1, abc, 4')).toEqual(new Set([1, 4]))
  })

  it('returns an empty set for an empty string', () => {
    expect(parseNeighborRanges('')).toEqual(new Set())
  })
})

describe('serializeNeighborRanges', () => {
  it('groups consecutive numbers into ranges', () => {
    expect(serializeNeighborRanges(new Set([1, 4, 6, 7, 8, 9, 10, 11, 24]))).toBe('1, 4, 6-11, 24')
  })

  it('keeps isolated numbers as single values, not ranges', () => {
    expect(serializeNeighborRanges(new Set([2, 3]))).toBe('2-3')
    expect(serializeNeighborRanges(new Set([2, 4]))).toBe('2, 4')
  })

  it('sorts unordered input before serializing', () => {
    expect(serializeNeighborRanges(new Set([24, 1, 4]))).toBe('1, 4, 24')
  })

  it('returns an empty string for an empty set', () => {
    expect(serializeNeighborRanges(new Set())).toBe('')
  })

  it('round-trips through parseNeighborRanges', () => {
    const original = '1, 4, 6-11, 24'
    expect(serializeNeighborRanges(parseNeighborRanges(original))).toBe(original)
  })
})
