export const DEFAULT_RULES = {
  birth: new Set([3]),
  survive: new Set([2, 3]),
}

export function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(false))
}

export function toggleCellEngine(grid, row, col) {
  return grid.map((rowCells, r) =>
    r === row ? rowCells.map((cell, c) => (c === col ? !cell : cell)) : rowCells,
  )
}

export function setCellEngine(grid, row, col, alive) {
  return grid.map((rowCells, r) =>
    r === row ? rowCells.map((cell, c) => (c === col ? alive : cell)) : rowCells,
  )
}

// Pose un motif sur la grille, coin supérieur gauche en (row, col) ; les
// cellules du motif sont combinées avec l'état existant (OR), pas
// remplacées, et celles qui tombent hors grille sont ignorées.
export function stampPatternEngine(grid, row, col, pattern) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const next = grid.map((rowCells) => [...rowCells])

  pattern.forEach((patternRow, r) => {
    patternRow.forEach((alive, c) => {
      if (!alive) return
      const targetRow = row + r
      const targetCol = col + c
      if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
        next[targetRow][targetCol] = true
      }
    })
  })

  return next
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
