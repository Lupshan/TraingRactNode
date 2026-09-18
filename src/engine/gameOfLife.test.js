import { describe, expect, it } from 'vitest'
import {
  countLiveNeighbors,
  createEmptyGrid,
  DEFAULT_RULES,
  nextGeneration,
  toggleCell,
} from './gameOfLife'

function gridFromPattern(pattern) {
  return pattern
    .trim()
    .split('\n')
    .map((line) => line.trim().split('').map((c) => c === '#'))
}

function patternFromGrid(grid) {
  return grid.map((row) => row.map((cell) => (cell ? '#' : '.')).join('')).join('\n')
}

describe('createEmptyGrid', () => {
  it('creates a grid of the given dimensions, all dead', () => {
    const grid = createEmptyGrid(3, 4)

    expect(grid).toHaveLength(3)
    expect(grid[0]).toHaveLength(4)
    expect(grid.flat().every((cell) => cell === false)).toBe(true)
  })
})

describe('toggleCell', () => {
  it('flips only the targeted cell', () => {
    const grid = createEmptyGrid(2, 2)
    const next = toggleCell(grid, 0, 1)

    expect(next[0][1]).toBe(true)
    expect(next[0][0]).toBe(false)
    expect(next[1].every((cell) => cell === false)).toBe(true)
  })

  it('does not mutate the original grid', () => {
    const grid = createEmptyGrid(2, 2)
    toggleCell(grid, 0, 0)

    expect(grid[0][0]).toBe(false)
  })

  it('toggling twice returns to dead', () => {
    const grid = createEmptyGrid(2, 2)
    const next = toggleCell(toggleCell(grid, 0, 0), 0, 0)

    expect(next[0][0]).toBe(false)
  })
})

describe('countLiveNeighbors — bords morts', () => {
  it('ignores out-of-grid neighbors on a corner cell', () => {
    const grid = gridFromPattern(`
      ##
      ##
    `)

    // (0,0) n'a que 3 voisins existants dans la grille, pas de rebouclage torique
    expect(countLiveNeighbors(grid, 0, 0)).toBe(3)
  })

  it('ignores out-of-grid neighbors on an edge cell', () => {
    const grid = gridFromPattern(`
      ###
      ###
      ###
    `)

    // (0,1) est sur le bord haut : seuls les 5 voisins existants comptent
    expect(countLiveNeighbors(grid, 0, 1)).toBe(5)
  })

  it('counts all 8 neighbors for a fully interior cell', () => {
    const grid = gridFromPattern(`
      ###
      ###
      ###
    `)

    expect(countLiveNeighbors(grid, 1, 1)).toBe(8)
  })
})

describe('nextGeneration — patterns de référence (B3/S23)', () => {
  it('still life (bloc) reste stable', () => {
    const grid = gridFromPattern(`
      ....
      .##.
      .##.
      ....
    `)

    const next = nextGeneration(grid, DEFAULT_RULES)

    expect(patternFromGrid(next)).toBe(patternFromGrid(grid))
  })

  it('blinker oscille entre position horizontale et verticale', () => {
    const horizontal = gridFromPattern(`
      .....
      .....
      .###.
      .....
      .....
    `)
    const vertical = gridFromPattern(`
      .....
      ..#..
      ..#..
      ..#..
      .....
    `)

    const afterOne = nextGeneration(horizontal, DEFAULT_RULES)
    expect(patternFromGrid(afterOne)).toBe(patternFromGrid(vertical))

    const afterTwo = nextGeneration(afterOne, DEFAULT_RULES)
    expect(patternFromGrid(afterTwo)).toBe(patternFromGrid(horizontal))
  })

  it('glider se déplace en diagonale de (+1,+1) après 4 générations', () => {
    let grid = gridFromPattern(`
      .#........
      ..#.......
      ###.......
      ..........
      ..........
      ..........
      ..........
      ..........
      ..........
      ..........
    `)

    for (let i = 0; i < 4; i++) {
      grid = nextGeneration(grid, DEFAULT_RULES)
    }

    const expected = gridFromPattern(`
      ..........
      ..#.......
      ...#......
      .###......
      ..........
      ..........
      ..........
      ..........
      ..........
      ..........
    `)

    expect(patternFromGrid(grid)).toBe(patternFromGrid(expected))
  })
})
