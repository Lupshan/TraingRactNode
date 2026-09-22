import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createEmptyGrid,
  DEFAULT_RULES,
  nextGeneration,
  setCellEngine,
  toggleCellEngine,
} from '../engine/gameOfLife'

const DEFAULT_ROWS = 30
const DEFAULT_COLS = 30
const DEFAULT_SPEED_MS = 200

export function useSimulation({
  rows = DEFAULT_ROWS,
  cols = DEFAULT_COLS,
  speed = DEFAULT_SPEED_MS,
} = {}) {
  const [grid, setGrid] = useState(() => createEmptyGrid(rows, cols))
  const [generation, setGeneration] = useState(0)
  const [running, setRunning] = useState(false)
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [intervalMs, setSpeed] = useState(speed)

  // Lu par step() à chaque tick, pour ne jamais figer les règles actives
  // au moment où l'intervalle a été programmé (cf. tasks/04).
  const rulesRef = useRef(rules)
  useEffect(() => {
    rulesRef.current = rules
  }, [rules])

  const step = useCallback(() => {
    setGrid((current) => nextGeneration(current, rulesRef.current))
    setGeneration((gen) => gen + 1)
  }, [])

  useEffect(() => {
    if (!running) return undefined

    const id = setInterval(step, intervalMs)
    return () => clearInterval(id)
  }, [running, intervalMs, step])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])

  const reset = useCallback(() => {
    setRunning(false)
    setGeneration(0)
    setGrid((current) => createEmptyGrid(current.length, current[0]?.length ?? 0))
  }, [])

  const resizeGrid = useCallback((nextRows, nextCols) => {
    setRunning(false)
    setGeneration(0)
    setGrid(createEmptyGrid(nextRows, nextCols))
  }, [])

  const toggleCell = useCallback(
    (row, col) => {
      if (running) return
      setGrid((current) => toggleCellEngine(current, row, col))
    },
    [running],
  )

  const setCell = useCallback(
    (row, col, alive) => {
      if (running) return
      setGrid((current) => setCellEngine(current, row, col, alive))
    },
    [running],
  )

  return {
    grid,
    generation,
    running,
    rules,
    speed: intervalMs,
    start,
    pause,
    step,
    reset,
    resizeGrid,
    toggleCell,
    setCell,
    setRules,
    setSpeed,
  }
}
