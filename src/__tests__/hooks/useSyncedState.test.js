import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSyncedState } from '../../hooks/useSyncedState'

describe('useSyncedState', () => {
  it('starts with the given prop value', () => {
    const { result } = renderHook(() => useSyncedState(5))

    expect(result.current[0]).toBe(5)
  })

  it('lets the local value be edited independently of the prop', () => {
    const { result } = renderHook(() => useSyncedState(5))

    act(() => result.current[1](42))

    expect(result.current[0]).toBe(42)
  })

  it('keeps the edited value across re-renders while the prop stays the same', () => {
    const { result, rerender } = renderHook(({ propValue }) => useSyncedState(propValue), {
      initialProps: { propValue: 5 },
    })

    act(() => result.current[1](42))
    rerender({ propValue: 5 })

    expect(result.current[0]).toBe(42)
  })

  it('resyncs to the new prop value when the prop changes from the outside', () => {
    const { result, rerender } = renderHook(({ propValue }) => useSyncedState(propValue), {
      initialProps: { propValue: 5 },
    })

    act(() => result.current[1](42))
    rerender({ propValue: 19 })

    expect(result.current[0]).toBe(19)
  })

  it('still allows editing again after a resync', () => {
    const { result, rerender } = renderHook(({ propValue }) => useSyncedState(propValue), {
      initialProps: { propValue: 5 },
    })

    rerender({ propValue: 19 })
    act(() => result.current[1](7))

    expect(result.current[0]).toBe(7)
  })
})
