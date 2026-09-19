import '@testing-library/jest-dom/vitest'

// jsdom n'implémente pas le Canvas 2D context ; stub minimal pour que
// les composants qui dessinent sur un <canvas> ne plantent pas en test.
HTMLCanvasElement.prototype.getContext = () => ({
  fillStyle: '',
  fillRect: () => {},
})
