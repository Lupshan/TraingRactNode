import { useState } from 'react'
import { complementRange, parseNeighborRanges, serializeNeighborRanges } from '../engine/neighborRanges'

const MAX_NEIGHBORS_3D = 26

// En 3D le voisinage va de 0 à 26 : des chips individuelles (comme en 2D,
// qui n'en a que 9) ne tiendraient pas à l'écran. On saisit à la place une
// liste de nombres et d'intervalles ("1, 4, 6-11, 24"), appliquée en
// temps réel comme le panneau 2D.
function RulesPanel3D({ rules, onChange }) {
  const [birthText, setBirthText] = useState(() => serializeNeighborRanges(rules.birth))
  const [surviveText, setSurviveText] = useState(() => serializeNeighborRanges(rules.survive))

  function handleBirthChange(event) {
    const text = event.target.value
    setBirthText(text)
    onChange({ ...rules, birth: parseNeighborRanges(text) })
  }

  function handleSurviveChange(event) {
    const text = event.target.value
    setSurviveText(text)
    onChange({ ...rules, survive: parseNeighborRanges(text) })
  }

  const deadText = serializeNeighborRanges(complementRange(rules.survive, MAX_NEIGHBORS_3D))

  return (
    <fieldset className="rules-panel rules-panel-3d">
      <legend>Règles (B/S) — 0 à 26 voisins</legend>

      <label>
        Naissance (B)
        <input
          type="text"
          value={birthText}
          onChange={handleBirthChange}
          placeholder="ex. 1, 4, 6-11, 24"
          aria-label="Naissance : nombres de voisins et intervalles"
        />
      </label>

      <label>
        Survie (S)
        <input
          type="text"
          value={surviveText}
          onChange={handleSurviveChange}
          placeholder="ex. 5-7"
          aria-label="Survie : nombres de voisins et intervalles"
        />
      </label>

      <label>
        Mort (M)
        <input
          type="text"
          value={deadText}
          disabled
          readOnly
          aria-label="Mort : nombres de voisins et intervalles, déduits automatiquement"
        />
      </label>
      <p className="rules-derived-hint">
        Déduit de « Survie » : une cellule vivante meurt à tous les voisinages où elle ne
        survit pas.
      </p>
    </fieldset>
  )
}

export default RulesPanel3D
