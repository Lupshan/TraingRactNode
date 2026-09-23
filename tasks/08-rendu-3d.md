# 08 — Rendu 3D, bascule 2D/3D, panneau de règles

Deuxième et dernier morceau de la V2 (mode 3D). Branché sur le moteur de la [tâche 07](./07-moteur-3d.md) : rendu Three.js/react-three-fiber, bascule 2D/3D dans l'`App`, panneau de règles par intervalles.

**Décisions** :
- Rendu via `<instancedMesh>` (un seul appel de dessin GPU pour toutes les cellules vivantes) plutôt qu'un `<mesh>` React par cellule — même principe que le "un seul `<canvas>`, pas de nœud DOM par cellule" du `CLAUDE.md`, transposé en 3D. Buffer dimensionné sur le volume max de la grille (`sizeX × sizeY × sizeZ`), `mesh.count` ajusté dynamiquement au nombre de cellules réellement vivantes.
- `OrbitControls` (`@react-three/drei`) pour naviguer autour de la grille — indispensable en 3D.
- Contour filaire de la grille via `THREE.EdgesGeometry` (pas un simple `wireframe: true` sur le mesh, qui dessinerait aussi les diagonales internes des triangles de chaque face — repéré et corrigé après une première capture d'écran qui montrait des croix parasites sur les faces).
- Bascule 2D/3D non temps réel (cf. `CLAUDE.md`) : réinitialise la grille et le moteur **des deux dimensions** à chaque changement, jamais seulement celle qu'on quitte — comportement volontairement testé (`App.test.jsx`) plutôt que supposé.
- `Three.js`/`@react-three/fiber`/`@react-three/drei` chargés en lazy (`React.lazy` + `Suspense`) : ces libs pèsent ~900 Ko, inutiles pour les visiteurs qui restent en 2D. Le bundle principal reste à ~239 Ko (proche de son poids avant la V2) ; le chunk 3D ne se télécharge qu'au clic sur "3D".
- Pas d'édition manuelle de cellule en 3D dans cette tâche (pas de raycasting clic → cellule) : `setCell` existe déjà dans `useSimulation3D`/`gameOfLife3D` (symétrique du 2D) mais rien ne l'appelle encore depuis l'UI. Périmètre extensible plus tard si besoin.
- Panneau de règles 3D en saisie libre par intervalles (`"1, 4, 6-11, 24"`, cf. tâche 07), appliqué en temps réel comme le panneau 2D ; le panneau 2D (chips) n'est pas touché.

## À faire

- [x] `src/components/grid3DHelpers.js` : extraction des positions de cellules vivantes + centrage de la grille sur l'origine, logique pure testée sans WebGL
- [x] `src/components/Grid3D.jsx` : `<instancedMesh>` + `OrbitControls` + contour filaire, chargé en lazy depuis `App.jsx`
- [x] `src/hooks/useSimulation3D.js` : même forme que `useSimulation` (start/pause/step/reset/resizeGrid/setRules/setSpeed), plus `setCell` (prêt pour une future édition manuelle)
- [x] `src/components/GridSettings3D.jsx` (X/Y/Z) et `src/components/RulesPanel3D.jsx` (intervalles) — mêmes conventions que leurs équivalents 2D
- [x] `App.jsx` : toggle 2D/3D, reset des deux moteurs au changement, bibliothèque de motifs cachée en 3D (spécifique au 2D)

## Definition of done

- [x] Tests unitaires verts (helpers 3D, hook `useSimulation3D`, `GridSettings3D`, `RulesPanel3D`, bascule dans `App.test.jsx`), couverture globale au-dessus du seuil de 80 %
- [x] `npm run lint`, `npm run build` passent ; bundle principal ~239 Ko, chunk 3D à part (~924 Ko / 245 Ko gzip), chargé à la demande
- [x] Vérifié visuellement (Playwright, navigateur réel) : cellules vivantes rendues comme cubes violets aux bonnes positions, contour de grille propre (sans diagonales), `OrbitControls` (rotation + zoom) fonctionnels, aucune erreur console
