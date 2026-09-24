# 13 — Ciblage 3D tactile (tap + pause), fige x/y, corrige la resynchro des règles 3D

Retour utilisateur sur le ciblage 3D (tâche 11) : le survol + molette ne marche que sur souris (rien au tactile), et la molette faisait parfois glisser la cellule visée d'une colonne x/y voisine quand la main n'était pas parfaitement immobile pendant le scroll. Un deuxième bug (règles 3D qui ne se rafraîchissaient pas visuellement après une génération aléatoire) a été signalé et corrigé dans la même PR.

## 1. Bug molette : x/y devait rester figé, seul z devait bouger

- **Cause** : `GridInteraction` recalculait le trajet du rayon (`computeRayGridPath`) à **chaque** `pointermove`, y compris les micro-mouvements sous le seuil « même endroit ». Le seuil ne contrôlait que la remise à zéro de la profondeur, pas le recalcul du trajet lui-même — un tremblement de main entre deux crans de molette pouvait donc décaler la colonne x/y visée.
- **Fix** : `createTargetingSession`/`resolveTargetingSession` (`grid3DHelpers.js`) figent le trajet une seule fois, à l'origine de la session ; il n'est plus jamais recalculé tant que le point visé reste dans le seuil de tolérance autour de cette origine (comparé à l'origine, pas à la dernière position connue — sinon une dérive lente cumulée passerait inaperçue). Seule la molette (ou les taps répétés, cf. ci-dessous) modifie `depthIndex` dans ce trajet déjà figé.

## 2. Ciblage tactile : tap + pause

Pas de survol ni de molette au doigt — nouveau mécanisme, choisi par l'utilisateur :

- **Un tap** sur une face fige la session à la couche externe (comme un survol souris).
- **Chaque tap suivant au même endroit** avance la profondeur prévisualisée d'une cellule vers l'intérieur.
- **Une pause sans nouveau tap** (2,5 s) valide (bascule) la cellule actuellement prévisualisée, puis efface la session — tapoter ailleurs avant la pause abandonne la sélection en cours sans la valider.
- Distinction tap/glisser (pour l'orbite) : même principe que souris (distance parcourue entre pointerdown/pointerup), avec un seuil plus large (doigt moins précis).
- Bascule automatiquement entre les deux modes via `event.pointerType` ('touch' vs le reste) — aucune détection globale de l'appareil, ça fonctionne aussi sur un écran tactile hybride utilisé à la souris.

## 3. Refactor : toute la logique dans un hook testable

`useGridTargeting` (`src/hooks/useGridTargeting.js`) porte désormais tout le state machine (session, minuteur de validation tactile, refs) — `Grid3D.jsx`/`GridInteraction` ne fait plus que rendre le résultat (`previewCell`, `handlers` à spread sur le mesh invisible). Comme le hook ne touche jamais Three.js/WebGL directement (juste des évènements pointeur/molette classiques), il est testable avec de simples objets évènement simulés et `vi.useFakeTimers()`, sans jsdom-canvas — corrige au passage la faible couverture de `Grid3D.jsx` observée aux tâches précédentes.

## 4. Bug additionnel : règles 3D non resynchronisées après génération aléatoire

- **Symptôme signalé** : après génération aléatoire avec « Tirer aussi une règle aléatoire », le champ « Mort » change (il est dérivé de `rules.survive` à chaque rendu) mais « Naissance »/« Survie » restent visuellement figés — alors que les règles ont bien changé en interne.
- **Cause** : `RulesPanel3D`'s `birthText`/`surviveText` utilisaient un `useState` classique, qui ne capture `rules` qu'au montage et ne se resynchronise jamais quand la prop change depuis l'extérieur (même bug que la tâche 12, mais raté à l'époque car localisé au panneau de règles 3D plutôt qu'aux dimensions).
- **Fix (pas un simple `useSyncedState`)** : `onChange` étant appelé à chaque frappe, `rules` change de référence à chaque caractère tapé même en cas de saisie normale — et parse→serialize n'est pas idempotent caractère par caractère (« 1,2 » retapé redeviendrait « 1, 2 »). Une resynchronisation naïve sur tout changement de référence aurait donc reformaté le texte en cours de frappe. À la place : quand `rules` change de référence, on compare son **contenu** (`neighborSetsEqual`, nouveau helper) à celui qu'on afficherait déjà en reparsant le texte actuel — s'ils correspondent, ce n'est que l'écho de notre propre frappe (rien à faire) ; sinon, la resynchronisation est légitime (génération aléatoire, etc.).

## Definition of done

- [x] Tests unitaires verts, couverture globale au-dessus du seuil de 80 % (`useGridTargeting` testé en détail : survol/molette souris, verrouillage x/y, tap/pause tactile, minuteur annulé au démontage)
- [x] `npm run lint`, `npm run build` passent
- [x] Vérifié visuellement avec Playwright (navigateur réel) :
  - souris : survol + molette (avec petits mouvements parasites entre chaque cran) + clic fonctionnent, cellule validée cohérente
  - tactile (émulation iPhone) : 1er tap → aperçu couche externe ; taps suivants → profondeur avance ; pause 2,5 s → cellule validée (couleur pleine)
  - génération aléatoire avec règles : Naissance/Survie/Mort changent tous les trois visuellement ; taper du texte non canonique (« 1,2 ») dans un champ n'est jamais reformaté pendant la frappe
  - aucune erreur console
