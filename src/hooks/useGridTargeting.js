import { useCallback, useEffect, useRef, useState } from 'react'
import {
  cellsEqual,
  isClick,
  pointerThreshold,
  resolveTargetingSession,
  stepHoverDepth,
} from '../components/grid3DHelpers'

// Différencie un clic/tap (édite une cellule) d'un glisser (fait tourner
// la vue via OrbitControls) : en dessous de ce seuil de déplacement entre
// pointerdown et pointerup, on considère qu'il n'y a pas eu de rotation.
// Un doigt est moins précis qu'une souris, d'où un seuil plus large au
// tactile.
const CLICK_DRAG_THRESHOLD_PX = 5
const TOUCH_TAP_THRESHOLD_PX = 15
// Si le pointeur/doigt s'écarte de plus que ce seuil de l'endroit où la
// session de ciblage a été figée, on considère qu'il vise un nouvel
// endroit et on en fige une nouvelle — sinon la colonne x/y reste
// rigoureusement fixe, seule la profondeur bouge (molette ou taps
// répétés). Comparé à l'origine de la session, pas à la dernière position
// connue : une main qui dérive légèrement pendant qu'on scrolle ne doit
// jamais faire glisser la cellule visée vers une colonne voisine.
const SAME_SPOT_THRESHOLD_PX = 16
const TOUCH_SAME_SPOT_THRESHOLD_PX = 28
// Au tactile (pas de molette), des taps répétés au même endroit avancent
// la profondeur visée ; une pause sans nouveau tap valide (bascule) la
// cellule actuellement prévisualisée.
const TOUCH_COMMIT_DELAY_MS = 2500

// Toute la logique de ciblage 3D (souris : survol figé + molette + clic ;
// tactile : taps répétés + pause pour valider), indépendante de
// Three.js/R3F — ne lit que des évènements pointeur/molette classiques
// (clientX/Y, pointerType, ray, stopPropagation) et gère elle-même son
// state React. Rend Grid3D.jsx (le rendu) et cette logique (le
// comportement) testables séparément : celle-ci sans WebGL, avec de
// simples objets évènement simulés.
export function useGridTargeting({ grid, sizeX, sizeY, sizeZ, offset, onToggleCell }) {
  const sessionRef = useRef(null)
  const commitTimerRef = useRef(null)
  const pointerDownRef = useRef(null)
  // Lu par le commit tactile différé, qui peut se déclencher bien après
  // le tap qui l'a programmé : on veut l'état le plus récent de la
  // grille à ce moment-là, pas celui capturé au moment du tap.
  const gridRef = useRef(grid)
  const [previewCell, setPreviewCell] = useState(null)

  useEffect(() => {
    gridRef.current = grid
  }, [grid])

  useEffect(() => {
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
    }
  }, [])

  const updatePreview = useCallback((cell) => {
    setPreviewCell((current) => (cellsEqual(current, cell) ? current : cell))
  }, [])

  const clearCommitTimer = useCallback(() => {
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
    }
  }, [])

  const commitSession = useCallback(
    (session) => {
      const cell = session.path[session.depthIndex]
      const currentGrid = gridRef.current
      const alreadyAlive = currentGrid[cell.x]?.[cell.y]?.[cell.z] ?? false
      onToggleCell(cell.x, cell.y, cell.z, !alreadyAlive)
    },
    [onToggleCell],
  )

  // Renvoie la session en cours si le point visé est toujours (à peu
  // près) celui d'origine — sans jamais recalculer le trajet dans ce
  // cas — ou en fige et renvoie une nouvelle sinon (cf. grid3DHelpers).
  const resolveSession = useCallback(
    (screenPos, ray, thresholdPx) => {
      const result = resolveTargetingSession(sessionRef.current, screenPos, ray, thresholdPx, {
        sizeX,
        sizeY,
        sizeZ,
        offset,
      })
      sessionRef.current = result.session
      return result
    },
    [sizeX, sizeY, sizeZ, offset],
  )

  const handlePointerMove = useCallback(
    (event) => {
      if (!event.ray || event.pointerType === 'touch') return

      const screenPos = { x: event.clientX, y: event.clientY }
      const { session } = resolveSession(screenPos, event.ray, SAME_SPOT_THRESHOLD_PX)
      updatePreview(session ? session.path[session.depthIndex] : null)
    },
    [resolveSession, updatePreview],
  )

  const handleWheel = useCallback(
    (event) => {
      const session = sessionRef.current
      if (!session) return
      // R3F attache l'écouteur wheel en mode passif : preventDefault()
      // n'a aucun effet dessus (et lève un avertissement) — stopPropagation
      // suffit, la molette ne fait de toute façon rien défiler ici (le
      // viewport 3D n'a pas de scroll, cf. .grid3d-viewport en CSS).
      event.stopPropagation()

      session.depthIndex = stepHoverDepth(session, event.deltaY).depthIndex
      updatePreview(session.path[session.depthIndex])
    },
    [updatePreview],
  )

  const handlePointerLeave = useCallback(
    (event) => {
      // Au tactile, pointerleave suit le pointerup de très près : l'ignorer
      // pour ne pas annuler la session (et son minuteur de validation)
      // qu'un tap vient tout juste d'amorcer.
      if (event.pointerType === 'touch') return
      sessionRef.current = null
      updatePreview(null)
    },
    [updatePreview],
  )

  const scheduleTouchCommit = useCallback(
    (session) => {
      clearCommitTimer()
      commitTimerRef.current = setTimeout(() => {
        commitTimerRef.current = null
        if (sessionRef.current === session) {
          commitSession(session)
          sessionRef.current = null
          updatePreview(null)
        }
      }, TOUCH_COMMIT_DELAY_MS)
    },
    [clearCommitTimer, commitSession, updatePreview],
  )

  const handleValidTap = useCallback(
    (event) => {
      if (!event.ray) return
      event.stopPropagation()

      if (event.pointerType === 'touch') {
        const screenPos = { x: event.clientX, y: event.clientY }
        const { session, isNew } = resolveSession(
          screenPos,
          event.ray,
          TOUCH_SAME_SPOT_THRESHOLD_PX,
        )
        if (!session) return

        if (!isNew) {
          session.depthIndex = stepHoverDepth(session, 1).depthIndex
        }
        updatePreview(session.path[session.depthIndex])
        scheduleTouchCommit(session)
        return
      }

      const session = sessionRef.current
      if (!session) return
      commitSession(session)
    },
    [resolveSession, updatePreview, scheduleTouchCommit, commitSession],
  )

  const handlePointerDown = useCallback((event) => {
    pointerDownRef.current = {
      pos: { x: event.clientX, y: event.clientY },
      pointerType: event.pointerType,
    }
  }, [])

  const handlePointerUp = useCallback(
    (event) => {
      const down = pointerDownRef.current
      pointerDownRef.current = null
      if (!down) return

      const up = { x: event.clientX, y: event.clientY }
      const threshold = pointerThreshold(
        down.pointerType,
        CLICK_DRAG_THRESHOLD_PX,
        TOUCH_TAP_THRESHOLD_PX,
      )
      if (!isClick(down.pos, up, threshold)) return

      handleValidTap(event)
    },
    [handleValidTap],
  )

  return {
    previewCell,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerMove: handlePointerMove,
      onPointerEnter: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onWheel: handleWheel,
    },
  }
}
