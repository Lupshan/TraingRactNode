import { useState } from 'react'

// Génère une seed « lisible » quand le champ est laissé vide, plutôt que
// d'exiger que l'utilisateur en saisisse une à chaque fois. Math.random()
// est utilisé ici uniquement pour PROPOSER cette valeur affichée — la
// génération de la grille elle-même reste entièrement déterministe à
// partir de la seed résolue (cf. randomGrid.js).
function randomSeedValue() {
  return Math.floor(Math.random() * 1_000_000_000)
}

// Panneau partagé 2D/3D : saisie de seed + densité (+ règles en option),
// un bouton pour générer. Ne connaît rien aux dimensions ni au moteur de
// simulation — c'est `onGenerate(seed, density, randomizeRules)` qui s'en
// charge côté appelant.
function RandomFillControls({ onGenerate }) {
  const [seedText, setSeedText] = useState('')
  const [density, setDensity] = useState(50)
  const [randomizeRules, setRandomizeRules] = useState(true)

  function handleSubmit(event) {
    event.preventDefault()
    const seed = seedText.trim() === '' ? randomSeedValue() : seedText
    setSeedText(String(seed))
    onGenerate(seed, density / 100, randomizeRules)
  }

  return (
    <form className="random-fill" onSubmit={handleSubmit}>
      <label>
        Seed
        <input
          type="text"
          value={seedText}
          onChange={(event) => setSeedText(event.target.value)}
          placeholder="ex. 42, ou un mot — vide = seed aléatoire"
        />
      </label>
      <label>
        Densité ({density} %)
        <input
          type="range"
          min="1"
          max="99"
          value={density}
          onChange={(event) => setDensity(Number(event.target.value))}
          aria-label={`Densité de remplissage : ${density}%`}
        />
      </label>
      <label className="random-fill-checkbox">
        <input
          type="checkbox"
          checked={randomizeRules}
          onChange={(event) => setRandomizeRules(event.target.checked)}
        />
        Tirer aussi une règle aléatoire
      </label>
      <button type="submit">Générer aléatoirement</button>
      <p className="random-fill-hint">
        Même seed + même densité (+ mêmes règles si coché) = exactement la
        même grille, à chaque fois.
      </p>
    </form>
  )
}

export default RandomFillControls
