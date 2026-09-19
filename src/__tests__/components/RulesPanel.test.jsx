import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RulesPanel from '../../components/RulesPanel'

function renderRulesPanel(rules) {
  const onChange = vi.fn()
  render(<RulesPanel rules={rules} onChange={onChange} />)
  return onChange
}

describe('RulesPanel', () => {
  it('reflects the active rules as checked boxes', () => {
    renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    expect(screen.getByLabelText('Naissance à 3 voisins')).toBeChecked()
    expect(screen.getByLabelText('Naissance à 2 voisins')).not.toBeChecked()
    expect(screen.getByLabelText('Survie à 2 voisins')).toBeChecked()
    expect(screen.getByLabelText('Survie à 3 voisins')).toBeChecked()
    expect(screen.getByLabelText('Survie à 4 voisins')).not.toBeChecked()
  })

  it('adds a birth count when checking an unchecked box', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    await user.click(screen.getByLabelText('Naissance à 2 voisins'))

    expect(onChange).toHaveBeenCalledWith({
      birth: new Set([3, 2]),
      survive: new Set([2, 3]),
    })
  })

  it('removes a survive count when unchecking a checked box', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    await user.click(screen.getByLabelText('Survie à 3 voisins'))

    expect(onChange).toHaveBeenCalledWith({
      birth: new Set([3]),
      survive: new Set([2]),
    })
  })
})
