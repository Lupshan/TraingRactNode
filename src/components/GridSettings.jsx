import RandomFillControls from './RandomFillControls'
import { useSyncedState } from '../hooks/useSyncedState'

function GridSettings({ rows, cols, onResizeGrid, onGenerateRandom }) {
  const [pendingRows, setPendingRows] = useSyncedState(rows)
  const [pendingCols, setPendingCols] = useSyncedState(cols)

  function handleApply(event) {
    event.preventDefault()
    onResizeGrid(pendingRows, pendingCols)
  }

  return (
    <div className="grid-settings">
      <form onSubmit={handleApply}>
        <label>
          Lignes
          <input
            type="number"
            min="1"
            value={pendingRows}
            onChange={(event) => setPendingRows(Number(event.target.value))}
          />
        </label>
        <label>
          Colonnes
          <input
            type="number"
            min="1"
            value={pendingCols}
            onChange={(event) => setPendingCols(Number(event.target.value))}
          />
        </label>
        <button type="submit">Redimensionner la grille</button>
      </form>

      <RandomFillControls onGenerate={onGenerateRandom} />
    </div>
  )
}

export default GridSettings
