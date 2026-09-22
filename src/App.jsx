import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { useSimulation } from './hooks/useSimulation'
import Grid from './components/Grid'
import Controls from './components/Controls'
import GridSettings from './components/GridSettings'
import RulesPanel from './components/RulesPanel'
import PatternLibrary from './components/PatternLibrary'

const MIN_CELL_SIZE = 20

function App() {
  const sim = useSimulation({ rows: 30, cols: 30, speed: 200 })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [armedPattern, setArmedPattern] = useState(null)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') setArmedPattern(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleStampPlace = useCallback(
    (row, col) => {
      if (!armedPattern) return
      const height = armedPattern.cells.length
      const width = armedPattern.cells[0]?.length ?? 0
      sim.stampPattern(row - Math.floor(height / 2), col - Math.floor(width / 2), armedPattern.cells)
    },
    [armedPattern, sim],
  )

  return (
    <div className="app">
      <aside className={`sidebar${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <h1>Jeu de la vie</h1>

        <Controls
          running={sim.running}
          generation={sim.generation}
          speed={sim.speed}
          onStart={sim.start}
          onPause={sim.pause}
          onStep={sim.step}
          onReset={sim.reset}
          onSpeedChange={sim.setSpeed}
        />

        <GridSettings
          rows={sim.grid.length}
          cols={sim.grid[0]?.length ?? 0}
          onResizeGrid={sim.resizeGrid}
        />

        <RulesPanel rules={sim.rules} onChange={sim.setRules} />

        <PatternLibrary
          armedPatternId={armedPattern?.id ?? null}
          onArm={setArmedPattern}
          onCancelArm={() => setArmedPattern(null)}
          grid={sim.grid}
        />
      </aside>

      <div className="grid-viewport">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Masquer les paramètres' : 'Afficher les paramètres'}
        >
          {sidebarOpen ? '«' : '»'}
        </button>

        <Grid
          grid={sim.grid}
          onCellPaint={sim.setCell}
          minCellSize={MIN_CELL_SIZE}
          stampPattern={armedPattern?.cells ?? null}
          onStampPlace={handleStampPlace}
        />
      </div>
    </div>
  )
}

export default App
