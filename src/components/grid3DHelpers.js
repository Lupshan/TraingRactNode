// Logique pure, indépendante de Three.js/react-three-fiber (donc testable
// sans WebGL) : extraire les coordonnées des cellules vivantes et centrer
// la grille sur l'origine pour qu'OrbitControls tourne autour du centre
// du cube plutôt que d'un coin.

export function getAliveCellPositions(grid) {
  const positions = []

  grid.forEach((plane, x) => {
    plane.forEach((row, y) => {
      row.forEach((alive, z) => {
        if (alive) positions.push([x, y, z])
      })
    })
  })

  return positions
}

export function centerOffset(sizeX, sizeY, sizeZ) {
  return [-(sizeX - 1) / 2, -(sizeY - 1) / 2, -(sizeZ - 1) / 2]
}

const AXES = ['x', 'y', 'z']

// Intersection rayon/boîte alignée sur les axes (méthode des tranches) :
// renvoie les paramètres t d'entrée et de sortie le long du rayon (0 =
// origine), ou null s'il ne touche pas la boîte. La boîte est centrée sur
// l'origine (comme GridClickTarget, sans transformation), donc le repère
// local vaut le repère monde ici aussi.
export function intersectRayBox(origin, direction, sizeX, sizeY, sizeZ) {
  const half = { x: sizeX / 2, y: sizeY / 2, z: sizeZ / 2 }
  let tNear = -Infinity
  let tFar = Infinity

  for (const axis of AXES) {
    const o = origin[axis]
    const d = direction[axis]

    if (Math.abs(d) < 1e-9) {
      if (o < -half[axis] || o > half[axis]) return null
      continue
    }

    let t1 = (-half[axis] - o) / d
    let t2 = (half[axis] - o) / d
    if (t1 > t2) [t1, t2] = [t2, t1]
    tNear = Math.max(tNear, t1)
    tFar = Math.min(tFar, t2)
    if (tNear > tFar) return null
  }

  if (tFar < 0) return null
  return { tNear: Math.max(tNear, 0), tFar }
}

// Pas d'échantillonnage le long du rayon pour le mode fantôme : la
// direction est un vecteur unitaire (rayon de caméra), donc un pas de 0.5
// ne peut jamais déplacer un axe de plus de 0.5 unité — impossible de
// sauter une cellule entière (espacées d'1 unité).
const RAY_STEP = 0.5

function clampIndex(value, size) {
  return Math.min(Math.max(value, 0), size - 1)
}

// Liste ordonnée (de la plus proche de la caméra à la plus lointaine) des
// cellules de grille traversées par un rayon à l'intérieur de la boîte,
// dédoublonnée. Sert au mode fantôme : cliquer plusieurs fois au même
// endroit avance d'une cellule à la fois le long de ce trajet, pour
// atteindre l'intérieur de la grille sans passer par les faces déjà
// démolies.
export function computeRayGridPath({
  origin,
  direction,
  sizeX,
  sizeY,
  sizeZ,
  offset,
}) {
  const hit = intersectRayBox(origin, direction, sizeX, sizeY, sizeZ)
  if (!hit) return []

  const { tNear, tFar } = hit
  const size = { x: sizeX, y: sizeY, z: sizeZ }
  const path = []
  let lastKey = null

  const sampleAt = (t) => {
    const cell = {}
    AXES.forEach((axis, i) => {
      const raw = Math.round(origin[axis] + direction[axis] * t - offset[i])
      cell[axis] = clampIndex(raw, size[axis])
    })
    return cell
  }

  const pushUnique = (cell) => {
    const key = `${cell.x},${cell.y},${cell.z}`
    if (key === lastKey) return
    path.push(cell)
    lastKey = key
  }

  for (let t = tNear; t < tFar; t += RAY_STEP) {
    pushUnique(sampleAt(t))
  }
  pushUnique(sampleAt(tFar))

  return path
}
