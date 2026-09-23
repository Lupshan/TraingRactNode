# 11 — Ciblage 3D au survol + molette, tutoriel, ligne « Mort » dérivée

Retour utilisateur sur la [tâche 10](./10-mode-fantome-3d.md) : le mode fantôme (cellules semi-transparentes + re-clic au même endroit pour avancer) était jugé peu lisible. Trois demandes groupées dans le même retour, traitées dans une seule tâche/PR :

1. Remplacer le mode fantôme par un aperçu de la cellule visée au survol, réglable en profondeur à la molette.
2. Ajouter un petit tutoriel expliquant ce ciblage et la notation de règles B/S.
3. Ajouter une ligne/champ « Mort » en lecture seule dans les deux panneaux de règles (2D et 3D), déduite de « Survie ».

## 1. Ciblage 3D : survol + molette + clic

- Au survol de la grille, `computeRayGridPath` (inchangé, cf. tâche 10) calcule le trajet du rayon ; la première cellule (couche externe, sous la face survolée) est prévisualisée par défaut — surbrillance verte (cellule morte, le clic l'allumerait) ou rouge (cellule vivante, le clic l'éteindrait), via un mesh dédié sans cible de raycast (`raycast={() => null}`).
- Tourner la molette pendant le survol avance/recule la profondeur prévisualisée le long du même trajet, sans avoir à re-cliquer. Un déplacement du pointeur de plus de 8px à l'écran depuis le dernier survol réinitialise la profondeur à la couche externe (nouvel endroit visé).
- Le clic valide (toggle) la cellule actuellement prévisualisée. Le clic-vs-glisser (rotation de la vue) reste différencié par la distance parcourue entre `pointerdown` et `pointerup` (inchangé de la tâche 09/10).
- `OrbitControls` reçoit `enableZoom={!previewCell}` : la molette pilote la profondeur pendant le survol de la grille, et zoome la caméra normalement ailleurs sur le canvas.
- Logique pure extraite dans `grid3DHelpers.js` (testée unitairement) : `cellsEqual`, `nextHoverTrack` (calcule la profondeur à prévisualiser), `stepHoverDepth` (avance/recule bornée), `isClick` (distance pointerdown→pointerup). Le composant `Grid3D.jsx` ne fait plus que le câblage React/Three (peu testable en jsdom sans WebGL — vérifié visuellement via Playwright, cf. Definition of done).
- Mode fantôme entièrement supprimé : bouton, message d'aide, prop `ghostMode`, opacité semi-transparente des cellules vivantes.

## 2. Tutoriel

- `HelpModal.jsx` : boîte de dialogue native (`<dialog>`, `showModal()`/`close()` avec repli si non supporté — utile en test jsdom) ouverte par un bouton « ? » à côté du titre.
- Contenu conditionné par la dimension active : la section « Éditer la grille en 3D » (survol/molette/clic) n'apparaît qu'en 3D ; la section règles B/S (avec exemple `B3/S23` et notation par intervalles 3D) est toujours présente.
- Élément `<dialog>` toujours monté (pour que la `ref` soit stable et que l'effet réagisse à chaque changement d'`open`) ; seul son contenu est conditionné par `open`, pour qu'il n'existe pas dans le DOM tant que fermé.

## 3. Ligne « Mort » dérivée

- `complementRange(set, max)` dans `neighborRanges.js` : complémentaire d'un ensemble de voisins sur `[0, max]`.
- 2D (`RulesPanel.jsx`) : ligne de chips en lecture seule (`<span>`, pas `<button>`) sous Naissance/Survie, sur 0–8 voisins.
- 3D (`RulesPanel3D.jsx`) : champ texte `disabled`/`readOnly` sous Naissance/Survie, sur 0–26 voisins, même notation par intervalles que les autres champs.
- Un texte d'aide (« Déduit de « Survie »… ») rappelle que le champ est calculé, pas saisi.

## À faire

- [x] `complementRange` dans `neighborRanges.js`, testé
- [x] Ligne « Mort » 2D (chips en lecture seule) et 3D (champ texte désactivé), testées
- [x] `Grid3D.jsx` réécrit : survol + molette + clic, mode fantôme supprimé
- [x] Logique pure du ciblage extraite dans `grid3DHelpers.js` (`cellsEqual`, `nextHoverTrack`, `stepHoverDepth`, `isClick`), testée
- [x] `HelpModal.jsx` + bouton d'aide dans `App.jsx`, ghost mode retiré de `App.jsx`/`App.test.jsx`
- [x] CSS : styles des chips/champ en lecture seule, de la modale d'aide ; styles du mode fantôme retirés

## Definition of done

- [x] Tests unitaires verts, couverture globale au-dessus du seuil de 80 %
- [x] `npm run lint`, `npm run build` passent
- [x] Vérifié visuellement de bout en bout avec Playwright (navigateur réel) : survol affiche l'aperçu vert sur la couche externe ; la molette déplace l'aperçu vers l'intérieur (confirmé en tournant la vue, aperçu visible à l'intérieur du cube) ; un glisser fait tourner la vue sans poser de cellule ; le clic pose la cellule prévisualisée (aperçu passe au rouge, cube plein visible) ; la molette hors de la grille zoome la caméra normalement ; tutoriel 2D et 3D affichent le bon contenu ; aucune erreur console
