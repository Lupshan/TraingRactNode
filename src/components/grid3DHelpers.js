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
