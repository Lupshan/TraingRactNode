import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createEmptyGrid,
  DEFAULT_RULES,
  nextGeneration,
  setCellEngine,
  stampPatternEngine,
  toggleCellEngine,
} from '../engine/gameOfLife'
import { generateRandomGrid2D } from '../engine/randomGrid'

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

  const generateRandom = useCallback((seed, density, randomizeRules = false) => {
    setRunning(false)
    setGeneration(0)
    const { grid: nextGrid, rules: nextRules } = generateRandomGrid2D(seed, density, {
      randomizeRules,
    })
    setGrid(nextGrid)
    if (nextRules) setRules(nextRules)
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

  const stampPattern = useCallback(
    (row, col, pattern) => {
      if (running) return
      setGrid((current) => stampPatternEngine(current, row, col, pattern))
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
    generateRandom,
    toggleCell,
    setCell,
    stampPattern,
    setRules,
    setSpeed,
  }
}
