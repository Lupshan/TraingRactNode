import { describe, expect, it } from 'vitest'
import {
  countLiveNeighbors3D,
  createEmptyGrid3D,
  nextGeneration3D,
  setCellEngine3D,
} from '../../engine/gameOfLife3D'

describe('createEmptyGrid3D', () => {
  it('creates a grid of the given dimensions, all dead', () => {
    const grid = createEmptyGrid3D(2, 3, 4)

    expect(grid).toHaveLength(2)
    expect(grid[0]).toHaveLength(3)
    expect(grid[0][0]).toHaveLength(4)
    expect(grid.flat(2).every((cell) => cell === false)).toBe(true)
  })
})

describe('setCellEngine3D', () => {
  it('sets only the targeted cell to the given state', () => {
    const grid = createEmptyGrid3D(2, 2, 2)
    const next = setCellEngine3D(grid, 0, 1, 1, true)

    expect(next[0][1][1]).toBe(true)
    expect(next[0][0][0]).toBe(false)
    expect(next[1].flat().every((cell) => cell === false)).toBe(true)
  })

  it('does not mutate the original grid', () => {
    const grid = createEmptyGrid3D(2, 2, 2)
    setCellEngine3D(grid, 0, 0, 0, true)

    expect(grid[0][0][0]).toBe(false)
  })

  it('setting the same state twice is idempotent', () => {
    const grid = createEmptyGrid3D(2, 2, 2)
    const next = setCellEngine3D(setCellEngine3D(grid, 0, 0, 0, true), 0, 0, 0, true)

    expect(next[0][0][0]).toBe(true)
  })
})

describe('countLiveNeighbors3D', () => {
  it('counts all 26 neighbors of a cell fully surrounded (Moore neighborhood)', () => {
    const grid = createEmptyGrid3D(3, 3, 3)
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (!(x === 1 && y === 1 && z === 1)) grid[x][y][z] = true
        }
      }
    }

    expect(countLiveNeighbors3D(grid, 1, 1, 1)).toBe(26)
  })

  it('does not count the cell itself', () => {
    const grid = createEmptyGrid3D(3, 3, 3)
    grid[1][1][1] = true

    expect(countLiveNeighbors3D(grid, 1, 1, 1)).toBe(0)
  })

  it('counts only the neighbors that are actually alive', () => {
    const grid = createEmptyGrid3D(3, 3, 3)
    grid[0][1][1] = true
    grid[2][1][1] = true
    grid[1][0][1] = true

    expect(countLiveNeighbors3D(grid, 1, 1, 1)).toBe(3)
  })

  it('has dead borders — does not wrap around to the opposite face', () => {
    const grid = createEmptyGrid3D(4, 4, 4)
    // (3,1,1) would be a "neighbor" of (0,1,1) only under toroidal
    // wraparound (0 - 1 mod 4 = 3) ; it must not be counted here.
    grid[3][1][1] = true

    expect(countLiveNeighbors3D(grid, 0, 1, 1)).toBe(0)
  })
})

describe('nextGeneration3D', () => {
  it('brings a dead cell to life when its neighbor count matches a birth rule', () => {
    const rules = { birth: new Set([2]), survive: new Set() }
    const grid = createEmptyGrid3D(3, 3, 3)
    grid[0][1][1] = true
    grid[2][1][1] = true // (1,1,1) has exactly 2 live neighbors

    const next = nextGeneration3D(grid, rules)

    expect(next[1][1][1]).toBe(true)
  })

  it('kills a live cell whose neighbor count falls outside the survive rule', () => {
    const rules = { birth: new Set(), survive: new Set([2, 3]) }
    const grid = createEmptyGrid3D(3, 3, 3)
    grid[1][1][1] = true // alive, but zero live neighbors

    const next = nextGeneration3D(grid, rules)

    expect(next[1][1][1]).toBe(false)
  })

  it('keeps a live cell alive when its neighbor count matches the survive rule', () => {
    const rules = { birth: new Set(), survive: new Set([2]) }
    const grid = createEmptyGrid3D(3, 3, 3)
    grid[1][1][1] = true
    grid[0][1][1] = true
    grid[2][1][1] = true

    const next = nextGeneration3D(grid, rules)

    expect(next[1][1][1]).toBe(true)
  })

  it('does not mutate the original grid', () => {
    const rules = { birth: new Set([2]), survive: new Set() }
    const grid = createEmptyGrid3D(3, 3, 3)
    grid[0][1][1] = true
    grid[2][1][1] = true

    nextGeneration3D(grid, rules)

    expect(grid[1][1][1]).toBe(false)
  })

  it('uses DEFAULT_RULES_3D when no rules are given', () => {
    const grid = createEmptyGrid3D(3, 3, 3)
    // les 6 voisins orthogonaux (face-adjacents) vivants : naissance par
    // défaut à exactement 6 voisins
    grid[0][1][1] = true
    grid[2][1][1] = true
    grid[1][0][1] = true
    grid[1][2][1] = true
    grid[1][1][0] = true
    grid[1][1][2] = true

    const next = nextGeneration3D(grid)

    expect(next[1][1][1]).toBe(true)
  })
})
