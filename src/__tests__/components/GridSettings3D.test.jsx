import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import GridSettings3D from '../../components/GridSettings3D'

function renderGridSettings3D(overrides = {}) {
  const props = {
    sizeX: 10,
    sizeY: 10,
    sizeZ: 10,
    onResizeGrid: vi.fn(),
    onGenerateRandom: vi.fn(),
    ...overrides,
  }
  const view = render(<GridSettings3D {...props} />)
  return { props, ...view }
}

describe('GridSettings3D', () => {
  it('calls onResizeGrid with the entered X/Y/Z dimensions on submit', async () => {
    const user = userEvent.setup()
    const { props } = renderGridSettings3D()

    const xInput = screen.getByLabelText('X')
    const yInput = screen.getByLabelText('Y')
    const zInput = screen.getByLabelText('Z')
    await user.clear(xInput)
    await user.type(xInput, '5')
    await user.clear(yInput)
    await user.type(yInput, '8')
    await user.clear(zInput)
    await user.type(zInput, '12')
    await user.click(screen.getByRole('button', { name: /redimensionner/i }))

    expect(props.onResizeGrid).toHaveBeenCalledWith(5, 8, 12)
  })

  it('renders the random fill controls, wired to onGenerateRandom', async () => {
    const user = userEvent.setup()
    const { props } = renderGridSettings3D()

    await user.type(screen.getByLabelText('Seed'), 'abc')
    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))

    expect(props.onGenerateRandom).toHaveBeenCalledWith('abc', 0.5, true)
  })

  it('updates the X/Y/Z fields when the grid changes from elsewhere (e.g. random generation)', () => {
    const { props, rerender } = renderGridSettings3D({ sizeX: 10, sizeY: 10, sizeZ: 10 })

    // simule le parent qui reçoit une nouvelle grille (générée
    // aléatoirement) et repasse de nouvelles dimensions en props
    rerender(<GridSettings3D {...props} sizeX={19} sizeY={17} sizeZ={12} />)

    expect(screen.getByLabelText('X')).toHaveValue(19)
    expect(screen.getByLabelText('Y')).toHaveValue(17)
    expect(screen.getByLabelText('Z')).toHaveValue(12)
  })

  it('keeps an in-progress edit when the props have not changed', async () => {
    const user = userEvent.setup()
    const { rerender, props } = renderGridSettings3D({ sizeX: 10, sizeY: 10, sizeZ: 10 })

    const xInput = screen.getByLabelText('X')
    await user.clear(xInput)
    await user.type(xInput, '15')

    // un re-render du parent sans changement des props ne doit pas
    // écraser la saisie en cours
    rerender(<GridSettings3D {...props} sizeX={10} sizeY={10} sizeZ={10} />)

    expect(screen.getByLabelText('X')).toHaveValue(15)
  })
})
