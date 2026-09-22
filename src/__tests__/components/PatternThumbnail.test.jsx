import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PatternThumbnail from '../../components/PatternThumbnail'

describe('PatternThumbnail', () => {
  it('renders one cell element per cell in the pattern, marking alive ones', () => {
    const cells = [
      [true, false],
      [false, true],
    ]
    const { container } = render(<PatternThumbnail cells={cells} />)

    const cellEls = container.querySelectorAll('.pattern-thumb-cell')
    expect(cellEls).toHaveLength(4)

    const aliveEls = container.querySelectorAll('.pattern-thumb-cell-alive')
    expect(aliveEls).toHaveLength(2)
  })

  it('is decorative and hidden from assistive tech', () => {
    const { container } = render(<PatternThumbnail cells={[[true]]} />)

    expect(container.querySelector('.pattern-thumb')).toHaveAttribute('aria-hidden', 'true')
  })
})
