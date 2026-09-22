function PatternThumbnail({ cells }) {
  const rows = cells.length
  const cols = cells[0]?.length ?? 0

  return (
    <div
      className="pattern-thumb"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      aria-hidden="true"
    >
      {cells.map((row, r) =>
        row.map((alive, c) => (
          <div
            key={`${r}-${c}`}
            className={alive ? 'pattern-thumb-cell pattern-thumb-cell-alive' : 'pattern-thumb-cell'}
          />
        )),
      )}
    </div>
  )
}

export default PatternThumbnail
