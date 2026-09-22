import { useEffect, useState } from 'react'
import { fetchCommunityPatterns, submitCommunityPattern } from '../api/patterns'
import { parseRLE, serializeRLE, trimToBoundingBox } from '../engine/rle'
import { BUILTIN_PATTERNS } from '../patterns/builtin'
import { validatePatternSubmission } from '../patterns/validation'
import PatternThumbnail from './PatternThumbnail'

function PatternLibrary({ armedPatternId, onArm, onCancelArm, grid }) {
  const [communityPatterns, setCommunityPatterns] = useState([])
  const [communityStatus, setCommunityStatus] = useState('loading')
  const [shareName, setShareName] = useState('')
  const [shareStatus, setShareStatus] = useState(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetchCommunityPatterns()
      .then((patterns) => {
        if (cancelled) return
        setCommunityPatterns(patterns)
        setCommunityStatus('idle')
      })
      .catch(() => {
        if (cancelled) return
        setCommunityStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  function handlePick(entry) {
    if (armedPatternId === entry.id) {
      onCancelArm()
      return
    }
    onArm({ id: entry.id, name: entry.name, cells: parseRLE(entry.rle) })
  }

  const shareableCells = trimToBoundingBox(grid)
  const shareValidationError = validatePatternSubmission({ name: shareName, cells: shareableCells })

  async function handleShare(event) {
    event.preventDefault()
    setSharing(true)
    setShareStatus(null)

    try {
      const rle = serializeRLE(shareableCells)
      const pattern = await submitCommunityPattern(shareName, rle)
      setCommunityPatterns((current) => [pattern, ...current])
      setShareName('')
      setShareStatus({ type: 'success', message: `« ${pattern.name} » ajouté à la bibliothèque.` })
    } catch (error) {
      setShareStatus({ type: 'error', message: error.message })
    } finally {
      setSharing(false)
    }
  }

  return (
    <fieldset className="pattern-library">
      <legend>Bibliothèque de motifs</legend>

      {armedPatternId && (
        <p className="pattern-hint">
          Motif armé — clique sur la grille pour le placer (re-clique sur le motif pour annuler).
        </p>
      )}

      <div>
        <span>Motifs de base</span>
        <div className="pattern-grid">
          {BUILTIN_PATTERNS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="pattern-card"
              aria-pressed={armedPatternId === entry.id}
              onClick={() => handlePick(entry)}
            >
              <PatternThumbnail cells={parseRLE(entry.rle)} />
              <span>{entry.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span>Motifs de la communauté</span>
        {communityStatus === 'loading' && <p className="pattern-status">Chargement…</p>}
        {communityStatus === 'error' && (
          <p className="pattern-status pattern-status-error">
            Impossible de charger les motifs communautaires.
          </p>
        )}
        {communityStatus === 'idle' && communityPatterns.length === 0 && (
          <p className="pattern-status">Aucun motif partagé pour l’instant — sois le premier·ère !</p>
        )}
        <div className="pattern-grid">
          {communityPatterns.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="pattern-card"
              aria-pressed={armedPatternId === entry.id}
              onClick={() => handlePick(entry)}
            >
              <PatternThumbnail cells={parseRLE(entry.rle)} />
              <span>{entry.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="pattern-share" onSubmit={handleShare}>
        <span>Partager le motif dessiné sur la grille</span>
        <div className="pattern-share-row">
          <input
            type="text"
            placeholder="Nom du motif"
            value={shareName}
            onChange={(event) => setShareName(event.target.value)}
            aria-label="Nom du motif à partager"
          />
          <button
            type="submit"
            disabled={sharing || Boolean(shareValidationError)}
            title={shareValidationError ?? undefined}
          >
            Partager
          </button>
        </div>
        {shareStatus && (
          <p
            className={`pattern-status ${
              shareStatus.type === 'error' ? 'pattern-status-error' : 'pattern-status-success'
            }`}
          >
            {shareStatus.message}
          </p>
        )}
      </form>
    </fieldset>
  )
}

export default PatternLibrary
