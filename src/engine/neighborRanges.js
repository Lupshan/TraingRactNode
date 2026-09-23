// Notation compacte pour un ensemble de nombres de voisins, ex. utile en
// 3D où l'intervalle va de 0 à 26 et où des chips un par un ne tiennent
// plus à l'écran : "1, 4, 6-11, 24" -> {1, 4, 6, 7, 8, 9, 10, 11, 24}.
export function parseNeighborRanges(input) {
  const result = new Set()

  input
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
      if (rangeMatch) {
        const a = Number(rangeMatch[1])
        const b = Number(rangeMatch[2])
        const [start, end] = a <= b ? [a, b] : [b, a]
        for (let n = start; n <= end; n++) result.add(n)
        return
      }

      if (/^\d+$/.test(part)) {
        result.add(Number(part))
      }
    })

  return result
}

// Sens inverse : un ensemble de nombres -> la notation compacte, en
// regroupant les suites consécutives ({1,4,6,7,8,9,10,11,24} -> "1, 4,
// 6-11, 24"). Sert à réafficher une règle dans le champ de saisie.
export function serializeNeighborRanges(set) {
  const sorted = [...set].sort((a, b) => a - b)
  const parts = []
  let i = 0

  while (i < sorted.length) {
    const start = sorted[i]
    let end = start
    while (i + 1 < sorted.length && sorted[i + 1] === end + 1) {
      end = sorted[++i]
    }
    parts.push(start === end ? `${start}` : `${start}-${end}`)
    i++
  }

  return parts.join(', ')
}

// Complémentaire d'un ensemble de voisins sur [0, max] : sert à afficher
// une ligne "Mort" dérivée de "Survie" (les voisinages qui ne font pas
// survivre une cellule vivante la font mourir, par définition — pas
// besoin de la saisir séparément, juste de la rendre visible).
export function complementRange(set, max) {
  const complement = new Set()
  for (let n = 0; n <= max; n++) {
    if (!set.has(n)) complement.add(n)
  }
  return complement
}
