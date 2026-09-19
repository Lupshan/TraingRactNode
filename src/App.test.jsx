import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the heading and assembles the grid, controls, settings and rules panel', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /jeu de la vie/i })).toBeInTheDocument()
    expect(screen.getByTestId('grid-canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redimensionner/i })).toBeInTheDocument()
    expect(screen.getByText(/règles \(b\/s\)/i)).toBeInTheDocument()
  })
})
