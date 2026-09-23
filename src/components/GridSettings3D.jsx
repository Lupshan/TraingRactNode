import RandomFillControls from './RandomFillControls'
import { useSyncedState } from '../hooks/useSyncedState'

function GridSettings3D({ sizeX, sizeY, sizeZ, onResizeGrid, onGenerateRandom }) {
  const [pendingX, setPendingX] = useSyncedState(sizeX)
  const [pendingY, setPendingY] = useSyncedState(sizeY)
  const [pendingZ, setPendingZ] = useSyncedState(sizeZ)

  function handleApply(event) {
    event.preventDefault()
    onResizeGrid(pendingX, pendingY, pendingZ)
  }

  return (
    <div className="grid-settings">
      <form onSubmit={handleApply}>
        <label>
          X
          <input
            type="number"
            min="1"
            value={pendingX}
            onChange={(event) => setPendingX(Number(event.target.value))}
          />
        </label>
        <label>
          Y
          <input
            type="number"
            min="1"
            value={pendingY}
            onChange={(event) => setPendingY(Number(event.target.value))}
          />
        </label>
        <label>
          Z
          <input
            type="number"
            min="1"
            value={pendingZ}
            onChange={(event) => setPendingZ(Number(event.target.value))}
          />
        </label>
        <button type="submit">Redimensionner la grille</button>
      </form>

      <RandomFillControls onGenerate={onGenerateRandom} />
    </div>
  )
}

export default GridSettings3D
