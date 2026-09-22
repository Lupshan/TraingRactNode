import { useEffect, useRef } from 'react'

const DEFAULT_CELL_SIZE = 16
const DEAD_COLOR = '#1c1d24'
const ALIVE_COLOR = '#a78bfa'

function Grid({ grid, onCellClick, cellSize = DEFAULT_CELL_SIZE }) {
  const canvasRef = useRef(null)
  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = DEAD_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = ALIVE_COLOR
    grid.forEach((rowCells, row) => {
      rowCells.forEach((alive, col) => {
        if (alive) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      })
    })
  }, [grid, cellSize])

  function handleClick(event) {
    const rect = canvasRef.current.getBoundingClientRect()
    const col = Math.floor((event.clientX - rect.left) / cellSize)
    const row = Math.floor((event.clientY - rect.top) / cellSize)

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      onCellClick(row, col)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="grid-canvas"
      width={cols * cellSize}
      height={rows * cellSize}
      onClick={handleClick}
      aria-label={`Grille ${rows} lignes sur ${cols} colonnes`}
    />
  )
}

export default Grid
