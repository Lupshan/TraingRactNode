# 12 — Génération aléatoire reproductible (seed)

Complète l'item roadmap « génération aléatoire avancée / seeds partageables » du `CLAUDE.md`. Demande : pouvoir générer des dimensions et un remplissage aléatoires, à partir d'une seed — même seed = exactement la même grille à chaque fois (2D comme 3D).

## Décisions

- **Densité de remplissage réglable** (slider 1-99%, défaut 50%), pas fixe : plus flexible pour explorer différents profils de grille.
- **Bornes des dimensions tirées fixes**, pas réglables : 10-60 par axe en 2D, 6-20 par axe en 3D (une grille 3D 60×60×60 serait bien trop lourde à simuler/rendre). Le remplissage ne redéfinit pas les bornes de `GridSettings`/`GridSettings3D`, juste la plage dans laquelle une dimension est tirée aléatoirement.
- Seed acceptée en texte libre (nombre ou mot) — si le champ est laissé vide, une seed numérique est tirée et **réaffichée** dans le champ après génération, pour que l'utilisateur puisse la noter/partager et la rejouer à l'identique.
- La seed peut **aussi** déterminer les règles B/S (case à cocher « Tirer aussi une règle aléatoire », cochée par défaut) — désactivable pour tester une grille aléatoire avec des règles fixes/déjà réglées à la main.
- **Bug corrigé après coup** : quand le champ seed était vide, la seed auto-tirée était réécrite dans le champ pour être visible — mais ça la « verrouillait » du même coup, donc spammer le bouton rejouait indéfiniment la même grille au lieu d'en tirer une nouvelle. Un flag `seedIsAuto` distingue maintenant une seed auto-tirée (non « verrouillée » : chaque clic en retire une nouvelle) d'une seed tapée par l'utilisateur (verrouillée : reproductible d'un clic à l'autre, comme documenté).

## Implémentation

- `mulberry32(seed)` dans `src/engine/randomGrid.js` : PRNG seedable (implémentation canonique), indépendant de `Math.random()` — même seed ⇒ même suite de floats `[0, 1)` à chaque appel, reproductible sur n'importe quelle machine.
- `hashSeed(input)` : accepte une seed textuelle en plus d'une seed numérique, hachée (djb2) en entier 32 bits pour nourrir `mulberry32` — comme Minecraft le fait pour ses seeds non numériques.
- `generateRandomGrid2D(seed, density, { randomizeRules })` / `generateRandomGrid3D(...)` : tirent les dimensions (`min + Math.floor(rand() * (max - min + 1))`), puis — si `randomizeRules` — un ensemble de naissance et un ensemble de survie (`randomNeighborSet` : chaque nombre de voisins a une chance indépendante d'être inclus, probabilité plus haute pour la survie que pour la naissance afin de limiter le risque de règles qui tuent tout instantanément), puis chaque cellule (`rand() < density`) — dans cet ordre fixe : la reproductibilité dépend de l'ordre des tirages, pas seulement de la seed, donc activer/désactiver `randomizeRules` change aussi le remplissage obtenu pour une même seed.
- `useSimulation`/`useSimulation3D` exposent `generateRandom(seed, density, randomizeRules)` : remplace la grille (et les règles actives si `randomizeRules`), réinitialise `running`/`generation`, même pattern que `resizeGrid`.
- `RandomFillControls.jsx` : composant partagé 2D/3D (seed + slider densité + case à cocher + bouton), ne connaît ni les dimensions ni le moteur — juste `onGenerate(seed, density, randomizeRules)`. Monté dans `GridSettings.jsx` et `GridSettings3D.jsx`, sous le formulaire de redimensionnement existant.

## À faire

- [x] `mulberry32`, `hashSeed`, `generateRandomGrid2D`, `generateRandomGrid3D` dans `randomGrid.js`, testés (déterminisme, bornes, densité 0/1, seeds différentes → résultats différents)
- [x] `randomNeighborSet` + tirage optionnel des règles (`randomizeRules`), testé (bornes 0-8/0-26, reproductibilité, `rules: null` par défaut)
- [x] `generateRandom` dans `useSimulation`/`useSimulation3D`, testé (avec et sans `randomizeRules`)
- [x] `RandomFillControls.jsx`, testé (seed saisie, densité par défaut/modifiée, seed vide → résolue et réaffichée, case à cocher règles cochée par défaut)
- [x] Intégration dans `GridSettings.jsx`/`GridSettings3D.jsx` + `App.jsx`, CSS (`.random-fill`, `.random-fill-checkbox`)

## Definition of done

- [x] Tests unitaires verts, couverture globale au-dessus du seuil de 80 %
- [x] `npm run lint`, `npm run build` passent
- [x] Vérifié visuellement avec Playwright (navigateur réel) : génération 2D produit une grille de densité ~50% ; régénérer avec la même seed depuis un état propre donne un screenshot pixel-identique (reproductibilité confirmée visuellement) ; seed vide → un nombre est résolu et réaffiché dans le champ ; génération 3D fonctionne sans erreur console ; case cochée → les règles affichées changent (ex. Naissance passe de {3} à {3, 5}) ; case décochée puis regénération avec une autre seed → les règles restent celles issues du tirage précédent (pas re-randomisées), seule la grille change
