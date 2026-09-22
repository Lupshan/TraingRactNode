// Grille petite par rapport à l'espace dispo -> les cellules grandissent
// pour remplir l'écran. Grille grande -> les cellules restent à une taille
// minimum lisible/cliquable, l'excédent se parcourt au scroll (pas de
// rétrécissement en dessous de minCellSize).
export function computeCellSize({ containerWidth, containerHeight, rows, cols, minCellSize }) {
  if (!rows || !cols || !containerWidth || !containerHeight) {
    return minCellSize
  }

  const fitCellSize = Math.min(containerWidth / cols, containerHeight / rows)
  return Math.max(minCellSize, Math.floor(fitCellSize) || minCellSize)
}
