import { describe, expect, it } from 'vitest'
import { centerOffset, getAliveCellPositions } from '../../components/grid3DHelpers'

function grid3DFrom(coords, sizeX, sizeY, sizeZ) {
  const grid = Array.from({ length: sizeX }, () =>
    Array.from({ length: sizeY }, () => new Array(sizeZ).fill(false)),
  )
  coords.forEach(([x, y, z]) => {
    grid[x][y][z] = true
  })
  return grid
}

describe('getAliveCellPositions', () => {
  it('returns the [x, y, z] coordinates of every alive cell', () => {
    const grid = grid3DFrom(
      [
        [0, 0, 0],
        [1, 2, 0],
      ],
      3,
      3,
      3,
    )

    expect(getAliveCellPositions(grid)).toEqual([
      [0, 0, 0],
      [1, 2, 0],
    ])
  })

  it('returns an empty array when every cell is dead', () => {
    const grid = grid3DFrom([], 2, 2, 2)

    expect(getAliveCellPositions(grid)).toEqual([])
  })
})

describe('centerOffset', () => {
  it('returns an offset that centers the grid on the origin', () => {
    expect(centerOffset(3, 3, 3)).toEqual([-1, -1, -1])
  })

  it('handles non-cubic and even-sized dimensions', () => {
    expect(centerOffset(2, 4, 1)).toEqual([-0.5, -1.5, -0])
  })
})
