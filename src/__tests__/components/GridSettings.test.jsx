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
  const view = render(<GridSettings {...props} />)
  return { props, ...view }
}

describe('GridSettings', () => {
  it('calls onResizeGrid with the entered dimensions on submit', async () => {
    const user = userEvent.setup()
    const { props } = renderGridSettings()

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
    const { props } = renderGridSettings()

    await user.type(screen.getByLabelText('Seed'), 'abc')
    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))

    expect(props.onGenerateRandom).toHaveBeenCalledWith('abc', 0.5, true)
  })

  it('updates the Lignes/Colonnes fields when the grid changes from elsewhere (e.g. random generation)', () => {
    const { props, rerender } = renderGridSettings({ rows: 10, cols: 10 })

    // simule le parent qui reçoit une nouvelle grille (générée
    // aléatoirement) et repasse de nouvelles dimensions en props
    rerender(<GridSettings {...props} rows={19} cols={17} />)

    expect(screen.getByLabelText(/lignes/i)).toHaveValue(19)
    expect(screen.getByLabelText(/colonnes/i)).toHaveValue(17)
  })

  it('keeps an in-progress edit when the props have not changed', async () => {
    const user = userEvent.setup()
    const { rerender, props } = renderGridSettings({ rows: 10, cols: 10 })

    const rowsInput = screen.getByLabelText(/lignes/i)
    await user.clear(rowsInput)
    await user.type(rowsInput, '25')

    // un re-render du parent sans changement des props ne doit pas
    // écraser la saisie en cours
    rerender(<GridSettings {...props} rows={10} cols={10} />)

    expect(screen.getByLabelText(/lignes/i)).toHaveValue(25)
  })
})
