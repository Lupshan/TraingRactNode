import { describe, expect, it } from 'vitest'
import { computeCellSize } from '../../components/gridSizing'

describe('computeCellSize', () => {
  it('falls back to minCellSize when the container has no measured size yet', () => {
    expect(
      computeCellSize({ containerWidth: 0, containerHeight: 0, rows: 10, cols: 10, minCellSize: 20 }),
    ).toBe(20)
  })

  it('grows cells to fill the container when the grid is small relative to it', () => {
    // conteneur 500x500, grille 5x5 -> 100px/cellule tiendrait, largement > minCellSize
    expect(
      computeCellSize({
        containerWidth: 500,
        containerHeight: 500,
        rows: 5,
        cols: 5,
        minCellSize: 20,
      }),
    ).toBe(100)
  })

  it('keeps cells at minCellSize (scroll instead of shrinking) when the grid is large relative to it', () => {
    // conteneur 500x500, grille 100x100 -> 5px/cellule tiendrait, mais en dessous du minimum
    expect(
      computeCellSize({
        containerWidth: 500,
        containerHeight: 500,
        rows: 100,
        cols: 100,
        minCellSize: 20,
      }),
    ).toBe(20)
  })
})
