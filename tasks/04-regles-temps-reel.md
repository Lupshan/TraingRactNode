# 04 — Modification des règles en temps réel

## À faire

- [x] Compléter le `RulesPanel` : interface pour définir B (naissance) et S (survie) — par exemple des cases à cocher pour 0 à 8 voisins pour chacune des deux conditions (déjà fait en task 02)
- [x] Le changement de règle doit s'appliquer dès la génération suivante, sans reset de la grille ni interruption de la simulation en cours
- [x] Vérifier que changer de règle pendant que la simulation tourne ne casse rien : pas de génération sautée, pas de re-render intempestif de toute la grille (le moteur doit simplement lire les règles actives à chaque tick, pas les figer au démarrage)

## Tests

- [x] Changer de règle en cours de simulation produit bien la génération suivante attendue selon les nouvelles règles (test moteur)
- [x] Changer de règle ne provoque pas de reset de la grille ni d'interruption visible de la simulation (test composant/intégration)

## Definition of done

- [x] On peut modifier B/S depuis l'UI pendant que la simulation tourne et voir l'effet dès la génération suivante
- [x] Les tests couvrant ce comportement passent en CI

## Note

`RulesPanel` était déjà complet (task 02). Le vrai travail : `useSimulation` gardait `rules` dans les dépendances de `step`, donc l'intervalle redémarrait à chaque changement de règle — pas garanti "sans interruption". Fix : `rules` lu via un `useRef` mis à jour par un effet séparé, `step` devient stable (deps vides), l'intervalle ne redémarre plus que sur `running`/`speed`.

Test de régression écrit d'abord contre l'ancien code pour confirmer qu'il échoue (décalage du tick de 100ms → 160ms), puis vérifié qu'il passe après le fix. Revérifié en conditions réelles (navigateur, changement de règle en cours de simulation via un clic sur une case à cocher) : effet visible dès la génération suivante, pas de reset, aucune erreur console.
