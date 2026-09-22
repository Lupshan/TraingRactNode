import { parseNeighborRanges } from './neighborRanges'

// Règle 3D par défaut : voisinage de Moore (26 voisins), naissance à
// exactement 6 voisins vivants, survie entre 5 et 7. Un point de départ
// documenté pour produire un comportement non trivial (ni extinction
// immédiate, ni saturation) ; modifiable comme le reste des règles.
export const DEFAULT_RULES_3D = {
  birth: parseNeighborRanges('6'),
  survive: parseNeighborRanges('5-7'),
}

export function createEmptyGrid3D(sizeX, sizeY, sizeZ) {
  return Array.from({ length: sizeX }, () =>
    Array.from({ length: sizeY }, () => new Array(sizeZ).fill(false)),
  )
}

export function countLiveNeighbors3D(grid, x, y, z) {
  const sizeX = grid.length
  const sizeY = grid[0]?.length ?? 0
  const sizeZ = grid[0]?.[0]?.length ?? 0
  let count = 0

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dz = -1; dz <= 1; dz++) {
        if (dx === 0 && dy === 0 && dz === 0) continue

        const nx = x + dx
        const ny = y + dy
        const nz = z + dz
        if (
          nx >= 0 &&
          nx < sizeX &&
          ny >= 0 &&
          ny < sizeY &&
          nz >= 0 &&
          nz < sizeZ &&
          grid[nx][ny][nz]
        ) {
          count++
        }
      }
    }
  }

  return count
}

export function nextGeneration3D(grid, rules = DEFAULT_RULES_3D) {
  return grid.map((plane, x) =>
    plane.map((row, y) =>
      row.map((alive, z) => {
        const neighbors = countLiveNeighbors3D(grid, x, y, z)
        return alive ? rules.survive.has(neighbors) : rules.birth.has(neighbors)
      }),
    ),
  )
}
