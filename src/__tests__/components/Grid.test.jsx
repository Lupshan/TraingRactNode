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
    render(<Grid grid={grid} onCellClick={() => {}} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    expect(canvas).toHaveAttribute('width', '20')
    expect(canvas).toHaveAttribute('height', '20')
  })

  it('calls onCellClick with the row/col matching the click position', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellClick = vi.fn()
    render(<Grid grid={grid} onCellClick={onCellClick} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    // centre de la cellule (row=1, col=0) avec cellSize=10 : x=5, y=15
    fireEvent.click(canvas, { clientX: 5, clientY: 15 })

    expect(onCellClick).toHaveBeenCalledWith(1, 0)
  })

  it('ignores clicks outside the grid bounds', () => {
    const grid = [
      [false, false],
      [false, false],
    ]
    const onCellClick = vi.fn()
    render(<Grid grid={grid} onCellClick={onCellClick} minCellSize={10} />)

    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.click(canvas, { clientX: -5, clientY: -5 })

    expect(onCellClick).not.toHaveBeenCalled()
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
    render(<Grid grid={grid} onCellClick={() => {}} minCellSize={10} />)

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
    render(<Grid grid={grid} onCellClick={() => {}} minCellSize={10} />)

    // grille 2x2 -> 3 lignes verticales + 3 lignes horizontales
    expect(moveTo).toHaveBeenCalledTimes(6)
    expect(lineTo).toHaveBeenCalledTimes(6)
    expect(stroke).toHaveBeenCalledTimes(1)
  })
})
