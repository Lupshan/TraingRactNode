import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCommunityPatterns, submitCommunityPattern } from '../../api/patterns'

function jsonResponse(data, init = {}) {
  return {
    ok: init.status ? init.status >= 200 && init.status < 300 : true,
    status: init.status ?? 200,
    json: async () => data,
  }
}

describe('patterns API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetchCommunityPatterns returns the patterns array on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ patterns: [{ id: '1', name: 'x', rle: 'x=1,y=1\no!' }] })),
    )

    const patterns = await fetchCommunityPatterns()

    expect(patterns).toEqual([{ id: '1', name: 'x', rle: 'x=1,y=1\no!' }])
    expect(fetch).toHaveBeenCalledWith('/api/patterns')
  })

  it('fetchCommunityPatterns throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { status: 500 })))

    await expect(fetchCommunityPatterns()).rejects.toThrow(/500/)
  })

  it('submitCommunityPattern posts the name and rle and returns the created pattern', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ pattern: { id: '1', name: 'Mon motif' } }, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const pattern = await submitCommunityPattern('Mon motif', 'x=1,y=1\no!')

    expect(pattern).toEqual({ id: '1', name: 'Mon motif' })
    expect(fetchMock).toHaveBeenCalledWith('/api/patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mon motif', rle: 'x=1,y=1\no!' }),
    })
  })

  it('submitCommunityPattern throws with the server error message on conflict', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: 'Ce motif existe déjà.', existing: { id: '1' } }, { status: 409 }),
      ),
    )

    const error = await submitCommunityPattern('Doublon', 'x=1,y=1\no!').catch((e) => e)

    expect(error.message).toBe('Ce motif existe déjà.')
    expect(error.status).toBe(409)
    expect(error.existing).toEqual({ id: '1' })
  })

  it('submitCommunityPattern falls back to a generic message when the body has no error field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { status: 400 })))

    await expect(submitCommunityPattern('x', 'x=1,y=1\no!')).rejects.toThrow(/400/)
  })
})
