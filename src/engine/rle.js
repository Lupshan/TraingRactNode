export function trimToBoundingBox(cells) {
  let minRow = Infinity
  let maxRow = -Infinity
  let minCol = Infinity
  let maxCol = -Infinity

  cells.forEach((row, r) => {
    row.forEach((alive, c) => {
      if (!alive) return
      if (r < minRow) minRow = r
      if (r > maxRow) maxRow = r
      if (c < minCol) minCol = c
      if (c > maxCol) maxCol = c
    })
  })

  if (minRow === Infinity) return []

  const trimmed = []
  for (let r = minRow; r <= maxRow; r++) {
    trimmed.push(cells[r].slice(minCol, maxCol + 1))
  }
  return trimmed
}

function rotate90(cells) {
  const rows = cells.length
  const cols = cells[0]?.length ?? 0
  const rotated = Array.from({ length: cols }, () => new Array(rows).fill(false))

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = cells[r][c]
    }
  }
  return rotated
}

function mirrorHorizontal(cells) {
  return cells.map((row) => [...row].reverse())
}

function shapeKey(cells) {
  return cells.map((row) => row.map((alive) => (alive ? '#' : '.')).join('')).join('/')
}

// Signature de forme invariante par translation, rotation (90°) et
// réflexion : sert à détecter les doublons soumis avec une orientation
// différente. Les 8 variantes du groupe diédral D4 sont réduites à leur
// boîte englobante puis comparées ; la plus petite lexicographiquement
// est retenue comme représentant canonique.
export function canonicalSignature(cells) {
  const variants = []
  let current = trimToBoundingBox(cells)

  for (let i = 0; i < 4; i++) {
    variants.push(shapeKey(current))
    variants.push(shapeKey(mirrorHorizontal(current)))
    current = rotate90(current)
  }

  variants.sort()
  return variants[0]
}

function serializeRow(row) {
  const segments = []
  let i = 0
  while (i < row.length) {
    const alive = row[i]
    let run = 0
    while (i < row.length && row[i] === alive) {
      run++
      i++
    }
    segments.push({ alive, run })
  }

  if (segments.length && !segments[segments.length - 1].alive) {
    segments.pop()
  }

  return segments.map(({ alive, run }) => (run > 1 ? run : '') + (alive ? 'o' : 'b')).join('')
}

export function serializeRLE(cells) {
  const trimmed = trimToBoundingBox(cells)
  const height = trimmed.length
  const width = trimmed[0]?.length ?? 0
  const body = trimmed.map(serializeRow).join('$') + '!'

  return `x = ${width}, y = ${height}\n${body}`
}

export function parseRLE(rle) {
  const body = rle
    .split('\n')
    .filter((line) => {
      const trimmedLine = line.trim()
      return trimmedLine !== '' && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('x')
    })
    .join('')

  const rows = []
  let row = []
  let countStr = ''

  for (const char of body) {
    if (char >= '0' && char <= '9') {
      countStr += char
      continue
    }

    const count = countStr === '' ? 1 : Number.parseInt(countStr, 10)
    countStr = ''

    if (char === 'b') {
      row.push(...new Array(count).fill(false))
    } else if (char === 'o') {
      row.push(...new Array(count).fill(true))
    } else if (char === '$') {
      for (let i = 0; i < count; i++) {
        rows.push(row)
        row = []
      }
    } else if (char === '!') {
      break
    }
  }
  rows.push(row)

  const width = rows.reduce((max, r) => Math.max(max, r.length), 0)
  return rows.map((r) => {
    const padded = [...r]
    while (padded.length < width) padded.push(false)
    return padded
  })
}
