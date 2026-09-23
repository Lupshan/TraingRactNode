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

// À partir du point d'impact et de la normale d'une face touchée sur la
// boîte englobante de la grille (repère local = repère monde, la boîte
// n'étant ni tournée ni mise à l'échelle), retrouve la cellule de la
// couche externe correspondante : l'axe de la normale donne directement
// la couche (première ou dernière), les deux autres axes sont déduits du
// point d'impact et bornés aux dimensions de la grille.
export function resolveCellFromBoxFaceHit({ point, normal, sizeX, sizeY, sizeZ, offset }) {
  const size = { x: sizeX, y: sizeY, z: sizeZ }
  const normalAxis = AXES.find((axis) => normal[axis] !== 0)
  const cell = {}

  AXES.forEach((axis, i) => {
    if (axis === normalAxis) {
      cell[axis] = normal[axis] > 0 ? size[axis] - 1 : 0
    } else {
      const raw = Math.round(point[axis] - offset[i])
      cell[axis] = Math.min(Math.max(raw, 0), size[axis] - 1)
    }
  })

  return cell
}
