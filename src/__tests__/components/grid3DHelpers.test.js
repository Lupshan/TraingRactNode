import { describe, expect, it } from 'vitest'
import {
  centerOffset,
  getAliveCellPositions,
  resolveCellFromBoxFaceHit,
} from '../../components/grid3DHelpers'

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

describe('resolveCellFromBoxFaceHit', () => {
  const sizeX = 12
  const sizeY = 12
  const sizeZ = 12
  const offset = centerOffset(sizeX, sizeY, sizeZ) // [-5.5, -5.5, -5.5]

  it('resolves the last X layer when the +X face is hit', () => {
    const cell = resolveCellFromBoxFaceHit({
      point: { x: 5.5, y: 0, z: 2.3 },
      normal: { x: 1, y: 0, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(cell).toEqual({ x: 11, y: 6, z: 8 })
  })

  it('resolves the first X layer when the -X face is hit', () => {
    const cell = resolveCellFromBoxFaceHit({
      point: { x: -5.5, y: 0, z: 0 },
      normal: { x: -1, y: 0, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(cell.x).toBe(0)
  })

  it('resolves the last Y layer when the +Y face is hit, deriving X/Z from the hit point', () => {
    const cell = resolveCellFromBoxFaceHit({
      point: { x: -1.2, y: 5.5, z: 0 },
      normal: { x: 0, y: 1, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(cell).toEqual({ x: 4, y: 11, z: 6 })
  })

  it('resolves the first Z layer when the -Z face is hit', () => {
    const cell = resolveCellFromBoxFaceHit({
      point: { x: 0, y: 0, z: -5.5 },
      normal: { x: 0, y: 0, z: -1 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(cell.z).toBe(0)
  })

  it('clamps in-plane coordinates that fall outside the grid due to floating point noise', () => {
    const cell = resolveCellFromBoxFaceHit({
      point: { x: 5.5, y: -100, z: 100 },
      normal: { x: 1, y: 0, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(cell.y).toBe(0)
    expect(cell.z).toBe(sizeZ - 1)
  })
})
