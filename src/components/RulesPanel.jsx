const NEIGHBOR_COUNTS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

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

  return (
    <fieldset className="rules-panel">
      <legend>Règles (B/S)</legend>

      <div>
        <span>Naissance (B)</span>
        {NEIGHBOR_COUNTS.map((count) => (
          <label key={`birth-${count}`}>
            <input
              type="checkbox"
              checked={rules.birth.has(count)}
              onChange={() => onChange({ ...rules, birth: toggleInSet(rules.birth, count) })}
              aria-label={`Naissance à ${count} voisins`}
            />
            {count}
          </label>
        ))}
      </div>

      <div>
        <span>Survie (S)</span>
        {NEIGHBOR_COUNTS.map((count) => (
          <label key={`survive-${count}`}>
            <input
              type="checkbox"
              checked={rules.survive.has(count)}
              onChange={() =>
                onChange({ ...rules, survive: toggleInSet(rules.survive, count) })
              }
              aria-label={`Survie à ${count} voisins`}
            />
            {count}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default RulesPanel
