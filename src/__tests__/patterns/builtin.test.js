import { describe, expect, it } from 'vitest'
import { createEmptyGrid, nextGeneration } from '../../engine/gameOfLife'
import { parseRLE, trimToBoundingBox } from '../../engine/rle'
import { BUILTIN_PATTERNS } from '../../patterns/builtin'

function findPattern(id) {
  const entry = BUILTIN_PATTERNS.find((p) => p.id === id)
  if (!entry) throw new Error(`motif introuvable : ${id}`)
  return parseRLE(entry.rle)
}

function place(pattern, rows, cols, offRow, offCol) {
  const grid = createEmptyGrid(rows, cols)
  pattern.forEach((row, r) => row.forEach((alive, c) => {
    if (alive) grid[offRow + r][offCol + c] = true
  }))
  return grid
}

function runFor(grid, generations) {
  let current = grid
  for (let i = 0; i < generations; i++) current = nextGeneration(current)
  return current
}

// Simule chaque motif intégré isolé au centre d'une grande grille (bords
// morts loin de tout bord) pour vérifier sa période/son déplacement
// attendu avec notre propre moteur, plutôt que de faire confiance à la
// grille de cellules recopiée à la main.
describe('BUILTIN_PATTERNS — comportement attendu', () => {
  it.each([
    ['blinker', 2],
    ['toad', 2],
    ['beacon', 2],
    ['block', 1],
    ['beehive', 1],
    ['pulsar', 3],
  ])('%s revient à la même forme et position après %i génération(s)', (id, period) => {
    const pattern = findPattern(id)
    const grid = place(pattern, 30, 30, 10, 10)
    const before = trimToBoundingBox(grid)

    const after = trimToBoundingBox(runFor(grid, period))

    expect(after).toEqual(before)
  })

  it.each([
    ['glider', 4, 1, 1],
    ['lwss', 4, 0, 2],
  ])('%s conserve sa forme et se déplace de (%i,%i) après %i génération(s)', (id, period, dRow, dCol) => {
    const pattern = findPattern(id)
    const grid = place(pattern, 30, 30, 10, 10)
    const before = trimToBoundingBox(grid)

    const afterGrid = runFor(grid, period)
    const after = trimToBoundingBox(afterGrid)

    // décalage réel : on retrouve la position de la boîte englobante en
    // cherchant où la forme apparaît désormais dans la grille
    let found = null
    for (let r = 0; r + before.length <= afterGrid.length && !found; r++) {
      for (let c = 0; c + (before[0]?.length ?? 0) <= afterGrid[0].length; c++) {
        const candidate = afterGrid.slice(r, r + before.length).map((row) => row.slice(c, c + before[0].length))
        if (JSON.stringify(candidate) === JSON.stringify(before)) {
          found = { r, c }
          break
        }
      }
    }

    expect(after).toEqual(before)
    expect(found).not.toBeNull()
    expect(found.r - 10).toBe(dRow)
    expect(found.c - 10).toBe(dCol)
  })
})
