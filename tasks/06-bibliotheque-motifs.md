# 06 — Bibliothèque de motifs (au-delà de la V1)

Item de roadmap du `CLAUDE.md` ("banque de motifs préconstruits, partage communautaire de patterns"), livré avant le reste de la roadmap Node.js/RLE d'import-export car demandé explicitement.

**Décision** : pas de compte utilisateur (le site n'a pas le trafic pour en justifier un). Le dédoublonnage se fait par **signature de forme** — la grille du motif réduite à sa boîte englobante, comparée sous ses 8 orientations (rotations 90°/180°/270° et réflexions) — pour qu'un motif ne puisse pas être soumis deux fois sous une orientation différente, y compris s'il reproduit un motif de la bibliothèque de base.

**Stockage** : Cloudflare KV (binding `PATTERNS`), via un petit Worker (`worker/index.js`) qui sert l'API `/api/patterns` (GET liste, POST création avec validation + dédoublonnage) et délègue le reste au binding `ASSETS` (assets statiques, comme avant). Le déploiement Cloudflare passe donc d'un Worker "assets seuls" à un Worker avec script + assets.

## À faire

- [x] Moteur : parsing/sérialisation RLE (`src/engine/rle.js`), signature de forme canonique invariante par rotation/réflexion
- [x] Bibliothèque de motifs de base (planeur, clignotant, crapaud, phare, pulsar, vaisseau léger, bloc, ruche) — chacun vérifié par simulation (période/déplacement attendu) plutôt que recopié à l'œil
- [x] Pose de motif sur la grille (`stampPatternEngine`, combinaison OR avec l'état existant)
- [x] UI : panneau "Bibliothèque de motifs" dans la barre latérale, armement d'un motif + placement au clic (Échap ou re-clic pour annuler)
- [x] UI : partage du motif dessiné sur la grille (formulaire nom + validation)
- [x] Worker Cloudflare + KV : API `/api/patterns`, dédoublonnage serveur (source de vérité), délégation vers `ASSETS` pour le reste
- [x] Proxy Vite (`/api` → `wrangler dev` en local) + script `npm run dev:worker`
- [ ] **Action manuelle requise** : créer le namespace KV réel sur Cloudflare (`npx wrangler kv namespace create PATTERNS`) et renseigner son id dans `wrangler.jsonc` (actuellement un placeholder) avant que le déploiement ne fonctionne

## Definition of done

- [x] Tests unitaires (moteur RLE, signature canonique, motifs de base vérifiés par simulation, Worker avec KV simulé, composants React) — suite verte, couverture globale au-dessus du seuil de 80 %
- [x] Vérifié visuellement (Playwright, via `wrangler dev` local) : pose d'un motif de base, dessin + partage d'un motif, rejet d'un doublon (y compris tourné)
- [ ] Déployé et fonctionnel en production — bloqué sur l'action manuelle ci-dessus
