import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Grid from '../../components/Grid'

describe('Grid', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a canvas sized to the grid dimensions and minCellSize (no measured container in tests)', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    render(<Grid grid={grid} onCellPaint={() => {}} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    expect(canvas).toHaveAttribute('width', '20')
    expect(canvas).toHaveAttribute('height', '20')
  })

  it('calls onCellPaint with the row/col matching a click and the flipped state', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellPaint = vi.fn()
    render(<Grid grid={grid} onCellPaint={onCellPaint} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    // centre de la cellule (row=1, col=0) avec cellSize=10 : x=5, y=15
    fireEvent.mouseDown(canvas, { clientX: 5, clientY: 15 })

    expect(onCellPaint).toHaveBeenCalledWith(1, 0, true)
  })

  it('ignores a click outside the grid bounds', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellPaint = vi.fn()
    render(<Grid grid={grid} onCellPaint={onCellPaint} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.mouseDown(canvas, { clientX: -5, clientY: -5 })

    expect(onCellPaint).not.toHaveBeenCalled()
  })

  it('paints every cell the pointer crosses while dragging with the mouse held down', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellPaint = vi.fn()
    render(<Grid grid={grid} onCellPaint={onCellPaint} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.mouseDown(canvas, { clientX: 5, clientY: 5 }) // (0,0)
    fireEvent.mouseMove(canvas, { clientX: 15, clientY: 5 }) // (0,1)
    fireEvent.mouseMove(canvas, { clientX: 15, clientY: 15 }) // (1,1)

    expect(onCellPaint).toHaveBeenCalledTimes(3)
    expect(onCellPaint).toHaveBeenNthCalledWith(1, 0, 0, true)
    expect(onCellPaint).toHaveBeenNthCalledWith(2, 0, 1, true)
    expect(onCellPaint).toHaveBeenNthCalledWith(3, 1, 1, true)
  })

  it('does not repaint the same cell twice in a row while dragging', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellPaint = vi.fn()
    render(<Grid grid={grid} onCellPaint={onCellPaint} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.mouseDown(canvas, { clientX: 5, clientY: 5 }) // (0,0)
    fireEvent.mouseMove(canvas, { clientX: 6, clientY: 6 }) // still (0,0)

    expect(onCellPaint).toHaveBeenCalledTimes(1)
  })

  it('ignores mouse movement before the mouse is pressed', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellPaint = vi.fn()
    render(<Grid grid={grid} onCellPaint={onCellPaint} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.mouseMove(canvas, { clientX: 5, clientY: 5 })

    expect(onCellPaint).not.toHaveBeenCalled()
  })

  it('stops painting once the mouse button is released', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellPaint = vi.fn()
    render(<Grid grid={grid} onCellPaint={onCellPaint} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.mouseDown(canvas, { clientX: 5, clientY: 5 }) // (0,0)
    fireEvent.mouseUp(window)
    fireEvent.mouseMove(canvas, { clientX: 15, clientY: 5 }) // (0,1)

    expect(onCellPaint).toHaveBeenCalledTimes(1)
  })

  it('draws a filled rect for each alive cell', () => {
    const fillRect = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect,
      strokeStyle: '',
      lineWidth: 1,
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
    })

    const grid = [
      [true, false],
      [false, true],
    ]
    render(<Grid grid={grid} onCellPaint={() => {}} minCellSize={10} />)

    // 1 appel pour effacer le fond + 1 par cellule vivante (2 ici)
    expect(fillRect).toHaveBeenCalledTimes(3)
    expect(fillRect).toHaveBeenCalledWith(0, 0, 10, 10)
    expect(fillRect).toHaveBeenCalledWith(10, 10, 10, 10)
  })

  it('draws grid lines delimiting each cell', () => {
    const moveTo = vi.fn()
    const lineTo = vi.fn()
    const stroke = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect: () => {},
      strokeStyle: '',
      lineWidth: 1,
      beginPath: () => {},
      moveTo,
      lineTo,
      stroke,
    })

    const grid = [
      [false, false],
      [false, false],
    ]
    render(<Grid grid={grid} onCellPaint={() => {}} minCellSize={10} />)

    // grille 2x2 -> 3 lignes verticales + 3 lignes horizontales
    expect(moveTo).toHaveBeenCalledTimes(6)
    expect(lineTo).toHaveBeenCalledTimes(6)
    expect(stroke).toHaveBeenCalledTimes(1)
  })
})
