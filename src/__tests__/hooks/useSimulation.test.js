import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'
import { useSimulation } from '../../hooks/useSimulation'

describe('useSimulation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with an empty grid of the requested size, at generation 0', () => {
    const { result } = renderHook(() => useSimulation({ rows: 3, cols: 4 }))

    expect(result.current.grid).toHaveLength(3)
    expect(result.current.grid[0]).toHaveLength(4)
    expect(result.current.grid.flat().every((cell) => cell === false)).toBe(true)
    expect(result.current.generation).toBe(0)
    expect(result.current.running).toBe(false)
  })

  it('toggleCell flips a cell when the simulation is stopped', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.toggleCell(0, 1))

    expect(result.current.grid[0][1]).toBe(true)
  })

  it('toggleCell is a no-op while running', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.start())
    act(() => result.current.toggleCell(0, 0))

    expect(result.current.grid[0][0]).toBe(false)
  })

  it('setCell sets a cell to the given state when the simulation is stopped', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.setCell(0, 1, true))
    expect(result.current.grid[0][1]).toBe(true)

    act(() => result.current.setCell(0, 1, false))
    expect(result.current.grid[0][1]).toBe(false)
  })

  it('setCell is a no-op while running', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.start())
    act(() => result.current.setCell(0, 0, true))

    expect(result.current.grid[0][0]).toBe(false)
  })

  it('step advances exactly one generation', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.step())

    expect(result.current.generation).toBe(1)
  })

  it('start runs the simulation automatically at the configured speed', () => {
    const { result } = renderHook(() => useSimulation({ rows: 5, cols: 5, speed: 100 }))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(350))

    expect(result.current.generation).toBe(3)
  })

  it('pause stops the automatic loop', () => {
    const { result } = renderHook(() => useSimulation({ rows: 5, cols: 5, speed: 100 }))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(200))
    act(() => result.current.pause())
    const generationAtPause = result.current.generation
    act(() => vi.advanceTimersByTime(500))

    expect(result.current.generation).toBe(generationAtPause)
  })

  it('reset empties the grid and the generation count without changing its dimensions', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.toggleCell(0, 0))
    act(() => result.current.step())
    act(() => result.current.reset())

    expect(result.current.generation).toBe(0)
    expect(result.current.grid).toHaveLength(2)
    expect(result.current.grid[0]).toHaveLength(2)
    expect(result.current.grid.flat().every((cell) => cell === false)).toBe(true)
  })

  it('resizeGrid changes the logical dimensions and resets the simulation', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))

    act(() => result.current.toggleCell(0, 0))
    act(() => result.current.resizeGrid(4, 6))

    expect(result.current.grid).toHaveLength(4)
    expect(result.current.grid[0]).toHaveLength(6)
    expect(result.current.generation).toBe(0)
  })

  it('setRules updates the active ruleset', () => {
    const { result } = renderHook(() => useSimulation({ rows: 2, cols: 2 }))
    const newRules = { birth: new Set([2]), survive: new Set([1]) }

    act(() => result.current.setRules(newRules))

    expect(result.current.rules).toBe(newRules)
  })

  it('changing rules mid-run does not delay the next tick and applies immediately', () => {
    const { result } = renderHook(() => useSimulation({ rows: 3, cols: 3, speed: 100 }))

    // (0,0) et (0,1) vivantes -> (1,0) a 2 voisins vivants :
    // morte sous B3/S23 (défaut), naît sous une règle où B inclut 2
    act(() => result.current.toggleCell(0, 0))
    act(() => result.current.toggleCell(0, 1))
    act(() => result.current.start())

    // change de règle à mi-chemin du premier intervalle (t=60/100)
    act(() => vi.advanceTimersByTime(60))
    act(() =>
      result.current.setRules({ birth: new Set([2]), survive: new Set([2, 3]) }),
    )

    // si l'intervalle avait redémarré au changement de règle, le tick
    // suivant tomberait à t=160, pas à t=100 : on n'avance que jusqu'à 100
    act(() => vi.advanceTimersByTime(40))

    expect(result.current.generation).toBe(1)
    expect(result.current.grid[1][0]).toBe(true)
  })
})
