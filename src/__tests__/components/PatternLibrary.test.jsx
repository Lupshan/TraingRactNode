import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PatternLibrary from '../../components/PatternLibrary'
import * as patternsApi from '../../api/patterns'

vi.mock('../../api/patterns')

function emptyGrid(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(false))
}

describe('PatternLibrary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists the built-in patterns', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    render(
      <PatternLibrary armedPatternId={null} onArm={() => {}} onCancelArm={() => {}} grid={emptyGrid(3, 3)} />,
    )

    expect(screen.getByText('Planeur')).toBeInTheDocument()
    expect(screen.getByText('Clignotant')).toBeInTheDocument()
    await waitFor(() => expect(patternsApi.fetchCommunityPatterns).toHaveBeenCalled())
  })

  it('shows a message when there are no community patterns yet', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    render(
      <PatternLibrary armedPatternId={null} onArm={() => {}} onCancelArm={() => {}} grid={emptyGrid(3, 3)} />,
    )

    expect(await screen.findByText(/aucun motif partagé/i)).toBeInTheDocument()
  })

  it('renders fetched community patterns and shows an error message on failure', async () => {
    patternsApi.fetchCommunityPatterns.mockRejectedValue(new Error('network down'))
    render(
      <PatternLibrary armedPatternId={null} onArm={() => {}} onCancelArm={() => {}} grid={emptyGrid(3, 3)} />,
    )

    expect(await screen.findByText(/impossible de charger/i)).toBeInTheDocument()
  })

  it('arms a built-in pattern when clicked, with its parsed cells', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    const onArm = vi.fn()
    render(
      <PatternLibrary armedPatternId={null} onArm={onArm} onCancelArm={() => {}} grid={emptyGrid(3, 3)} />,
    )

    fireEvent.click(screen.getByText('Bloc'))

    expect(onArm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'block',
        name: 'Bloc',
        cells: [
          [true, true],
          [true, true],
        ],
      }),
    )
  })

  it('cancels the armed pattern when its already-armed card is clicked again', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    const onCancelArm = vi.fn()
    render(
      <PatternLibrary
        armedPatternId="block"
        onArm={() => {}}
        onCancelArm={onCancelArm}
        grid={emptyGrid(3, 3)}
      />,
    )

    fireEvent.click(screen.getByText('Bloc'))

    expect(onCancelArm).toHaveBeenCalled()
  })

  it('disables sharing while the grid is empty', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    render(
      <PatternLibrary armedPatternId={null} onArm={() => {}} onCancelArm={() => {}} grid={emptyGrid(3, 3)} />,
    )

    expect(screen.getByRole('button', { name: 'Partager' })).toBeDisabled()
  })

  it('submits the drawn grid as a new community pattern and shows a success message', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    patternsApi.submitCommunityPattern.mockResolvedValue({
      id: 'abc',
      name: 'Mon motif',
      rle: 'x = 1, y = 1\no!',
      createdAt: 1,
    })

    const grid = emptyGrid(3, 3)
    grid[1][1] = true

    render(<PatternLibrary armedPatternId={null} onArm={() => {}} onCancelArm={() => {}} grid={grid} />)

    fireEvent.change(screen.getByLabelText('Nom du motif à partager'), {
      target: { value: 'Mon motif' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Partager' }))

    expect(await screen.findByText(/ajouté à la bibliothèque/)).toBeInTheDocument()
    expect(patternsApi.submitCommunityPattern).toHaveBeenCalledWith('Mon motif', expect.stringContaining('o!'))
    expect(await screen.findByText('Mon motif')).toBeInTheDocument()
  })

  it('shows the server error message when submission is rejected as a duplicate', async () => {
    patternsApi.fetchCommunityPatterns.mockResolvedValue([])
    const error = new Error('Ce motif existe déjà.')
    patternsApi.submitCommunityPattern.mockRejectedValue(error)

    const grid = emptyGrid(3, 3)
    grid[0][0] = true

    render(<PatternLibrary armedPatternId={null} onArm={() => {}} onCancelArm={() => {}} grid={grid} />)

    fireEvent.change(screen.getByLabelText('Nom du motif à partager'), {
      target: { value: 'Doublon' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Partager' }))

    expect(await screen.findByText('Ce motif existe déjà.')).toBeInTheDocument()
  })
})
