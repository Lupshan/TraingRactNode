import { useEffect, useMemo, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { centerOffset, getAliveCellPositions } from './grid3DHelpers'

const CELL_SIZE = 0.85
const ALIVE_COLOR = '#a78bfa'
const GRID_HELPER_COLOR = '#605f6c'

function InstancedCells({ grid }) {
  const meshRef = useRef(null)
  const sizeX = grid.length
  const sizeY = grid[0]?.length ?? 0
  const sizeZ = grid[0]?.[0]?.length ?? 0
  const maxInstances = Math.max(sizeX * sizeY * sizeZ, 1)

  const positions = useMemo(() => getAliveCellPositions(grid), [grid])
  const offset = useMemo(() => centerOffset(sizeX, sizeY, sizeZ), [sizeX, sizeY, sizeZ])

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

function GridBounds({ sizeX, sizeY, sizeZ }) {
  // EdgesGeometry ne garde que les arêtes du cube (12), contrairement à
  // material wireframe sur un mesh qui dessinerait aussi les diagonales
  // internes des triangles de chaque face.
  const geometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(sizeX, sizeY, sizeZ)),
    [sizeX, sizeY, sizeZ],
  )

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={GRID_HELPER_COLOR} transparent opacity={0.4} />
    </lineSegments>
  )
}

function Grid3D({ grid }) {
  const sizeX = grid.length
  const sizeY = grid[0]?.length ?? 0
  const sizeZ = grid[0]?.[0]?.length ?? 0
  const cameraDistance = Math.max(sizeX, sizeY, sizeZ, 1) * 1.8 + 4

  return (
    <div className="grid3d-viewport" data-testid="grid3d-canvas">
      <Canvas camera={{ position: [cameraDistance, cameraDistance, cameraDistance], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <InstancedCells grid={grid} />
        <GridBounds sizeX={sizeX} sizeY={sizeY} sizeZ={sizeZ} />
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
    </div>
  )
}

export default Grid3D
