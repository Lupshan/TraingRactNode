import { describe, expect, it } from 'vitest'
import { canonicalSignature, parseRLE, serializeRLE, trimToBoundingBox } from '../../engine/rle'

function gridFromPattern(pattern) {
  return pattern
    .trim()
    .split('\n')
    .map((line) => line.trim().split('').map((c) => c === '#'))
}

describe('trimToBoundingBox', () => {
  it('crops a grid down to the smallest rectangle containing live cells', () => {
    const grid = gridFromPattern(`
      .....
      ..#..
      .###.
      .....
    `)

    expect(trimToBoundingBox(grid)).toEqual(gridFromPattern('.#.\n###'))
  })

  it('returns an empty array for a grid with no live cells', () => {
    const grid = gridFromPattern(`
      ...
      ...
    `)

    expect(trimToBoundingBox(grid)).toEqual([])
  })
})

describe('serializeRLE / parseRLE', () => {
  it('round-trips a glider through RLE text', () => {
    const glider = gridFromPattern(`
      .#.
      ..#
      ###
    `)

    const rle = serializeRLE(glider)
    expect(parseRLE(rle)).toEqual(glider)
  })

  it('round-trips a pattern with dead runs at the start of a row', () => {
    const toad = gridFromPattern(`
      .###
      ###.
    `)

    expect(parseRLE(serializeRLE(toad))).toEqual(toad)
  })

  it('produces the standard x/y header', () => {
    const block = gridFromPattern('##\n##')

    expect(serializeRLE(block)).toMatch(/^x = 2, y = 2\n/)
  })
})

describe('canonicalSignature', () => {
  it('is identical for a pattern and its 90° rotations', () => {
    const glider = gridFromPattern(`
      .#.
      ..#
      ###
    `)
    const rotated = gridFromPattern(`
      #..
      #.#
      ##.
    `)

    expect(canonicalSignature(glider)).toBe(canonicalSignature(rotated))
  })

  it('is identical for a pattern and its mirror image', () => {
    const lShape = gridFromPattern(`
      #.
      #.
      ##
    `)
    const mirrored = gridFromPattern(`
      .#
      .#
      ##
    `)

    expect(canonicalSignature(lShape)).toBe(canonicalSignature(mirrored))
  })

  it('is identical regardless of where the pattern sits in the grid', () => {
    const atOrigin = gridFromPattern(`
      ###
      ...
      ...
    `)
    const offset = gridFromPattern(`
      .....
      ..###
      .....
    `)

    expect(canonicalSignature(atOrigin)).toBe(canonicalSignature(offset))
  })

  it('differs for genuinely different shapes', () => {
    const glider = gridFromPattern(`
      .#.
      ..#
      ###
    `)
    const blinker = gridFromPattern('###')

    expect(canonicalSignature(glider)).not.toBe(canonicalSignature(blinker))
  })
})
