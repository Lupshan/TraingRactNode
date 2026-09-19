import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Controls from './Controls'

function renderControls(overrides = {}) {
  const props = {
    running: false,
    generation: 0,
    speed: 200,
    onStart: vi.fn(),
    onPause: vi.fn(),
    onStep: vi.fn(),
    onReset: vi.fn(),
    onSpeedChange: vi.fn(),
    ...overrides,
  }
  render(<Controls {...props} />)
  return props
}

describe('Controls', () => {
  it('calls onStart when clicking Start', async () => {
    const user = userEvent.setup()
    const props = renderControls()

    await user.click(screen.getByRole('button', { name: /start/i }))

    expect(props.onStart).toHaveBeenCalledTimes(1)
  })

  it('calls onPause when clicking Pause', async () => {
    const user = userEvent.setup()
    const props = renderControls({ running: true })

    await user.click(screen.getByRole('button', { name: /pause/i }))

    expect(props.onPause).toHaveBeenCalledTimes(1)
  })

  it('calls onStep when clicking Step', async () => {
    const user = userEvent.setup()
    const props = renderControls()

    await user.click(screen.getByRole('button', { name: /step/i }))

    expect(props.onStep).toHaveBeenCalledTimes(1)
  })

  it('calls onReset when clicking Reset', async () => {
    const user = userEvent.setup()
    const props = renderControls()

    await user.click(screen.getByRole('button', { name: /reset/i }))

    expect(props.onReset).toHaveBeenCalledTimes(1)
  })

  it('calls onSpeedChange with the new value when the slider changes', () => {
    const props = renderControls()

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '500' } })

    expect(props.onSpeedChange).toHaveBeenCalledWith(500)
  })

  it('disables Start and Step while running, enables Pause', () => {
    renderControls({ running: true })

    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /step/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /pause/i })).toBeEnabled()
  })

  it('disables Pause while stopped, enables Start and Step', () => {
    renderControls({ running: false })

    expect(screen.getByRole('button', { name: /pause/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /start/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /step/i })).toBeEnabled()
  })

  it('displays the current generation count', () => {
    renderControls({ generation: 42 })

    expect(screen.getByText(/42/)).toBeInTheDocument()
  })
})
