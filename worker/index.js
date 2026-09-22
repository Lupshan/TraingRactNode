import { canonicalSignature, parseRLE, serializeRLE, trimToBoundingBox } from '../src/engine/rle.js'
import { BUILTIN_PATTERNS } from '../src/patterns/builtin.js'
import { validatePatternSubmission } from '../src/patterns/validation.js'

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...JSON_HEADERS, ...(init.headers ?? {}) },
  })
}

// Motifs de la bibliothèque de base : jamais acceptés comme "nouvelle"
// soumission communautaire, même à une rotation/réflexion près.
const BUILTIN_SIGNATURES = new Set(
  BUILTIN_PATTERNS.map((pattern) => canonicalSignature(parseRLE(pattern.rle))),
)

async function listPatterns(env) {
  const list = await env.PATTERNS.list({ prefix: 'pattern:' })
  const patterns = await Promise.all(
    list.keys.map(async (key) => {
      const raw = await env.PATTERNS.get(key.name)
      return raw ? JSON.parse(raw) : null
    }),
  )
  return patterns.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt)
}

async function createPattern(request, env) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Corps de requête JSON invalide.' }, { status: 400 })
  }

  const { name, rle } = body ?? {}
  if (typeof rle !== 'string' || rle.trim() === '') {
    return json({ error: 'Le motif (rle) est requis.' }, { status: 400 })
  }

  let cells
  try {
    cells = trimToBoundingBox(parseRLE(rle))
  } catch {
    return json({ error: 'Motif RLE illisible.' }, { status: 400 })
  }

  const validationError = validatePatternSubmission({ name, cells })
  if (validationError) {
    return json({ error: validationError }, { status: 400 })
  }

  const signature = canonicalSignature(cells)

  if (BUILTIN_SIGNATURES.has(signature)) {
    return json(
      { error: 'Ce motif fait déjà partie de la bibliothèque de base (à une rotation/réflexion près).' },
      { status: 409 },
    )
  }

  const signatureKey = `sig:${signature}`
  const existingId = await env.PATTERNS.get(signatureKey)
  if (existingId) {
    const existingRaw = await env.PATTERNS.get(`pattern:${existingId}`)
    return json(
      {
        error: 'Ce motif existe déjà dans la bibliothèque communautaire (à une rotation/réflexion près).',
        existing: existingRaw ? JSON.parse(existingRaw) : null,
      },
      { status: 409 },
    )
  }

  const pattern = {
    id: crypto.randomUUID(),
    name: name.trim(),
    rle: serializeRLE(cells),
    createdAt: Date.now(),
  }

  await env.PATTERNS.put(signatureKey, pattern.id)
  await env.PATTERNS.put(`pattern:${pattern.id}`, JSON.stringify(pattern))

  return json({ pattern }, { status: 201 })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/patterns') {
      if (request.method === 'GET') {
        return json({ patterns: await listPatterns(env) })
      }
      if (request.method === 'POST') {
        return createPattern(request, env)
      }
      return json({ error: 'Méthode non supportée.' }, { status: 405 })
    }

    return env.ASSETS.fetch(request)
  },
}
