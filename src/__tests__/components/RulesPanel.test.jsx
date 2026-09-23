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
  it('reflects the active rules as pressed toggle buttons', () => {
    renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    expect(screen.getByRole('button', { name: 'Naissance à 3 voisins' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Naissance à 2 voisins' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Survie à 2 voisins' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Survie à 3 voisins' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Survie à 4 voisins' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('adds a birth count when activating an inactive toggle', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    await user.click(screen.getByRole('button', { name: 'Naissance à 2 voisins' }))

    expect(onChange).toHaveBeenCalledWith({
      birth: new Set([3, 2]),
      survive: new Set([2, 3]),
    })
  })

  it('removes a survive count when deactivating an active toggle', async () => {
    const user = userEvent.setup()
    const onChange = renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    await user.click(screen.getByRole('button', { name: 'Survie à 3 voisins' }))

    expect(onChange).toHaveBeenCalledWith({
      birth: new Set([3]),
      survive: new Set([2]),
    })
  })

  it('derives the death row from the complement of survive', () => {
    renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    expect(screen.getByLabelText('Mort à 2 voisins : non')).toBeInTheDocument()
    expect(screen.getByLabelText('Mort à 3 voisins : non')).toBeInTheDocument()
    expect(screen.getByLabelText('Mort à 0 voisins : oui')).toBeInTheDocument()
    expect(screen.getByLabelText('Mort à 8 voisins : oui')).toBeInTheDocument()
  })

  it('does not render the death row as clickable buttons', () => {
    renderRulesPanel({ birth: new Set([3]), survive: new Set([2, 3]) })

    expect(screen.queryByRole('button', { name: /^Mort à/ })).not.toBeInTheDocument()
  })
})
