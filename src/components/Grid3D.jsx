import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  cellsEqual,
  centerOffset,
  computeRayGridPath,
  getAliveCellPositions,
  isClick,
  nextHoverTrack,
  stepHoverDepth,
} from './grid3DHelpers'

const CELL_SIZE = 0.85
const ALIVE_COLOR = '#a78bfa'
const PREVIEW_ADD_COLOR = '#22c55e'
const PREVIEW_REMOVE_COLOR = '#ef4444'
const PREVIEW_OPACITY = 0.5
const GRID_HELPER_COLOR = '#605f6c'
// Différencie un clic (édite une cellule) d'un glisser (fait tourner la
// vue via OrbitControls) : en dessous de ce seuil de déplacement entre
// pointerdown et pointerup, on considère qu'il n'y a pas eu de rotation.
const CLICK_DRAG_THRESHOLD_PX = 5
// Si le pointeur se déplace de plus que ce seuil à l'écran depuis le
// dernier survol, on considère qu'il vise un nouvel endroit : la
// profondeur choisie à la molette est réinitialisée à la couche externe
// (la plus proche de la caméra), sous la face survolée.
const SAME_SPOT_THRESHOLD_PX = 8

// Ni onClick seul (qui se déclenche aussi après un glisser de rotation,
// R3F ne fait pas la distinction) ni une dépendance à OrbitControls pour
// le savoir : on mesure nous-mêmes la distance parcourue entre l'appui et
// le relâchement du pointeur.
function useClickNotDrag(onValidClick) {
  const pointerDownPos = useRef(null)

  return {
    onPointerDown: (event) => {
      pointerDownPos.current = { x: event.clientX, y: event.clientY }
    },
    onPointerUp: (event) => {
      const down = pointerDownPos.current
      pointerDownPos.current = null
      if (!down) return

      const up = { x: event.clientX, y: event.clientY }
      if (!isClick(down, up, CLICK_DRAG_THRESHOLD_PX)) return

      onValidClick(event)
    },
  }
}

function InstancedCells({ grid, offset }) {
  const meshRef = useRef(null)
  const sizeX = grid.length
  const sizeY = grid[0]?.length ?? 0
  const sizeZ = grid[0]?.[0]?.length ?? 0
  const maxInstances = Math.max(sizeX * sizeY * sizeZ, 1)

  const positions = useMemo(() => getAliveCellPositions(grid), [grid])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const matrix = new THREE.Matrix4()
    positions.forEach(([x, y, z], i) => {
      matrix.setPosition(x + offset[0], y + offset[1], z + offset[2])
      mesh.setMatrixAt(i, matrix)
    })
    mesh.count = positions.length
    mesh.instanceMatrix.needsUpdate = true
  }, [positions, offset])

  return (
    <instancedMesh
      key={maxInstances}
      ref={meshRef}
      args={[undefined, undefined, maxInstances]}
      frustumCulled={false}
    >
      <boxGeometry args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} />
      <meshStandardMaterial color={ALIVE_COLOR} />
    </instancedMesh>
  )
}

function GridWireframe({ sizeX, sizeY, sizeZ }) {
  // EdgesGeometry ne garde que les arêtes du cube (12), contrairement à
  // material wireframe sur un mesh qui dessinerait aussi les diagonales
  // internes des triangles de chaque face.
  const geometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(sizeX, sizeY, sizeZ)),
    [sizeX, sizeY, sizeZ],
  )

  return (
    <lineSegments geometry={geometry} raycast={() => null}>
      <lineBasicMaterial color={GRID_HELPER_COLOR} transparent opacity={0.4} />
    </lineSegments>
  )
}

// Aperçu de la cellule actuellement visée : suit le survol et la molette
// en direct, avant que le clic ne la valide. Vert si elle est morte (le
// clic l'allumerait), rouge si elle est vivante (le clic l'éteindrait).
// Pas de cible de raycast dessus : elle est rendue juste devant/dans la
// cellule visée et ne doit jamais s'intercepter elle-même au survol
// suivant.
function PreviewCell({ cell, offset, willRemove }) {
  if (!cell) return null

  return (
    <mesh
      position={[cell.x + offset[0], cell.y + offset[1], cell.z + offset[2]]}
      raycast={() => null}
    >
      <boxGeometry args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]} />
      <meshBasicMaterial
        color={willRemove ? PREVIEW_REMOVE_COLOR : PREVIEW_ADD_COLOR}
        transparent
        opacity={PREVIEW_OPACITY}
      />
    </mesh>
  )
}

// Boîte invisible superposée au contour de la grille, seule cible de
// raycast pour l'édition (les petits cubes des cellules vivantes, plus
// en retrait, ne sont jamais la surface la plus proche de la caméra à
// cet endroit — cette boîte les intercepterait de toute façon). Au
// survol, on calcule le trajet complet du rayon à travers la grille : la
// première cellule (la couche externe, sous la face visée) est
// prévisualisée par défaut. La molette avance ou recule le long de ce
// trajet pour atteindre l'intérieur du cube sans avoir à re-cliquer. Le
// clic valide la cellule actuellement prévisualisée.
function GridInteraction({
  grid,
  sizeX,
  sizeY,
  sizeZ,
  offset,
  onToggleCell,
  onHoverChange,
}) {
  const trackRef = useRef(null)

  const updatePath = useCallback(
    (event) => {
      if (!event.ray) return

      const path = computeRayGridPath({
        origin: event.ray.origin,
        direction: event.ray.direction,
        sizeX,
        sizeY,
        sizeZ,
        offset,
      })
      if (path.length === 0) {
        trackRef.current = null
        onHoverChange(null)
        return
      }

      const screenPos = { x: event.clientX, y: event.clientY }
      const track = nextHoverTrack(
        trackRef.current,
        screenPos,
        path,
        SAME_SPOT_THRESHOLD_PX,
      )
      trackRef.current = track
      onHoverChange(track.path[track.depthIndex])
    },
    [sizeX, sizeY, sizeZ, offset, onHoverChange],
  )

  const handleWheel = useCallback(
    (event) => {
      const track = trackRef.current
      if (!track) return
      // R3F attache l'écouteur wheel en mode passif : preventDefault()
      // n'a aucun effet dessus (et lève un avertissement) — stopPropagation
      // suffit, la molette ne fait de toute façon rien défiler ici (le
      // viewport 3D n'a pas de scroll, cf. .grid3d-viewport en CSS).
      event.stopPropagation()

      const nextTrack = stepHoverDepth(track, event.deltaY)
      trackRef.current = nextTrack
      onHoverChange(nextTrack.path[nextTrack.depthIndex])
    },
    [onHoverChange],
  )

  const handleLeave = useCallback(() => {
    trackRef.current = null
    onHoverChange(null)
  }, [onHoverChange])

  const clickHandlers = useClickNotDrag((event) => {
    const track = trackRef.current
    if (!track) return
    event.stopPropagation()

    const cell = track.path[track.depthIndex]
    const alreadyAlive = grid[cell.x]?.[cell.y]?.[cell.z] ?? false
    onToggleCell(cell.x, cell.y, cell.z, !alreadyAlive)
  })

  return (
    <mesh
      {...clickHandlers}
      onPointerMove={updatePath}
      onPointerEnter={updatePath}
      onPointerLeave={handleLeave}
      onWheel={handleWheel}
    >
      <boxGeometry args={[sizeX, sizeY, sizeZ]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

function Grid3D({ grid, onToggleCell }) {
  const sizeX = grid.length
  const sizeY = grid[0]?.length ?? 0
  const sizeZ = grid[0]?.[0]?.length ?? 0
  const offset = useMemo(
    () => centerOffset(sizeX, sizeY, sizeZ),
    [sizeX, sizeY, sizeZ],
  )
  const cameraDistance = Math.max(sizeX, sizeY, sizeZ, 1) * 1.8 + 4

  const [previewCell, setPreviewCell] = useState(null)

  const handleHoverChange = useCallback((cell) => {
    setPreviewCell((current) => (cellsEqual(current, cell) ? current : cell))
  }, [])

  const willRemove = previewCell
    ? (grid[previewCell.x]?.[previewCell.y]?.[previewCell.z] ?? false)
    : false

  return (
    <div className="grid3d-viewport" data-testid="grid3d-canvas">
      <Canvas
        camera={{
          position: [cameraDistance, cameraDistance, cameraDistance],
          fov: 50,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <InstancedCells grid={grid} offset={offset} />
        <GridWireframe sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} />
        <PreviewCell cell={previewCell} offset={offset} willRemove={willRemove} />
        <GridInteraction
          grid={grid}
          sizeX={sizeX}
          sizeY={sizeY}
          sizeZ={sizeZ}
          offset={offset}
          onToggleCell={onToggleCell}
          onHoverChange={handleHoverChange}
        />
        <OrbitControls target={[0, 0, 0]} enableZoom={!previewCell} />
      </Canvas>
    </div>
  )
}

export default Grid3D
