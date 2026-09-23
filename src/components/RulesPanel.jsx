import { complementRange } from '../engine/neighborRanges'

const NEIGHBOR_COUNTS = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const MAX_NEIGHBORS = 8

function RulesPanel({ rules, onChange }) {
  function toggleInSet(set, count) {
    const next = new Set(set)
    if (next.has(count)) {
      next.delete(count)
    } else {
      next.add(count)
    }
    return next
  }

  const dead = complementRange(rules.survive, MAX_NEIGHBORS)

  return (
    <fieldset className="rules-panel">
      <legend>Règles (B/S)</legend>

      <div>
        <span>Naissance (B)</span>
        <div className="chip-group">
          {NEIGHBOR_COUNTS.map((count) => (
            <button
              key={`birth-${count}`}
              type="button"
              className="chip"
              aria-pressed={rules.birth.has(count)}
              aria-label={`Naissance à ${count} voisins`}
              onClick={() => onChange({ ...rules, birth: toggleInSet(rules.birth, count) })}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span>Survie (S)</span>
        <div className="chip-group">
          {NEIGHBOR_COUNTS.map((count) => (
            <button
              key={`survive-${count}`}
              type="button"
              className="chip"
              aria-pressed={rules.survive.has(count)}
              aria-label={`Survie à ${count} voisins`}
              onClick={() =>
                onChange({ ...rules, survive: toggleInSet(rules.survive, count) })
              }
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span>Mort (M)</span>
        <div className="chip-group">
          {NEIGHBOR_COUNTS.map((count) => (
            <span
              key={`dead-${count}`}
              className="chip chip-readonly"
              data-active={dead.has(count)}
              aria-label={`Mort à ${count} voisins : ${dead.has(count) ? 'oui' : 'non'}`}
            >
              {count}
            </span>
          ))}
        </div>
        <p className="rules-derived-hint">
          Déduit de « Survie » : une cellule vivante meurt à tous les voisinages où elle ne
          survit pas.
        </p>
      </div>
    </fieldset>
  )
}

export default RulesPanel
