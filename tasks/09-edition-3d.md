# 09 — Édition manuelle de cellule en 3D

Complète la [tâche 08](./08-rendu-3d.md) : la grille 3D démarrait vide sans aucun moyen de la peupler depuis l'UI (`setCell` existait déjà dans le moteur mais rien ne l'appelait). Repéré par l'utilisateur en testant le rendu ("on a qu'un seul cube" — le contour de la grille, aucune cellule).

**Décision (choisie parmi deux options proposées)** : clic sur une face pour activer/désactiver la cellule à cet endroit, plutôt qu'un système de tranche/couche navigable façon scanner. Limite acceptée : on ne peut viser que ce qui est à la surface exposée du cube, pas une cellule cachée au milieu sans d'abord dégager les couches autour — complété par le mode fantôme de la [tâche 10](./10-mode-fantome-3d.md), l'utilisateur ayant demandé comment remplir l'intérieur du cube.

## Implémentation

- Une boîte invisible (`meshBasicMaterial visible={false}`), superposée exactement au contour filaire de la grille, sert de cible de raycast unique. `resolveCellFromBoxFaceHit` (logique pure, testée) déduit la cellule visée à partir du point d'impact et de la normale de la face touchée : l'axe de la normale donne la couche (première/dernière), les deux autres sont déduits du point d'impact et bornés aux dimensions de la grille.
- **Bug trouvé et corrigé en cours de route** : la première version testait aussi un raycast direct sur les petits cubes des cellules vivantes (`instancedMesh`) pour permettre de les éteindre au clic. Mais géométriquement, la boîte invisible de contour est *toujours* plus proche de la caméra que les cubes des cellules en couche externe (qui sont légèrement en retrait, `CELL_SIZE` < 1 unité de grille) — un second clic au même endroit retombait donc toujours sur la boîte et rallumait la cellule au lieu de l'éteindre. Corrigé en unifiant sur un seul gestionnaire (celui de la boîte), qui lit l'état réel de la grille à la position visée (`grid[x][y][z]`) plutôt que de dépendre de quel mesh le rayon a effectivement touché — supprime toute ambiguïté géométrique.
- Distinction clic / glisser-pour-tourner : `OrbitControls` utilise le clic-glissé de la souris pour la rotation, donc un simple `onClick` s'activerait aussi après une rotation (React Three Fiber ne fait pas la distinction tout seul). Mesuré nous-mêmes : la distance en pixels entre `pointerdown` et `pointerup` doit rester sous un petit seuil pour compter comme un clic.
- Désactivé pendant que la simulation tourne (`setCell` du hook `useSimulation3D` est déjà un no-op si `running`), comme partout ailleurs dans l'appli.

## À faire

- [x] `resolveCellFromBoxFaceHit` dans `grid3DHelpers.js`, testé (les 6 faces, bornage des coordonnées dans le plan, cas limites)
- [x] Cible de clic unique sur la boîte de contour, lecture de l'état réel de la grille pour basculer allumé/éteint
- [x] Distinction clic/glisser pour ne pas interférer avec `OrbitControls`
- [x] Branché dans `App.jsx` (`onToggleCell={sim3D.setCell}`)

## Definition of done

- [x] Tests unitaires verts (`resolveCellFromBoxFaceHit`), couverture globale au-dessus du seuil de 80 %, suite complète stable sur plusieurs exécutions consécutives (un test avait été trouvé flaky au passage — timeout par défaut de `findByTestId` trop court sous charge parallèle avec plusieurs fichiers de test WebGL — corrigé avec un timeout explicite)
- [x] `npm run lint`, `npm run build` passent
- [x] Vérifié visuellement de bout en bout avec Playwright (navigateur réel) : premier clic pose une cellule, second clic au même endroit la retire, un glisser de rotation ne modifie jamais la grille (même en passant au-dessus d'une cellule existante), construction sur plusieurs faces après rotation, aucune erreur console
