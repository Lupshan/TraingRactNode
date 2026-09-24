import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGridTargeting } from '../../hooks/useGridTargeting'

// Grille 3x3x3 vide, offset centré : un rayon droit sur l'axe X depuis
// (10,0,0) vers -X traverse exactement 3 cellules, de la plus proche de
// la caméra à la plus lointaine : (2,1,1) -> (1,1,1) -> (0,1,1).
const SIZE = 3
const RAY = { origin: { x: 10, y: 0, z: 0 }, direction: { x: -1, y: 0, z: 0 } }
const OUTER_CELL = { x: 2, y: 1, z: 1 }
const MIDDLE_CELL = { x: 1, y: 1, z: 1 }
const INNER_CELL = { x: 0, y: 1, z: 1 }
const MISSED_RAY = { origin: { x: 10, y: 50, z: 0 }, direction: { x: -1, y: 0, z: 0 } }

function emptyGrid() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => new Array(SIZE).fill(false)),
  )
}

function makeEvent({ pointerType = 'mouse', clientX = 100, clientY = 100, ray = RAY, deltaY } = {}) {
  return {
    pointerType,
    clientX,
    clientY,
    ray,
    deltaY,
    stopPropagation: vi.fn(),
  }
}

function renderTargeting(overrides = {}) {
  const onToggleCell = vi.fn()
  const props = {
    grid: emptyGrid(),
    sizeX: SIZE,
    sizeY: SIZE,
    sizeZ: SIZE,
    offset: [-1, -1, -1],
    onToggleCell,
    ...overrides,
  }
  const { result, rerender, unmount } = renderHook((p) => useGridTargeting(p), {
    initialProps: props,
  })
  return { result, rerender, unmount, onToggleCell, props }
}

describe('useGridTargeting — souris (survol + molette + clic)', () => {
  it('starts with no preview', () => {
    const { result } = renderTargeting()
    expect(result.current.previewCell).toBeNull()
  })

  it('previews the outer-layer cell on hover', () => {
    const { result } = renderTargeting()

    act(() => result.current.handlers.onPointerEnter(makeEvent()))

    expect(result.current.previewCell).toEqual(OUTER_CELL)
  })

  it('does nothing when the ray misses the grid', () => {
    const { result } = renderTargeting()

    act(() => result.current.handlers.onPointerEnter(makeEvent({ ray: MISSED_RAY })))

    expect(result.current.previewCell).toBeNull()
  })

  it('advances the preview deeper on wheel scroll down, clamped at the innermost layer', () => {
    const { result } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent()))

    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))
    expect(result.current.previewCell).toEqual(MIDDLE_CELL)

    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))
    expect(result.current.previewCell).toEqual(INNER_CELL)

    // déjà à la couche la plus profonde : encore un cran ne dépasse pas
    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))
    expect(result.current.previewCell).toEqual(INNER_CELL)
  })

  it('goes back up on wheel scroll up, clamped at the outer layer', () => {
    const { result } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent()))
    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))

    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: -1 })))
    expect(result.current.previewCell).toEqual(OUTER_CELL)

    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: -1 })))
    expect(result.current.previewCell).toEqual(OUTER_CELL)
  })

  it('wheel does nothing before any hover has established a session', () => {
    const { result } = renderTargeting()

    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))

    expect(result.current.previewCell).toBeNull()
  })

  it('does not reset the depth when the pointer barely moves within the same-spot threshold', () => {
    const { result } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent({ clientX: 100, clientY: 100 })))
    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))
    expect(result.current.previewCell).toEqual(MIDDLE_CELL)

    // léger tremblement (< seuil), même si le rayon fourni est identique :
    // la profondeur choisie à la molette doit rester intacte
    act(() => result.current.handlers.onPointerMove(makeEvent({ clientX: 103, clientY: 101 })))

    expect(result.current.previewCell).toEqual(MIDDLE_CELL)
  })

  it('resets to the outer layer once the pointer moves to a clearly different spot', () => {
    const { result } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent({ clientX: 100, clientY: 100 })))
    act(() => result.current.handlers.onWheel(makeEvent({ deltaY: 1 })))
    expect(result.current.previewCell).toEqual(MIDDLE_CELL)

    act(() => result.current.handlers.onPointerMove(makeEvent({ clientX: 300, clientY: 100 })))

    expect(result.current.previewCell).toEqual(OUTER_CELL)
  })

  it('commits the previewed cell on a click (down/up close together)', () => {
    const { result, onToggleCell } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent()))

    act(() => {
      result.current.handlers.onPointerDown(makeEvent({ clientX: 100, clientY: 100 }))
      result.current.handlers.onPointerUp(makeEvent({ clientX: 101, clientY: 100 }))
    })

    expect(onToggleCell).toHaveBeenCalledWith(2, 1, 1, true)
  })

  it('does not commit on a drag (down/up far apart)', () => {
    const { result, onToggleCell } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent()))

    act(() => {
      result.current.handlers.onPointerDown(makeEvent({ clientX: 100, clientY: 100 }))
      result.current.handlers.onPointerUp(makeEvent({ clientX: 200, clientY: 100 }))
    })

    expect(onToggleCell).not.toHaveBeenCalled()
  })

  it('reads the live grid state when committing (toggles an already-alive cell off)', () => {
    const grid = emptyGrid()
    grid[2][1][1] = true
    const { result, onToggleCell } = renderTargeting({ grid })
    act(() => result.current.handlers.onPointerEnter(makeEvent()))

    act(() => {
      result.current.handlers.onPointerDown(makeEvent())
      result.current.handlers.onPointerUp(makeEvent())
    })

    expect(onToggleCell).toHaveBeenCalledWith(2, 1, 1, false)
  })

  it('clears the preview on pointer leave', () => {
    const { result } = renderTargeting()
    act(() => result.current.handlers.onPointerEnter(makeEvent()))
    expect(result.current.previewCell).not.toBeNull()

    act(() => result.current.handlers.onPointerLeave(makeEvent()))

    expect(result.current.previewCell).toBeNull()
  })
})

describe('useGridTargeting — tactile (taps répétés + pause pour valider)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function tap({ result }, opts = {}) {
    act(() => {
      result.current.handlers.onPointerDown(makeEvent({ pointerType: 'touch', ...opts }))
      result.current.handlers.onPointerUp(makeEvent({ pointerType: 'touch', ...opts }))
    })
  }

  it('a first tap previews the outer layer without committing', () => {
    const harness = renderTargeting()
    tap(harness)

    expect(harness.result.current.previewCell).toEqual(OUTER_CELL)
    expect(harness.onToggleCell).not.toHaveBeenCalled()
  })

  it('a second tap at the same spot advances the preview one layer deeper', () => {
    const harness = renderTargeting()
    tap(harness)
    tap(harness)

    expect(harness.result.current.previewCell).toEqual(MIDDLE_CELL)
  })

  it('pointer move does not drive the preview on touch (no hover on a finger)', () => {
    const { result } = renderTargeting()

    act(() => result.current.handlers.onPointerMove(makeEvent({ pointerType: 'touch' })))

    expect(result.current.previewCell).toBeNull()
  })

  it('commits the previewed cell after the pause delay with no further tap', () => {
    const harness = renderTargeting()
    tap(harness)
    tap(harness) // depth 1 (middle cell)

    act(() => vi.advanceTimersByTime(2500))

    expect(harness.onToggleCell).toHaveBeenCalledTimes(1)
    expect(harness.onToggleCell).toHaveBeenCalledWith(1, 1, 1, true)
    expect(harness.result.current.previewCell).toBeNull()
  })

  it('a tap before the pause delay cancels the pending commit and keeps drilling', () => {
    const harness = renderTargeting()
    tap(harness)
    act(() => vi.advanceTimersByTime(2000))
    tap(harness) // still within the delay: continues the same session

    act(() => vi.advanceTimersByTime(2000))
    expect(harness.onToggleCell).not.toHaveBeenCalled() // 4000ms since tap 1, but only 2000ms since tap 2

    act(() => vi.advanceTimersByTime(500))
    expect(harness.onToggleCell).toHaveBeenCalledTimes(1)
  })

  it('tapping a clearly different spot abandons the pending selection without committing it', () => {
    const harness = renderTargeting()
    tap(harness, { clientX: 100, clientY: 100 })
    expect(harness.result.current.previewCell).toEqual(OUTER_CELL)

    tap(harness, { clientX: 400, clientY: 100 }) // nouvel endroit : nouvelle session, profondeur 0
    expect(harness.result.current.previewCell).toEqual(OUTER_CELL)

    act(() => vi.advanceTimersByTime(2500))

    // une seule cellule validée au total (celle de la 2e session)
    expect(harness.onToggleCell).toHaveBeenCalledTimes(1)
  })

  it('clears the pending commit timer on unmount (no commit, no error, after unmount)', () => {
    const harness = renderTargeting()
    tap(harness)

    harness.unmount()

    expect(() => act(() => vi.advanceTimersByTime(5000))).not.toThrow()
    expect(harness.onToggleCell).not.toHaveBeenCalled()
  })

  it('does nothing when the ray misses the grid', () => {
    const harness = renderTargeting()
    tap(harness, { ray: MISSED_RAY })

    expect(harness.result.current.previewCell).toBeNull()
  })
})
