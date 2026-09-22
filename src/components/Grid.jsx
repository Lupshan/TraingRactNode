import { useEffect, useRef, useState } from 'react'
import { computeCellSize } from './gridSizing'

const MIN_CELL_SIZE = 20
const DEAD_COLOR = '#1c1d24'
const ALIVE_COLOR = '#a78bfa'
const GRID_LINE_COLOR = 'rgba(255, 255, 255, 0.15)'

function Grid({ grid, onCellPaint, minCellSize = MIN_CELL_SIZE }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const isPaintingRef = useRef(false)
  const paintValueRef = useRef(false)
  const lastPaintedRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ width, height })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const cellSize = computeCellSize({
    containerWidth: containerSize.width,
    containerHeight: containerSize.height,
    rows,
    cols,
    minCellSize,
  })

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

    ctx.strokeStyle = GRID_LINE_COLOR
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let col = 0; col <= cols; col++) {
      const x = col * cellSize + 0.5
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rows * cellSize)
    }
    for (let row = 0; row <= rows; row++) {
      const y = row * cellSize + 0.5
      ctx.moveTo(0, y)
      ctx.lineTo(cols * cellSize, y)
    }
    ctx.stroke()
  }, [grid, cellSize, rows, cols])

  useEffect(() => {
    function stopPainting() {
      isPaintingRef.current = false
      lastPaintedRef.current = null
    }

    window.addEventListener('mouseup', stopPainting)
    return () => window.removeEventListener('mouseup', stopPainting)
  }, [])

  function getCellFromEvent(event) {
    const rect = canvasRef.current.getBoundingClientRect()
    const col = Math.floor((event.clientX - rect.left) / cellSize)
    const row = Math.floor((event.clientY - rect.top) / cellSize)

    if (row < 0 || row >= rows || col < 0 || col >= cols) return null
    return { row, col }
  }

  function handleMouseDown(event) {
    const cell = getCellFromEvent(event)
    if (!cell) return

    const paintValue = !grid[cell.row][cell.col]
    isPaintingRef.current = true
    paintValueRef.current = paintValue
    lastPaintedRef.current = cell
    onCellPaint(cell.row, cell.col, paintValue)
  }

  function handleMouseMove(event) {
    if (!isPaintingRef.current) return

    const cell = getCellFromEvent(event)
    if (!cell) return

    const last = lastPaintedRef.current
    if (last && last.row === cell.row && last.col === cell.col) return

    lastPaintedRef.current = cell
    onCellPaint(cell.row, cell.col, paintValueRef.current)
  }

  return (
    <div ref={containerRef} className="grid-scroll-area">
      <canvas
        ref={canvasRef}
        data-testid="grid-canvas"
        width={cols * cellSize}
        height={rows * cellSize}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        aria-label={`Grille ${rows} lignes sur ${cols} colonnes`}
      />
    </div>
  )
}

export default Grid
