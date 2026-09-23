import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSimulation3D } from '../../hooks/useSimulation3D'

describe('useSimulation3D', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with an empty grid of the requested size, at generation 0', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 3, sizeY: 4, sizeZ: 5 }))

    expect(result.current.grid).toHaveLength(3)
    expect(result.current.grid[0]).toHaveLength(4)
    expect(result.current.grid[0][0]).toHaveLength(5)
    expect(result.current.grid.flat(2).every((cell) => cell === false)).toBe(true)
    expect(result.current.generation).toBe(0)
    expect(result.current.running).toBe(false)
  })

  it('setCell sets a cell to the given state when the simulation is stopped', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))

    act(() => result.current.setCell(0, 1, 1, true))
    expect(result.current.grid[0][1][1]).toBe(true)

    act(() => result.current.setCell(0, 1, 1, false))
    expect(result.current.grid[0][1][1]).toBe(false)
  })

  it('setCell is a no-op while running', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))

    act(() => result.current.start())
    act(() => result.current.setCell(0, 0, 0, true))

    expect(result.current.grid[0][0][0]).toBe(false)
  })

  it('step advances exactly one generation', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))

    act(() => result.current.step())

    expect(result.current.generation).toBe(1)
  })

  it('start runs the simulation automatically at the configured speed', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 5, sizeY: 5, sizeZ: 5, speed: 100 }))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(350))

    expect(result.current.generation).toBe(3)
  })

  it('pause stops the automatic loop', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 5, sizeY: 5, sizeZ: 5, speed: 100 }))

    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(200))
    act(() => result.current.pause())
    const generationAtPause = result.current.generation
    act(() => vi.advanceTimersByTime(500))

    expect(result.current.generation).toBe(generationAtPause)
  })

  it('reset empties the grid and the generation count without changing its dimensions', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))

    act(() => result.current.setCell(0, 0, 0, true))
    act(() => result.current.step())
    act(() => result.current.reset())

    expect(result.current.generation).toBe(0)
    expect(result.current.grid).toHaveLength(2)
    expect(result.current.grid[0]).toHaveLength(2)
    expect(result.current.grid[0][0]).toHaveLength(2)
    expect(result.current.grid.flat(2).every((cell) => cell === false)).toBe(true)
  })

  it('resizeGrid changes the logical dimensions and resets the simulation', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))

    act(() => result.current.setCell(0, 0, 0, true))
    act(() => result.current.resizeGrid(4, 6, 8))

    expect(result.current.grid).toHaveLength(4)
    expect(result.current.grid[0]).toHaveLength(6)
    expect(result.current.grid[0][0]).toHaveLength(8)
    expect(result.current.generation).toBe(0)
  })

  it('generateRandom replaces the grid with a reproducible random one and resets the run state', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))

    act(() => result.current.start())
    act(() => result.current.step())
    act(() => result.current.generateRandom('ma-seed-3d', 0.5))

    const gridAfterFirstGenerate = result.current.grid
    expect(result.current.running).toBe(false)
    expect(result.current.generation).toBe(0)
    expect(gridAfterFirstGenerate.length).toBeGreaterThan(0)

    act(() => result.current.generateRandom('ma-seed-3d', 0.5))
    expect(result.current.grid).toEqual(gridAfterFirstGenerate)
  })

  it('generateRandom leaves the rules untouched when randomizeRules is not set', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))
    const initialRules = result.current.rules

    act(() => result.current.generateRandom('ma-seed-3d', 0.5))

    expect(result.current.rules).toBe(initialRules)
  })

  it('generateRandom also applies a random ruleset when randomizeRules is true', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))
    const initialRules = result.current.rules

    act(() => result.current.generateRandom('ma-seed-3d', 0.5, true))

    expect(result.current.rules).not.toBe(initialRules)
    expect(result.current.rules.birth).toBeInstanceOf(Set)
    expect(result.current.rules.survive).toBeInstanceOf(Set)
  })

  it('setRules updates the active ruleset', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 2, sizeY: 2, sizeZ: 2 }))
    const newRules = { birth: new Set([2]), survive: new Set([1]) }

    act(() => result.current.setRules(newRules))

    expect(result.current.rules).toBe(newRules)
  })

  it('changing rules mid-run does not delay the next tick and applies immediately', () => {
    const { result } = renderHook(() => useSimulation3D({ sizeX: 3, sizeY: 3, sizeZ: 3, speed: 100 }))

    // (0,1,1) et (2,1,1) vivantes -> (1,1,1) a 2 voisins vivants : morte
    // sous B6/S5-7 (défaut), naît sous une règle où B inclut 2
    act(() => result.current.setCell(0, 1, 1, true))
    act(() => result.current.setCell(2, 1, 1, true))
    act(() => result.current.start())

    // change de règle à mi-chemin du premier intervalle (t=60/100)
    act(() => vi.advanceTimersByTime(60))
    act(() => result.current.setRules({ birth: new Set([2]), survive: new Set([2, 3]) }))

    // si l'intervalle avait redémarré au changement de règle, le tick
    // suivant tomberait à t=160, pas à t=100 : on n'avance que jusqu'à 100
    act(() => vi.advanceTimersByTime(40))

    expect(result.current.generation).toBe(1)
    expect(result.current.grid[1][1][1]).toBe(true)
  })
})
