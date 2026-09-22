const API_BASE = '/api/patterns'

export async function fetchCommunityPatterns() {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error(`Échec du chargement des motifs communautaires (${response.status})`)
  }
  const data = await response.json()
  return data.patterns
}

export async function submitCommunityPattern(name, rle) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, rle }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.error ?? `Échec de l'envoi du motif (${response.status})`)
    error.status = response.status
    error.existing = data.existing ?? null
    throw error
  }

  return data.pattern
}
