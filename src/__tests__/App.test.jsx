import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import * as patternsApi from '../api/patterns'

vi.mock('../api/patterns')

describe('App', () => {
  beforeEach(() => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
  })

  it('renders the heading and assembles the grid, controls, settings and rules panel', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /jeu de la vie/i })).toBeInTheDocument()
    expect(screen.getByTestId('grid-canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redimensionner/i })).toBeInTheDocument()
    expect(screen.getByText(/règles \(b\/s\)/i)).toBeInTheDocument()
    expect(screen.getByText(/bibliothèque de motifs/i)).toBeInTheDocument()
  })

  it('toggles the sidebar visibility when clicking the toggle button', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggle = screen.getByRole('button', { name: /masquer les paramètres/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await user.click(toggle)

    const reopenToggle = screen.getByRole('button', { name: /afficher les paramètres/i })
    expect(reopenToggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(reopenToggle)

    expect(screen.getByRole('button', { name: /masquer les paramètres/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('arms a pattern from the library, shows a hint, and Escape cancels it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('Bloc'))
    expect(screen.getByText(/motif armé/i)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText(/motif armé/i)).not.toBeInTheDocument()
  })

  it('placing an armed pattern on the grid stamps it and keeps it armed for further placements', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('Bloc'))
    const canvas = screen.getByTestId('grid-canvas')
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })

    expect(screen.getByText(/motif armé/i)).toBeInTheDocument()
  })

  it('switches to the 3D view, showing the 3D grid and its own settings/rules', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '3D' }))

    // Grid3D est chargé en lazy (Three.js n'est utile qu'en 3D)
    expect(await screen.findByTestId('grid3d-canvas', {}, { timeout: 5000 })).toBeInTheDocument()
    expect(screen.queryByTestId('grid-canvas')).not.toBeInTheDocument()
    expect(screen.getByLabelText('X')).toBeInTheDocument()
    expect(screen.getByLabelText(/naissance/i)).toBeInTheDocument()
    // la bibliothèque de motifs est spécifique au 2D
    expect(screen.queryByText(/bibliothèque de motifs/i)).not.toBeInTheDocument()
  })

  it('resets the grid and stops the simulation when switching dimension', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /start/i }))
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '3D' }))
    await screen.findByTestId('grid3d-canvas', {}, { timeout: 5000 })
    await user.click(screen.getByRole('button', { name: '2D' }))

    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled()
    expect(screen.getByText('Génération : 0')).toBeInTheDocument()
  })

  it('cancels an armed 2D pattern when switching to 3D', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('Bloc'))
    expect(screen.getByText(/motif armé/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '3D' }))
    await screen.findByTestId('grid3d-canvas', {}, { timeout: 5000 })
    await user.click(screen.getByRole('button', { name: '2D' }))

    expect(screen.queryByText(/motif armé/i)).not.toBeInTheDocument()
  })
})
