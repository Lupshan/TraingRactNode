# 12 — Génération aléatoire reproductible (seed)

Complète l'item roadmap « génération aléatoire avancée / seeds partageables » du `CLAUDE.md`. Demande : pouvoir générer des dimensions et un remplissage aléatoires, à partir d'une seed — même seed = exactement la même grille à chaque fois (2D comme 3D).

## Décisions

- **Densité de remplissage réglable** (slider 1-99%, défaut 50%), pas fixe : plus flexible pour explorer différents profils de grille.
- **Bornes des dimensions tirées fixes**, pas réglables : 10-60 par axe en 2D, 6-20 par axe en 3D (une grille 3D 60×60×60 serait bien trop lourde à simuler/rendre). Le remplissage ne redéfinit pas les bornes de `GridSettings`/`GridSettings3D`, juste la plage dans laquelle une dimension est tirée aléatoirement.
- Seed acceptée en texte libre (nombre ou mot) — si le champ est laissé vide, une seed numérique est tirée et **réaffichée** dans le champ après génération, pour que l'utilisateur puisse la noter/partager et la rejouer à l'identique.

## Implémentation

- `mulberry32(seed)` dans `src/engine/randomGrid.js` : PRNG seedable (implémentation canonique), indépendant de `Math.random()` — même seed ⇒ même suite de floats `[0, 1)` à chaque appel, reproductible sur n'importe quelle machine.
- `hashSeed(input)` : accepte une seed textuelle en plus d'une seed numérique, hachée (djb2) en entier 32 bits pour nourrir `mulberry32` — comme Minecraft le fait pour ses seeds non numériques.
- `generateRandomGrid2D(seed, density)` / `generateRandomGrid3D(seed, density)` : tirent les dimensions (`min + Math.floor(rand() * (max - min + 1))`) puis chaque cellule (`rand() < density`), dans un ordre fixe — la reproductibilité dépend de cet ordre, pas seulement de la seed.
- `useSimulation`/`useSimulation3D` exposent `generateRandom(seed, density)` : remplace la grille, réinitialise `running`/`generation`, même pattern que `resizeGrid`.
- `RandomFillControls.jsx` : composant partagé 2D/3D (seed + slider densité + bouton), ne connaît ni les dimensions ni le moteur — juste `onGenerate(seed, density)`. Monté dans `GridSettings.jsx` et `GridSettings3D.jsx`, sous le formulaire de redimensionnement existant.

## À faire

- [x] `mulberry32`, `hashSeed`, `generateRandomGrid2D`, `generateRandomGrid3D` dans `randomGrid.js`, testés (déterminisme, bornes, densité 0/1, seeds différentes → résultats différents)
- [x] `generateRandom` dans `useSimulation`/`useSimulation3D`, testé
- [x] `RandomFillControls.jsx`, testé (seed saisie, densité par défaut/modifiée, seed vide → résolue et réaffichée)
- [x] Intégration dans `GridSettings.jsx`/`GridSettings3D.jsx` + `App.jsx`, CSS (`.random-fill`)

## Definition of done

- [x] Tests unitaires verts, couverture globale au-dessus du seuil de 80 %
- [x] `npm run lint`, `npm run build` passent
- [x] Vérifié visuellement avec Playwright (navigateur réel) : génération 2D produit une grille de densité ~50% ; régénérer avec la même seed depuis un état propre donne un screenshot pixel-identique (reproductibilité confirmée visuellement) ; seed vide → un nombre est résolu et réaffiché dans le champ ; génération 3D fonctionne sans erreur console
