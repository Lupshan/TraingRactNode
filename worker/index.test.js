import { describe, expect, it } from 'vitest'
import worker from './index.js'

class FakeKV {
  constructor() {
    this.store = new Map()
  }

  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null
  }

  async put(key, value) {
    this.store.set(key, value)
  }

  async list({ prefix = '' } = {}) {
    const keys = [...this.store.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name }))
    return { keys }
  }
}

function makeEnv() {
  return {
    PATTERNS: new FakeKV(),
    ASSETS: {
      fetch: async () => new Response('static asset', { status: 200 }),
    },
  }
}

function postPatterns(env, body) {
  return worker.fetch(
    new Request('http://localhost/api/patterns', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    env,
  )
}

function getPatterns(env) {
  return worker.fetch(new Request('http://localhost/api/patterns'), env)
}

describe('worker /api/patterns', () => {
  it('lists no patterns when the store is empty', async () => {
    const response = await getPatterns(makeEnv())
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.patterns).toEqual([])
  })

  it('creates a genuinely new pattern and lists it back', async () => {
    const env = makeEnv()
    const createResponse = await postPatterns(env, { name: 'Mon motif', rle: 'x = 3, y = 1\nooo!' })

    // "ooo!" collides with the built-in blinker, so use a shape with no
    // built-in match for the "creates" case (an asymmetric 3x2 shape).
    const uniqueResponse = await postPatterns(env, { name: 'Motif original', rle: 'x = 3, y = 2\n2bo$3o!' })
    const created = await uniqueResponse.json()

    expect(createResponse.status).toBe(409) // sanity check on the collision above
    expect(uniqueResponse.status).toBe(201)
    expect(created.pattern.name).toBe('Motif original')
    expect(created.pattern.id).toBeTruthy()

    const listResponse = await getPatterns(env)
    const listed = await listResponse.json()
    expect(listed.patterns).toHaveLength(1)
    expect(listed.patterns[0].id).toBe(created.pattern.id)
  })

  it('rejects a submission matching a built-in pattern, even rotated', async () => {
    const env = makeEnv()
    // vertical blinker: same shape as the built-in horizontal blinker, rotated 90°
    const response = await postPatterns(env, { name: 'Barre verticale', rle: 'x = 1, y = 3\no$o$o!' })
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toMatch(/bibliothèque de base/)

    const listResponse = await getPatterns(env)
    expect((await listResponse.json()).patterns).toEqual([])
  })

  it('rejects a submission matching an already-shared community pattern, even rotated', async () => {
    const env = makeEnv()
    await postPatterns(env, { name: 'Motif original', rle: 'x = 3, y = 2\n2bo$3o!' })

    // same shape rotated 90°
    const response = await postPatterns(env, { name: 'Meme motif tourné', rle: 'x = 2, y = 3\n2o$bo$bo!' })
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toMatch(/existe déjà/)
    expect(data.existing.name).toBe('Motif original')
  })

  it('rejects a submission with no name', async () => {
    const env = makeEnv()
    const response = await postPatterns(env, { name: '  ', rle: 'x = 3, y = 2\n2bo$3o!' })

    expect(response.status).toBe(400)
  })

  it('rejects an empty pattern', async () => {
    const env = makeEnv()
    const response = await postPatterns(env, { name: 'Rien', rle: 'x = 1, y = 1\nb!' })

    expect(response.status).toBe(400)
  })

  it('rejects unsupported methods on /api/patterns', async () => {
    const env = makeEnv()
    const response = await worker.fetch(
      new Request('http://localhost/api/patterns', { method: 'DELETE' }),
      env,
    )

    expect(response.status).toBe(405)
  })

  it('delegates any other route to the static assets binding', async () => {
    const env = makeEnv()
    const response = await worker.fetch(new Request('http://localhost/index.html'), env)

    expect(await response.text()).toBe('static asset')
  })
})
