import '@testing-library/jest-dom/vitest'

// jsdom n'implémente pas le Canvas 2D context ; stub minimal pour que
// les composants qui dessinent sur un <canvas> ne plantent pas en test.
HTMLCanvasElement.prototype.getContext = () => ({
  fillStyle: '',
  fillRect: () => {},
  strokeStyle: '',
  lineWidth: 1,
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  stroke: () => {},
})

// jsdom n'implémente pas non plus ResizeObserver.
globalThis.ResizeObserver ??= class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
