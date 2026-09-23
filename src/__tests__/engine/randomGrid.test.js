import { describe, expect, it } from 'vitest'
import {
  generateRandomGrid2D,
  generateRandomGrid3D,
  hashSeed,
  mulberry32,
  RANDOM_2D_MAX_SIZE,
  RANDOM_2D_MIN_SIZE,
  RANDOM_3D_MAX_SIZE,
  RANDOM_3D_MIN_SIZE,
} from '../../engine/randomGrid'

describe('mulberry32', () => {
  it('produces the exact same sequence for the same numeric seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)

    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('produces a different sequence for a different seed', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)

    expect(a()).not.toBe(b())
  })

  it('always returns a float in [0, 1)', () => {
    const rand = mulberry32(7)
    for (let i = 0; i < 200; i++) {
      const value = rand()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('passes a finite number through unchanged (coerced to an unsigned 32-bit int)', () => {
    expect(hashSeed(42)).toBe(42)
  })

  it('hashes a string seed into the same integer every time', () => {
    expect(hashSeed('coucou')).toBe(hashSeed('coucou'))
  })

  it('hashes different strings into different integers', () => {
    expect(hashSeed('coucou')).not.toBe(hashSeed('au revoir'))
  })
})

describe('generateRandomGrid2D', () => {
  it('is fully reproducible: same seed and density give the same dimensions and grid', () => {
    const first = generateRandomGrid2D('ma-seed', 0.5)
    const second = generateRandomGrid2D('ma-seed', 0.5)

    expect(second.rows).toBe(first.rows)
    expect(second.cols).toBe(first.cols)
    expect(second.grid).toEqual(first.grid)
  })

  it('gives different results for a different seed', () => {
    const first = generateRandomGrid2D('seed-a', 0.5)
    const second = generateRandomGrid2D('seed-b', 0.5)

    const identical =
      second.rows === first.rows &&
      second.cols === first.cols &&
      JSON.stringify(second.grid) === JSON.stringify(first.grid)
    expect(identical).toBe(false)
  })

  it('keeps the drawn dimensions within the documented bounds', () => {
    const { rows, cols } = generateRandomGrid2D('bounds-check', 0.5)

    expect(rows).toBeGreaterThanOrEqual(RANDOM_2D_MIN_SIZE)
    expect(rows).toBeLessThanOrEqual(RANDOM_2D_MAX_SIZE)
    expect(cols).toBeGreaterThanOrEqual(RANDOM_2D_MIN_SIZE)
    expect(cols).toBeLessThanOrEqual(RANDOM_2D_MAX_SIZE)
  })

  it('produces an all-dead grid at density 0', () => {
    const { grid } = generateRandomGrid2D('any-seed', 0)

    expect(grid.flat().every((cell) => cell === false)).toBe(true)
  })

  it('produces an all-alive grid at density 1', () => {
    const { grid } = generateRandomGrid2D('any-seed', 1)

    expect(grid.flat().every((cell) => cell === true)).toBe(true)
  })

  it('does not draw rules by default (rules is null)', () => {
    const { rules } = generateRandomGrid2D('any-seed', 0.5)

    expect(rules).toBeNull()
  })

  it('draws reproducible birth/survive sets within 0-8 when randomizeRules is set', () => {
    const first = generateRandomGrid2D('rules-seed', 0.5, { randomizeRules: true })
    const second = generateRandomGrid2D('rules-seed', 0.5, { randomizeRules: true })

    expect(first.rules).not.toBeNull()
    expect(second.rules.birth).toEqual(first.rules.birth)
    expect(second.rules.survive).toEqual(first.rules.survive)
    for (const n of first.rules.birth) {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(8)
    }
    for (const n of first.rules.survive) {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(8)
    }
  })

  it('draws different rules than the grid content would suggest (rules affect what cells get drawn)', () => {
    const withoutRules = generateRandomGrid2D('same-seed', 0.5)
    const withRules = generateRandomGrid2D('same-seed', 0.5, { randomizeRules: true })

    // les tirages de règles consomment des nombres avant les cellules :
    // la grille diffère selon que randomizeRules est actif ou non, pour
    // une même seed.
    expect(withRules.grid).not.toEqual(withoutRules.grid)
  })
})

describe('generateRandomGrid3D', () => {
  it('is fully reproducible: same seed and density give the same dimensions and grid', () => {
    const first = generateRandomGrid3D('ma-seed-3d', 0.4)
    const second = generateRandomGrid3D('ma-seed-3d', 0.4)

    expect(second).toEqual(first)
  })

  it('keeps the drawn dimensions within the documented bounds', () => {
    const { sizeX, sizeY, sizeZ } = generateRandomGrid3D('bounds-check-3d', 0.5)

    for (const size of [sizeX, sizeY, sizeZ]) {
      expect(size).toBeGreaterThanOrEqual(RANDOM_3D_MIN_SIZE)
      expect(size).toBeLessThanOrEqual(RANDOM_3D_MAX_SIZE)
    }
  })

  it('produces an all-dead grid at density 0', () => {
    const { grid } = generateRandomGrid3D('any-seed', 0)

    expect(grid.flat(2).every((cell) => cell === false)).toBe(true)
  })

  it('draws reproducible birth/survive sets within 0-26 when randomizeRules is set', () => {
    const first = generateRandomGrid3D('rules-seed-3d', 0.5, { randomizeRules: true })
    const second = generateRandomGrid3D('rules-seed-3d', 0.5, { randomizeRules: true })

    expect(first.rules).not.toBeNull()
    expect(second.rules).toEqual(first.rules)
    for (const n of [...first.rules.birth, ...first.rules.survive]) {
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(26)
    }
  })
})
