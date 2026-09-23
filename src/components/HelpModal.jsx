import { useEffect, useRef } from 'react'

// <dialog> gère nativement le focus trap et la touche Échap (via
// showModal) — pas besoin de les recoder. L'élément reste monté en
// permanence (pour que la ref soit stable et que l'effet réagisse à
// chaque changement d'`open`) ; seul son contenu est conditionné, pour
// qu'il n'existe pas dans le DOM tant que la boîte de dialogue est
// fermée.
function HelpModal({ open, onClose, dimension }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal()
      } else {
        dialog.setAttribute('open', '')
      }
    } else if (typeof dialog.close === 'function') {
      dialog.close()
    } else {
      dialog.removeAttribute('open')
    }
  }, [open])

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="help-modal"
      onClose={onClose}
      onCancel={onClose}
      onClick={handleBackdropClick}
    >
      {open && (
        <div className="help-modal-content">
          <header className="help-modal-header">
            <h2>Comment ça marche</h2>
            <button
              type="button"
              className="chip help-modal-close"
              onClick={onClose}
              aria-label="Fermer l'aide"
            >
              ✕
            </button>
          </header>

          {dimension === '3d' && (
            <section>
              <h3>Éditer la grille en 3D</h3>
              <ul>
                <li>
                  Survole une face du cube : la cellule visée s'affiche en
                  surbrillance (vert = tu vas l'allumer, rouge = tu vas
                  l'éteindre).
                </li>
                <li>
                  Fais tourner la molette pendant le survol pour avancer ou
                  reculer cet aperçu vers l'intérieur du cube, cellule par
                  cellule.
                </li>
                <li>
                  Clique pour valider la cellule actuellement prévisualisée.
                </li>
                <li>
                  Glisse la souris pour faire tourner la vue — ça ne modifie
                  pas la grille.
                </li>
              </ul>
            </section>
          )}

          <section>
            <h3>Règles de naissance et de survie (notation B/S)</h3>
            <p>
              À chaque génération, le nombre de voisins vivants d'une
              cellule décide de son sort :
            </p>
            <ul>
              <li>
                <strong>Naissance (B)</strong> : une cellule morte avec ce
                nombre de voisins vivants devient vivante.
              </li>
              <li>
                <strong>Survie (S)</strong> : une cellule vivante avec ce
                nombre de voisins vivants reste vivante.
              </li>
              <li>
                <strong>Mort (M)</strong> : tous les autres cas — une
                cellule vivante qui n'est pas dans les conditions de survie
                meurt. Ce champ est calculé automatiquement, pas besoin de
                le saisir.
              </li>
            </ul>
            <p>
              Exemple classique en 2D : <code>B3/S23</code> (naissance à 3
              voisins, survie à 2 ou 3 voisins). En 3D, le voisinage va de 0
              à 26 cellules et se saisit sous forme de liste et
              d'intervalles, par exemple <code>4-6</code>.
            </p>
          </section>
        </div>
      )}
    </dialog>
  )
}

export default HelpModal
