import { useState } from 'react'
import './App.css'
import { useSimulation } from './hooks/useSimulation'
import Grid from './components/Grid'
import Controls from './components/Controls'
import GridSettings from './components/GridSettings'
import RulesPanel from './components/RulesPanel'

const DEFAULT_CELL_SIZE = 16

function App() {
  const sim = useSimulation({ rows: 30, cols: 30, speed: 200 })
  const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE)

  return (
    <main className="app">
      <h1>Jeu de la vie</h1>

      <Grid grid={sim.grid} onCellClick={sim.toggleCell} cellSize={cellSize} />

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
        cellSize={cellSize}
        onCellSizeChange={setCellSize}
      />

      <RulesPanel rules={sim.rules} onChange={sim.setRules} />
    </main>
  )
}

export default App
