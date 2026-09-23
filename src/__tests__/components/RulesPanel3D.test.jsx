import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RulesPanel3D from '../../components/RulesPanel3D'

function renderRulesPanel3D(rules) {
  const onChange = vi.fn()
  render(<RulesPanel3D rules={rules} onChange={onChange} />)
  return onChange
}

describe('RulesPanel3D', () => {
  it('prefills the fields with the active rules in range notation', () => {
    renderRulesPanel3D({ birth: new Set([6]), survive: new Set([5, 6, 7]) })

    expect(screen.getByLabelText(/naissance/i)).toHaveValue('6')
    expect(screen.getByLabelText(/survie/i)).toHaveValue('5-7')
  })

  it('parses the birth field as the user types and calls onChange live', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel3D({ birth: new Set(), survive: new Set() })

    const birthInput = screen.getByLabelText(/naissance/i)
    await user.clear(birthInput)
    await user.type(birthInput, '4')

    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.birth).toEqual(new Set([4]))
  })

  it('parses a full range-notation string for survive', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel3D({ birth: new Set(), survive: new Set() })

    const surviveInput = screen.getByLabelText(/survie/i)
    await user.clear(surviveInput)
    await user.type(surviveInput, '1,4,6-11,24')

    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.survive).toEqual(new Set([1, 4, 6, 7, 8, 9, 10, 11, 24]))
  })

  it('does not touch the other field when editing one of them', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel3D({ birth: new Set([6]), survive: new Set([5, 6, 7]) })

    await user.type(screen.getByLabelText(/naissance/i), '1')

    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.survive).toEqual(new Set([5, 6, 7]))
  })
})
