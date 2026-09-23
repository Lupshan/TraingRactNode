import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RandomFillControls from '../../components/RandomFillControls'

describe('RandomFillControls', () => {
  it('calls onGenerate with the entered seed, the density as a 0-1 fraction, and randomizeRules', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<RandomFillControls onGenerate={onGenerate} />)

    await user.type(screen.getByLabelText('Seed'), 'ma-seed')
    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))

    expect(onGenerate).toHaveBeenCalledWith('ma-seed', 0.5, true)
  })

  it('defaults the density to 50% and reflects slider changes in the label', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<RandomFillControls onGenerate={onGenerate} />)

    expect(screen.getByText('Densité (50 %)')).toBeInTheDocument()

    const slider = screen.getByLabelText(/densité de remplissage/i)
    fireEventChange(slider, '80')

    expect(screen.getByText('Densité (80 %)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))
    expect(onGenerate).toHaveBeenCalledWith(expect.anything(), 0.8, true)
  })

  it('defaults the "also generate rules" checkbox to checked, and unchecking it is passed through', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<RandomFillControls onGenerate={onGenerate} />)

    const checkbox = screen.getByRole('checkbox', { name: /tirer aussi une règle aléatoire/i })
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))

    expect(onGenerate).toHaveBeenCalledWith(expect.anything(), expect.anything(), false)
  })

  it('resolves and displays a random seed when the field is left empty', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    render(<RandomFillControls onGenerate={onGenerate} />)

    await user.click(screen.getByRole('button', { name: /générer aléatoirement/i }))

    const [seedUsed] = onGenerate.mock.calls.at(-1)
    expect(seedUsed).toBeTypeOf('number')
    expect(screen.getByLabelText('Seed')).toHaveValue(String(seedUsed))
  })
})

// input[type=range] n'est pas bien géré par userEvent.type/clear ; on
// simule directement l'évènement change comme le ferait un navigateur.
function fireEventChange(element, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}
