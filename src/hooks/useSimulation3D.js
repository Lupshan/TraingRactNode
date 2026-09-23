import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createEmptyGrid3D,
  DEFAULT_RULES_3D,
  nextGeneration3D,
  setCellEngine3D,
} from '../engine/gameOfLife3D'

const DEFAULT_SIZE = 12
const DEFAULT_SPEED_MS = 300

export function useSimulation3D({
  sizeX = DEFAULT_SIZE,
  sizeY = DEFAULT_SIZE,
  sizeZ = DEFAULT_SIZE,
  speed = DEFAULT_SPEED_MS,
} = {}) {
  const [grid, setGrid] = useState(() => createEmptyGrid3D(sizeX, sizeY, sizeZ))
  const [generation, setGeneration] = useState(0)
  const [running, setRunning] = useState(false)
  const [rules, setRules] = useState(DEFAULT_RULES_3D)
  const [intervalMs, setSpeed] = useState(speed)

  // Même principe qu'en 2D (cf. tasks/04) : les règles sont lues via une
  // ref à chaque tick pour rester modifiables en temps réel sans
  // redémarrer l'intervalle.
  const rulesRef = useRef(rules)
  useEffect(() => {
    rulesRef.current = rules
  }, [rules])

  const step = useCallback(() => {
    setGrid((current) => nextGeneration3D(current, rulesRef.current))
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
    setGrid((current) => createEmptyGrid3D(current.length, current[0]?.length ?? 0, current[0]?.[0]?.length ?? 0))
  }, [])

  const resizeGrid = useCallback((nextSizeX, nextSizeY, nextSizeZ) => {
    setRunning(false)
    setGeneration(0)
    setGrid(createEmptyGrid3D(nextSizeX, nextSizeY, nextSizeZ))
  }, [])

  const setCell = useCallback(
    (x, y, z, alive) => {
      if (running) return
      setGrid((current) => setCellEngine3D(current, x, y, z, alive))
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
    setCell,
    setRules,
    setSpeed,
  }
}
