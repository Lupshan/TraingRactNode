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

describe('nextGeneration — paramètre rules', () => {
  it('utilise DEFAULT_RULES quand rules est omis', () => {
    const grid = gridFromPattern(`
      ....
      .##.
      .##.
      ....
    `)

    expect(patternFromGrid(nextGeneration(grid))).toBe(
      patternFromGrid(nextGeneration(grid, DEFAULT_RULES)),
    )
  })

  it('applique une règle de naissance différente de B3/S23', () => {
    const grid = gridFromPattern(`
      ##.
      ...
      ...
    `)
    const customRules = { birth: new Set([2]), survive: new Set([2, 3]) }

    // (1,0) a 2 voisins vivants : morte sous B3 (naissance à 3 uniquement)
    expect(nextGeneration(grid, DEFAULT_RULES)[1][0]).toBe(false)
    // ... mais naît sous une règle où la naissance inclut 2
    expect(nextGeneration(grid, customRules)[1][0]).toBe(true)
  })

  it('applique une règle de survie différente de B3/S23', () => {
    const grid = gridFromPattern(`
      ###
      ...
      ...
    `)
    const customRules = { birth: new Set([3]), survive: new Set([3]) }

    // (0,1) a 2 voisins vivants : survit sous S23
    expect(nextGeneration(grid, DEFAULT_RULES)[0][1]).toBe(true)
    // ... mais meurt sous une règle où la survie n'inclut pas 2
    expect(nextGeneration(grid, customRules)[0][1]).toBe(false)
  })
})
