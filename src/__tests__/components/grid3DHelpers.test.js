import { describe, expect, it } from 'vitest'
import {
  cellsEqual,
  centerOffset,
  computeRayGridPath,
  createTargetingSession,
  getAliveCellPositions,
  intersectRayBox,
  isClick,
  isSameSpot,
  pointerThreshold,
  resolveTargetingSession,
  stepHoverDepth,
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

describe('intersectRayBox', () => {
  it('finds the near/far distances for a ray pointing straight through the box', () => {
    const hit = intersectRayBox(
      { x: 10, y: 0, z: 0 },
      { x: -1, y: 0, z: 0 },
      12,
      12,
      12,
    )

    expect(hit).toEqual({ tNear: 4, tFar: 16 })
  })

  it('returns null for a ray that misses the box entirely', () => {
    const hit = intersectRayBox(
      { x: 10, y: 20, z: 0 },
      { x: -1, y: 0, z: 0 },
      12,
      12,
      12,
    )

    expect(hit).toBeNull()
  })

  it('clamps tNear to 0 when the ray origin is already inside the box', () => {
    const hit = intersectRayBox(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      12,
      12,
      12,
    )

    expect(hit).toEqual({ tNear: 0, tFar: 6 })
  })

  it('returns null for a box entirely behind the ray origin', () => {
    const hit = intersectRayBox(
      { x: 10, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      12,
      12,
      12,
    )

    expect(hit).toBeNull()
  })
})

describe('computeRayGridPath', () => {
  it('lists the cells crossed by a straight ray, ordered from the camera inward', () => {
    const sizeX = 3
    const sizeY = 3
    const sizeZ = 3
    const offset = centerOffset(sizeX, sizeY, sizeZ) // [-1, -1, -1]

    const path = computeRayGridPath({
      origin: { x: 10, y: 0, z: 0 },
      direction: { x: -1, y: 0, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(path).toEqual([
      { x: 2, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: 0, y: 1, z: 1 },
    ])
  })

  it('returns an empty path for a ray that misses the grid', () => {
    const sizeX = 12
    const sizeY = 12
    const sizeZ = 12
    const offset = centerOffset(sizeX, sizeY, sizeZ)

    const path = computeRayGridPath({
      origin: { x: 10, y: 50, z: 0 },
      direction: { x: -1, y: 0, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(path).toEqual([])
  })

  it('starts with the outer boundary cell for a ray aimed at an off-center point on a face', () => {
    const sizeX = 12
    const sizeY = 12
    const sizeZ = 12
    const offset = centerOffset(sizeX, sizeY, sizeZ) // [-5.5, -5.5, -5.5]

    // rayon venant de loin sur +X, visant (y=0.7, z=2.3) : doit d'abord
    // toucher la dernière couche X (index 11), avec y/z dérivés du point
    // d'entrée — même résultat que l'ancienne résolution par face/normale
    const path = computeRayGridPath({
      origin: { x: 50, y: 0.7, z: 2.3 },
      direction: { x: -1, y: 0, z: 0 },
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(path[0]).toEqual({ x: 11, y: 6, z: 8 })
  })

  it('never skips a cell (consecutive entries differ by at most one index per axis)', () => {
    const sizeX = 8
    const sizeY = 8
    const sizeZ = 8
    const offset = centerOffset(sizeX, sizeY, sizeZ)

    // rayon en diagonale, pas aligné sur un axe
    const raw = { x: -1, y: -0.6, z: 0.3 }
    const length = Math.hypot(raw.x, raw.y, raw.z)
    const direction = {
      x: raw.x / length,
      y: raw.y / length,
      z: raw.z / length,
    }

    const path = computeRayGridPath({
      origin: { x: 10, y: 6, z: -3 },
      direction,
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(path.length).toBeGreaterThan(0)
    for (let i = 1; i < path.length; i++) {
      expect(Math.abs(path[i].x - path[i - 1].x)).toBeLessThanOrEqual(1)
      expect(Math.abs(path[i].y - path[i - 1].y)).toBeLessThanOrEqual(1)
      expect(Math.abs(path[i].z - path[i - 1].z)).toBeLessThanOrEqual(1)
    }
  })
})

describe('cellsEqual', () => {
  it('returns true for the same object reference', () => {
    const cell = { x: 1, y: 2, z: 3 }
    expect(cellsEqual(cell, cell)).toBe(true)
  })

  it('returns true for two different objects with the same coordinates', () => {
    expect(cellsEqual({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(true)
  })

  it('returns false when a coordinate differs', () => {
    expect(cellsEqual({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 })).toBe(false)
  })

  it('returns false when either cell is null', () => {
    expect(cellsEqual(null, { x: 1, y: 2, z: 3 })).toBe(false)
    expect(cellsEqual({ x: 1, y: 2, z: 3 }, null)).toBe(false)
    expect(cellsEqual(null, null)).toBe(true)
  })
})

describe('isSameSpot', () => {
  it('is true for two nearly identical positions', () => {
    expect(isSameSpot({ x: 100, y: 100 }, { x: 103, y: 100 }, 8)).toBe(true)
  })

  it('is false once the distance exceeds the threshold', () => {
    expect(isSameSpot({ x: 100, y: 100 }, { x: 200, y: 100 }, 8)).toBe(false)
  })

  it('treats the exact threshold distance as the same spot', () => {
    expect(isSameSpot({ x: 0, y: 0 }, { x: 8, y: 0 }, 8)).toBe(true)
  })
})

describe('createTargetingSession', () => {
  const sizeX = 3
  const sizeY = 3
  const sizeZ = 3
  const offset = centerOffset(sizeX, sizeY, sizeZ)
  const straightThroughRay = {
    origin: { x: 10, y: 0, z: 0 },
    direction: { x: -1, y: 0, z: 0 },
  }

  it('freezes the ray path at the moment of creation, starting at the outer layer', () => {
    const session = createTargetingSession({ x: 100, y: 100 }, straightThroughRay, {
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(session.anchorPos).toEqual({ x: 100, y: 100 })
    expect(session.depthIndex).toBe(0)
    expect(session.path).toEqual([
      { x: 2, y: 1, z: 1 },
      { x: 1, y: 1, z: 1 },
      { x: 0, y: 1, z: 1 },
    ])
  })

  it('returns null when the ray misses the grid entirely', () => {
    const missedRay = { origin: { x: 10, y: 50, z: 0 }, direction: { x: -1, y: 0, z: 0 } }
    const session = createTargetingSession({ x: 0, y: 0 }, missedRay, {
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })

    expect(session).toBeNull()
  })
})

describe('resolveTargetingSession', () => {
  const sizeX = 3
  const sizeY = 3
  const sizeZ = 3
  const offset = centerOffset(sizeX, sizeY, sizeZ)
  const gridDims = { sizeX, sizeY, sizeZ, offset }
  const ray = { origin: { x: 10, y: 0, z: 0 }, direction: { x: -1, y: 0, z: 0 } }

  it('freezes a brand new session when there is no existing one', () => {
    const result = resolveTargetingSession(null, { x: 100, y: 100 }, ray, 8, gridDims)

    expect(result.isNew).toBe(true)
    expect(result.session).not.toBeNull()
    expect(result.session.depthIndex).toBe(0)
  })

  it('keeps the existing session untouched (no recompute) when still aiming at the same spot', () => {
    const existing = { anchorPos: { x: 100, y: 100 }, path: [{ x: 9, y: 9, z: 9 }], depthIndex: 2 }

    const result = resolveTargetingSession(existing, { x: 104, y: 100 }, ray, 8, gridDims)

    expect(result.isNew).toBe(false)
    expect(result.session).toBe(existing)
  })

  it('freezes a new session once the target moves past the threshold', () => {
    const existing = { anchorPos: { x: 100, y: 100 }, path: [{ x: 9, y: 9, z: 9 }], depthIndex: 2 }

    const result = resolveTargetingSession(existing, { x: 200, y: 100 }, ray, 8, gridDims)

    expect(result.isNew).toBe(true)
    expect(result.session).not.toBe(existing)
    expect(result.session.depthIndex).toBe(0)
  })

  it('returns a null session when the new ray misses the grid', () => {
    const missedRay = { origin: { x: 10, y: 50, z: 0 }, direction: { x: -1, y: 0, z: 0 } }

    const result = resolveTargetingSession(null, { x: 0, y: 0 }, missedRay, 8, gridDims)

    expect(result.isNew).toBe(true)
    expect(result.session).toBeNull()
  })
})

describe('stepHoverDepth', () => {
  const path = [
    { x: 2, y: 1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: 0, y: 1, z: 1 },
  ]

  it('advances one cell deeper when scrolling down', () => {
    const track = { screenPos: { x: 0, y: 0 }, path, depthIndex: 0 }
    expect(stepHoverDepth(track, 1).depthIndex).toBe(1)
  })

  it('goes back one cell when scrolling up', () => {
    const track = { screenPos: { x: 0, y: 0 }, path, depthIndex: 1 }
    expect(stepHoverDepth(track, -1).depthIndex).toBe(0)
  })

  it('clamps at the outer layer', () => {
    const track = { screenPos: { x: 0, y: 0 }, path, depthIndex: 0 }
    expect(stepHoverDepth(track, -1).depthIndex).toBe(0)
  })

  it('clamps at the deepest layer', () => {
    const track = { screenPos: { x: 0, y: 0 }, path, depthIndex: path.length - 1 }
    expect(stepHoverDepth(track, 1).depthIndex).toBe(path.length - 1)
  })
})

describe('isClick', () => {
  it('is a click when the pointer barely moved', () => {
    expect(isClick({ x: 100, y: 100 }, { x: 102, y: 100 }, 5)).toBe(true)
  })

  it('is not a click when the pointer moved past the threshold (a drag/rotate)', () => {
    expect(isClick({ x: 100, y: 100 }, { x: 120, y: 100 }, 5)).toBe(false)
  })

  it('treats the exact threshold distance as a click', () => {
    expect(isClick({ x: 0, y: 0 }, { x: 5, y: 0 }, 5)).toBe(true)
  })
})

describe('pointerThreshold', () => {
  it('uses the touch threshold for a touch pointer', () => {
    expect(pointerThreshold('touch', 5, 15)).toBe(15)
  })

  it('uses the mouse threshold for a mouse pointer', () => {
    expect(pointerThreshold('mouse', 5, 15)).toBe(5)
  })

  it('uses the mouse threshold for any other/unknown pointer type', () => {
    expect(pointerThreshold('pen', 5, 15)).toBe(5)
    expect(pointerThreshold(undefined, 5, 15)).toBe(5)
  })
})
