import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import './App.css'
import { useSimulation } from './hooks/useSimulation'
import { useSimulation3D } from './hooks/useSimulation3D'
import Grid from './components/Grid'
import Controls from './components/Controls'
import GridSettings from './components/GridSettings'
import GridSettings3D from './components/GridSettings3D'
import RulesPanel from './components/RulesPanel'
import RulesPanel3D from './components/RulesPanel3D'
import PatternLibrary from './components/PatternLibrary'

// Three.js/react-three-fiber ne sont utiles qu'en mode 3D (bascule non
// temps réel, cf. CLAUDE.md) ; on les charge à la demande pour ne pas
// alourdir le bundle initial des visiteurs qui restent en 2D.
const Grid3D = lazy(() => import('./components/Grid3D'))

const MIN_CELL_SIZE = 20

function App() {
  const sim2D = useSimulation({ rows: 30, cols: 30, speed: 200 })
  const sim3D = useSimulation3D({ sizeX: 12, sizeY: 12, sizeZ: 12, speed: 300 })
  const [dimension, setDimension] = useState('2d')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [armedPattern, setArmedPattern] = useState(null)
  const [ghostMode, setGhostMode] = useState(false)

  const sim = dimension === '2d' ? sim2D : sim3D

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') setArmedPattern(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleDimensionChange = useCallback(
    (next) => {
      if (next === dimension) return
      // bascule non temps réel : on réinitialise la grille et le moteur
      // des deux dimensions (cf. CLAUDE.md)
      sim2D.reset()
      sim3D.reset()
      setArmedPattern(null)
      setDimension(next)
    },
    [dimension, sim2D, sim3D],
  )

  const handleStampPlace = useCallback(
    (row, col) => {
      if (!armedPattern) return
      const height = armedPattern.cells.length
      const width = armedPattern.cells[0]?.length ?? 0
      sim2D.stampPattern(
        row - Math.floor(height / 2),
        col - Math.floor(width / 2),
        armedPattern.cells,
      )
    },
    [armedPattern, sim2D],
  )

  return (
    <div className="app">
      <aside className={`sidebar${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <h1>Jeu de la vie</h1>

        <div
          className="dimension-toggle chip-group"
          role="group"
          aria-label="Dimension de la simulation"
        >
          <button
            type="button"
            className="chip"
            aria-pressed={dimension === '2d'}
            onClick={() => handleDimensionChange('2d')}
          >
            2D
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={dimension === '3d'}
            onClick={() => handleDimensionChange('3d')}
          >
            3D
          </button>
        </div>

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

        {dimension === '2d' ? (
          <>
            <GridSettings
              rows={sim2D.grid.length}
              cols={sim2D.grid[0]?.length ?? 0}
              onResizeGrid={sim2D.resizeGrid}
            />

            <RulesPanel rules={sim2D.rules} onChange={sim2D.setRules} />

            <PatternLibrary
              armedPatternId={armedPattern?.id ?? null}
              onArm={setArmedPattern}
              onCancelArm={() => setArmedPattern(null)}
              grid={sim2D.grid}
            />
          </>
        ) : (
          <>
            <GridSettings3D
              sizeX={sim3D.grid.length}
              sizeY={sim3D.grid[0]?.length ?? 0}
              sizeZ={sim3D.grid[0]?.[0]?.length ?? 0}
              onResizeGrid={sim3D.resizeGrid}
            />

            <RulesPanel3D rules={sim3D.rules} onChange={sim3D.setRules} />

            <button
              type="button"
              className="chip ghost-mode-toggle"
              aria-pressed={ghostMode}
              onClick={() => setGhostMode((mode) => !mode)}
            >
              Mode fantôme {ghostMode ? '(activé)' : '(désactivé)'}
            </button>
            {ghostMode && (
              <p className="ghost-mode-hint">
                Cellules semi-transparentes : re-clique au même endroit pour
                avancer d'une cellule vers l'intérieur.
              </p>
            )}
          </>
        )}
      </aside>

      <div className="grid-viewport">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-expanded={sidebarOpen}
          aria-label={
            sidebarOpen ? 'Masquer les paramètres' : 'Afficher les paramètres'
          }
        >
          {sidebarOpen ? '«' : '»'}
        </button>

        {dimension === '2d' ? (
          <Grid
            grid={sim2D.grid}
            onCellPaint={sim2D.setCell}
            minCellSize={MIN_CELL_SIZE}
            stampPattern={armedPattern?.cells ?? null}
            onStampPlace={handleStampPlace}
          />
        ) : (
          <Suspense
            fallback={
              <div className="grid3d-loading">Chargement du rendu 3D…</div>
            }
          >
            <Grid3D
              grid={sim3D.grid}
              onToggleCell={sim3D.setCell}
              ghostMode={ghostMode}
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default App
