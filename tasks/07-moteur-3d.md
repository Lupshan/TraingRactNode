# 07 — Moteur 3D (V2, sans rendu)

Premier morceau de la V2 (mode 3D, roadmap du `CLAUDE.md`). Périmètre volontairement restreint : uniquement la logique de simulation 3D, testée et solide, avant d'attaquer le rendu Three.js/react-three-fiber (tâche séparée) et la bascule 2D/3D dans l'UI (tâche séparée également).

**Décisions** :
- Grille 3D configurable en X/Y/Z séparés (pas un cube imposé), cohérent avec le 2D (lignes/colonnes séparées).
- Voisinage de Moore en 3D (26 voisins autour de chaque cellule), bords morts (pas de tore) — même principe qu'en 2D.
- Règle par défaut `B6/S5-7` : naissance à exactement 6 voisins vivants, survie entre 5 et 7. Vérifiée par simulation (pas juste choisie à l'instinct) : une grille dense (densité 0.5) atteint un état stable non trivial (35 cellules vivantes, inchangé sur 15 générations) — ni extinction immédiate, ni saturation.
- Nouvelle notation de règles en intervalles (`"1, 4, 6-11, 24"`) pour la saisie côté UI (27 valeurs possibles, des chips individuelles comme en 2D ne passeraient pas) — le panneau 2D existant (chips 0-8) n'est pas touché.

## À faire

- [x] `src/engine/neighborRanges.js` : parseur/sérialiseur de la notation d'intervalles, testé (parsing tolérant, round-trip, tri, dédoublonnage)
- [x] `src/engine/gameOfLife3D.js` : `createEmptyGrid3D`, `countLiveNeighbors3D` (voisinage de Moore 26, bords morts vérifiés explicitement — pas de wraparound), `nextGeneration3D`, `DEFAULT_RULES_3D`
- [x] Règle par défaut vérifiée par simulation, pas recopiée à l'aveugle
- [x] Rendu Three.js / react-three-fiber, bascule 2D/3D et panneau de règles 3D → [tâche 08](./08-rendu-3d.md)

## Definition of done

- [x] Tests unitaires verts (moteur 3D + parseur d'intervalles), couverture globale au-dessus du seuil de 80 %
- [x] `npm run lint`, `npm run build` passent
