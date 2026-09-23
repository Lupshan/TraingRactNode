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

export function cellsEqual(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  return a.x === b.x && a.y === b.y && a.z === b.z
}

// Détermine la profondeur à prévisualiser au survol de la grille : reprend
// la profondeur précédente si le pointeur n'a presque pas bougé à l'écran
// (on affine la même cible, éventuellement avancée à la molette), repart
// de la couche externe (index 0, sous la face survolée) sinon — le
// pointeur vise alors un nouvel endroit.
export function nextHoverTrack(previousTrack, screenPos, path, sameSpotThresholdPx) {
  const samePlace =
    previousTrack &&
    Math.hypot(
      screenPos.x - previousTrack.screenPos.x,
      screenPos.y - previousTrack.screenPos.y,
    ) <= sameSpotThresholdPx

  const depthIndex = samePlace
    ? Math.min(previousTrack.depthIndex, path.length - 1)
    : 0

  return { screenPos, path, depthIndex }
}

// Avance (deltaY > 0) ou recule (deltaY < 0) d'une cellule le long du
// trajet survolé, sans dépasser ses bornes (couche externe / couche la
// plus profonde).
export function stepHoverDepth(track, deltaY) {
  const step = deltaY > 0 ? 1 : -1
  const depthIndex = Math.min(
    Math.max(track.depthIndex + step, 0),
    track.path.length - 1,
  )
  return { ...track, depthIndex }
}

// Différencie un clic (édite la cellule prévisualisée) d'un glisser (fait
// tourner la vue via OrbitControls) : mesure la distance parcourue à
// l'écran entre l'appui et le relâchement du pointeur.
export function isClick(downPos, upPos, thresholdPx) {
  const distance = Math.hypot(upPos.x - downPos.x, upPos.y - downPos.y)
  return distance <= thresholdPx
}
