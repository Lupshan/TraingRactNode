import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RulesPanel3D from '../../components/RulesPanel3D'

function renderRulesPanel3D(rules) {
  const onChange = vi.fn()
  const view = render(<RulesPanel3D rules={rules} onChange={onChange} />)
  return { onChange, ...view }
}

describe('RulesPanel3D', () => {
  it('prefills the fields with the active rules in range notation', () => {
    renderRulesPanel3D({ birth: new Set([6]), survive: new Set([5, 6, 7]) })

    expect(screen.getByLabelText(/naissance/i)).toHaveValue('6')
    expect(screen.getByLabelText(/survie/i)).toHaveValue('5-7')
  })

  it('parses the birth field as the user types and calls onChange live', async () => {
    const user = userEvent.setup()
    const { onChange } = renderRulesPanel3D({ birth: new Set(), survive: new Set() })

    const birthInput = screen.getByLabelText(/naissance/i)
    await user.clear(birthInput)
    await user.type(birthInput, '4')

    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.birth).toEqual(new Set([4]))
  })

  it('parses a full range-notation string for survive', async () => {
    const user = userEvent.setup()
    const { onChange } = renderRulesPanel3D({ birth: new Set(), survive: new Set() })

    const surviveInput = screen.getByLabelText(/survie/i)
    await user.clear(surviveInput)
    await user.type(surviveInput, '1,4,6-11,24')

    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.survive).toEqual(new Set([1, 4, 6, 7, 8, 9, 10, 11, 24]))
  })

  it('does not touch the other field when editing one of them', async () => {
    const user = userEvent.setup()
    const { onChange } = renderRulesPanel3D({ birth: new Set([6]), survive: new Set([5, 6, 7]) })

    await user.type(screen.getByLabelText(/naissance/i), '1')

    const lastCall = onChange.mock.calls.at(-1)[0]
    expect(lastCall.survive).toEqual(new Set([5, 6, 7]))
  })

  it('does not reformat the field mid-typing, even when the raw text is not canonical', async () => {
    const user = userEvent.setup()
    renderRulesPanel3D({ birth: new Set(), survive: new Set() })

    const birthInput = screen.getByLabelText(/naissance/i)
    // "1,2" (sans espace) : la forme canonique serait "1, 2" — le champ
    // ne doit pas se corriger tout seul pendant la frappe (cf. bug fixé :
    // onChange re-render le parent à chaque caractère, il ne faut pas que
    // ça écrase ce qu'on est en train de taper).
    await user.type(birthInput, '1,2')

    expect(birthInput).toHaveValue('1,2')
  })

  it('resyncs the fields when the rules change from outside (e.g. random generation)', () => {
    const { onChange, rerender } = renderRulesPanel3D({
      birth: new Set([6]),
      survive: new Set([5, 6, 7]),
    })

    const externalRules = { birth: new Set([2, 3]), survive: new Set([4]) }
    rerender(<RulesPanel3D rules={externalRules} onChange={onChange} />)

    expect(screen.getByLabelText(/naissance/i)).toHaveValue('2-3')
    expect(screen.getByLabelText(/survie/i)).toHaveValue('4')
    expect(screen.getByLabelText(/mort/i)).toHaveValue('0-3, 5-26')
  })

  it('does not clobber an in-progress edit when the parent merely echoes back the same rules object', () => {
    const rules = { birth: new Set([6]), survive: new Set([5, 6, 7]) }
    const { onChange, rerender } = renderRulesPanel3D(rules)

    // un re-render du parent sans changement de `rules` (même référence)
    // ne doit rien resynchroniser
    rerender(<RulesPanel3D rules={rules} onChange={onChange} />)

    expect(screen.getByLabelText(/naissance/i)).toHaveValue('6')
  })

  it('derives the death field from the complement of survive, over 0-26', () => {
    renderRulesPanel3D({ birth: new Set([6]), survive: new Set([5, 6, 7]) })

    const deadInput = screen.getByLabelText(/mort/i)
    expect(deadInput).toHaveValue('0-4, 8-26')
    expect(deadInput).toBeDisabled()
  })

  it('derives an empty death field when survive already covers 0-26', () => {
    const fullRange = new Set(Array.from({ length: 27 }, (_, i) => i))
    renderRulesPanel3D({ birth: new Set(), survive: fullRange })

    expect(screen.getByLabelText(/mort/i)).toHaveValue('')
  })
})
