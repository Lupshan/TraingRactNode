import { useState } from 'react'

// State local dérivé d'une prop, mais toujours modifiable (contrairement
// à contrôler directement la prop) : `useState(propValue)` seul ne
// capture cette valeur qu'au tout premier rendu, donc un champ qui s'en
// sert (ex. les inputs de redimensionnement) se désynchronise dès que la
// grille change par un autre chemin (génération aléatoire, etc.) — le
// champ affiche alors une valeur qui n'a plus rien à voir avec ce qui
// tourne réellement.
//
// Ce hook se resynchronise automatiquement quand `propValue` change
// depuis l'extérieur, sans écraser une saisie en cours d'édition tant
// que la prop ne bouge pas elle-même. Pattern recommandé par React pour
// ajuster un state dérivé d'une prop sans passer par un effect (qui
// re-render une fois de trop après le commit) :
// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
export function useSyncedState(propValue) {
  const [value, setValue] = useState(propValue)
  const [prevPropValue, setPrevPropValue] = useState(propValue)

  if (propValue !== prevPropValue) {
    setPrevPropValue(propValue)
    setValue(propValue)
  }

  return [value, setValue]
}
