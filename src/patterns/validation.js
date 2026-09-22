export const MAX_PATTERN_DIMENSION = 64
export const MAX_NAME_LENGTH = 60

// Règles de validation d'une soumission de motif communautaire, partagées
// entre le formulaire (retour immédiat) et le Worker (source de vérité).
export function validatePatternSubmission({ name, cells }) {
  const trimmedName = (name ?? '').trim()
  if (!trimmedName) return 'Le motif a besoin d’un nom.'
  if (trimmedName.length > MAX_NAME_LENGTH) {
    return `Le nom est limité à ${MAX_NAME_LENGTH} caractères.`
  }

  const liveCells = cells.flat().filter(Boolean).length
  if (liveCells === 0) {
    return 'Le motif est vide — dessine au moins une cellule vivante avant de le partager.'
  }

  const height = cells.length
  const width = cells[0]?.length ?? 0
  if (height > MAX_PATTERN_DIMENSION || width > MAX_PATTERN_DIMENSION) {
    return `Le motif est limité à ${MAX_PATTERN_DIMENSION}×${MAX_PATTERN_DIMENSION} cellules (celui-ci fait ${height}×${width}).`
  }

  return null
}
