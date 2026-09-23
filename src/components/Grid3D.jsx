import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { centerOffset, getAliveCellPositions, resolveCellFromBoxFaceHit } from './grid3DHelpers'

const CELL_SIZE = 0.85
const ALIVE_COLOR = '#a78bfa'
const GRID_HELPER_COLOR = '#605f6c'
// Différencie un clic (édite une cellule) d'un glisser (fait tourner la
// vue via OrbitControls) : en dessous de ce seuil de déplacement entre
// pointerdown et pointerup, on considère qu'il n'y a pas eu de rotation.
const CLICK_DRAG_THRESHOLD_PX = 5

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

      const distance = Math.hypot(event.clientX - down.x, event.clientY - down.y)
      if (distance > CLICK_DRAG_THRESHOLD_PX) return

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

// Boîte invisible superposée au contour de la grille, seule cible de
// raycast pour l'édition (les petits cubes des cellules vivantes, plus
// en retrait, ne sont jamais la surface la plus proche de la caméra à
// cet endroit — cette boîte les intercepterait de toute façon). On lit
// donc l'état réel de la grille à la position visée pour savoir s'il
// faut l'allumer ou l'éteindre, plutôt que de dépendre de quel mesh le
// rayon a effectivement touché.
function GridClickTarget({ grid, sizeX, sizeY, sizeZ, offset, onToggleCell }) {
  const clickHandlers = useClickNotDrag((event) => {
    if (!event.face) return
    event.stopPropagation()
    const cell = resolveCellFromBoxFaceHit({
      point: event.point,
      normal: event.face.normal,
      sizeX,
      sizeY,
      sizeZ,
      offset,
    })
    const alreadyAlive = grid[cell.x]?.[cell.y]?.[cell.z] ?? false
    onToggleCell(cell.x, cell.y, cell.z, !alreadyAlive)
  })

  return (
    <mesh {...clickHandlers}>
      <boxGeometry args={[sizeX, sizeY, sizeZ]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

function Grid3D({ grid, onToggleCell }) {
  const sizeX = grid.length
  const sizeY = grid[0]?.length ?? 0
  const sizeZ = grid[0]?.[0]?.length ?? 0
  const offset = useMemo(() => centerOffset(sizeX, sizeY, sizeZ), [sizeX, sizeY, sizeZ])
  const cameraDistance = Math.max(sizeX, sizeY, sizeZ, 1) * 1.8 + 4

  return (
    <div className="grid3d-viewport" data-testid="grid3d-canvas">
      <Canvas camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <InstancedCells grid={grid} offset={offset} />
        <GridWireframe sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} />
        <GridClickTarget
          grid={grid}
          sizeX={sizeX}
          sizeY={sizeY}
          sizeZ={sizeZ}
          offset={offset}
          onToggleCell={onToggleCell}
        />
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
    </div>
  )
}

export default Grid3D
