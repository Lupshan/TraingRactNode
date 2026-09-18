# 04 — Modification des règles en temps réel

## À faire

- [ ] Compléter le `RulesPanel` : interface pour définir B (naissance) et S (survie) — par exemple des cases à cocher pour 0 à 8 voisins pour chacune des deux conditions
- [ ] Le changement de règle doit s'appliquer dès la génération suivante, sans reset de la grille ni interruption de la simulation en cours
- [ ] Vérifier que changer de règle pendant que la simulation tourne ne casse rien : pas de génération sautée, pas de re-render intempestif de toute la grille (le moteur doit simplement lire les règles actives à chaque tick, pas les figer au démarrage)

## Tests

- [ ] Changer de règle en cours de simulation produit bien la génération suivante attendue selon les nouvelles règles (test moteur)
- [ ] Changer de règle ne provoque pas de reset de la grille ni d'interruption visible de la simulation (test composant/intégration)

## Definition of done

- On peut modifier B/S depuis l'UI pendant que la simulation tourne et voir l'effet dès la génération suivante
- Les tests couvrant ce comportement passent en CI
