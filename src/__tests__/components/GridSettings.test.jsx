import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GridSettings from '../../components/GridSettings'

function renderGridSettings(overrides = {}) {
  const props = {
    rows: 10,
    cols: 10,
    onResizeGrid: vi.fn(),
    onGenerateRandom: vi.fn(),
    ...overrides,
  }
  render(<GridSettings {...props} />)
  return props
}

describe('GridSettings', () => {
  it('calls onResizeGrid with the entered dimensions on submit', async () => {
    const user = userEvent.setup()
    const props = renderGridSettings()

    const rowsInput = screen.getByLabelText(/lignes/i)
    const colsInput = screen.getByLabelText(/colonnes/i)
    await user.clear(rowsInput)
    await user.type(rowsInput, '20')
    await user.clear(colsInput)
    await user.type(colsInput, '15')
    await user.click(screen.getByRole('button', { name: /redimensionner/i }))

    expect(props.onResizeGrid).toHaveBeenCalledWith(20, 15)
  })

  it('renders the random fill controls, wired to onGenerateRandom', async () => {
    const user = userEvent.setup()
    const props = renderGridSettings()

    await user.type(screen.getByLabelText('Seed'), 'abc')
    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))

    expect(props.onGenerateRandom).toHaveBeenCalledWith('abc', 0.5)
  })
})
