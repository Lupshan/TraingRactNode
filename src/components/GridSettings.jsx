import { useState } from 'react'

const MIN_CELL_SIZE = 4
const MAX_CELL_SIZE = 40

function GridSettings({ rows, cols, onResizeGrid, cellSize, onCellSizeChange }) {
  const [pendingRows, setPendingRows] = useState(rows)
  const [pendingCols, setPendingCols] = useState(cols)

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

      <label>
        Taille d&apos;affichage (px/cellule)
        <input
          type="range"
          min={MIN_CELL_SIZE}
          max={MAX_CELL_SIZE}
          value={cellSize}
          onChange={(event) => onCellSizeChange(Number(event.target.value))}
        />
      </label>
    </div>
  )
}

export default GridSettings
