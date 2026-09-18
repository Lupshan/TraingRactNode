export const DEFAULT_RULES = {
  birth: new Set([3]),
  survive: new Set([2, 3]),
}

export function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(false))
}

export function toggleCell(grid, row, col) {
  return grid.map((rowCells, r) =>
    r === row ? rowCells.map((cell, c) => (c === col ? !cell : cell)) : rowCells,
  )
}

export function countLiveNeighbors(grid, row, col) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  let count = 0

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue

      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c]) {
        count++
      }
    }
  }

  return count
}

export function nextGeneration(grid, rules = DEFAULT_RULES) {
  return grid.map((rowCells, row) =>
    rowCells.map((alive, col) => {
      const neighbors = countLiveNeighbors(grid, row, col)
      return alive ? rules.survive.has(neighbors) : rules.birth.has(neighbors)
    }),
  )
}
