function Controls({
  running,
  generation,
  speed,
  onStart,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
}) {
  return (
    <div className="controls">
      <button type="button" onClick={onStart} disabled={running}>
        Start
      </button>
      <button type="button" onClick={onPause} disabled={!running}>
        Pause
      </button>
      <button type="button" onClick={onStep} disabled={running}>
        Step
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
      <label className="speed-input">
        Vitesse (ms/génération)
        <input
          type="number"
          min="10"
          step="10"
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
        />
      </label>
      <span>Génération : {generation}</span>
    </div>
  )
}

export default Controls
