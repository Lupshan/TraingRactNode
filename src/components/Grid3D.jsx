import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { centerOffset, getAliveCellPositions } from './grid3DHelpers'
import { useGridTargeting } from '../hooks/useGridTargeting'

const CELL_SIZE = 0.85
const ALIVE_COLOR = '#a78bfa'
const PREVIEW_ADD_COLOR = '#22c55e'
const PREVIEW_REMOVE_COLOR = '#ef4444'
const PREVIEW_OPACITY = 0.5
const GRID_HELPER_COLOR = '#605f6c'

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

// Aperçu de la cellule actuellement visée : suit le survol/tap et la
// molette en direct, avant qu'un clic ou une pause (tactile) ne la
// valide. Vert si elle est morte (la validation l'allumerait), rouge si
// elle est vivante (la validation l'éteindrait). Pas de cible de raycast
// dessus : elle est rendue juste devant/dans la cellule visée et ne doit
// jamais s'intercepter elle-même au survol suivant.
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
// en retrait, ne sont jamais la surface la plus proche de la caméra à cet
// endroit — cette boîte les intercepterait de toute façon). Purement
// présentationnelle : toute la logique de ciblage vit dans
// useGridTargeting (cf. Grid3D ci-dessous), testable sans WebGL.
function GridInteraction({ sizeX, sizeY, sizeZ, handlers }) {
  return (
    <mesh {...handlers}>
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

  const { previewCell, handlers } = useGridTargeting({
    grid,
    sizeX,
    sizeY,
    sizeZ,
    offset,
    onToggleCell,
  })

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
        <GridInteraction sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} handlers={handlers} />
        <OrbitControls target={[0, 0, 0]} enableZoom={!previewCell} />
      </Canvas>
    </div>
  )
}

export default Grid3D
