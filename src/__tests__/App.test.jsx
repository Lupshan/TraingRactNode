import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the heading and assembles the grid, controls, settings and rules panel', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /jeu de la vie/i })).toBeInTheDocument()
    expect(screen.getByTestId('grid-canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redimensionner/i })).toBeInTheDocument()
    expect(screen.getByText(/règles \(b\/s\)/i)).toBeInTheDocument()
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
})
