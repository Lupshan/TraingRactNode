# 01 — CI de base

Objectif : mettre en place un pipeline minimal qui tourne sur chaque PR, à enrichir progressivement de tests au fil des tâches suivantes, pour éviter les régressions.

## À faire

- [ ] Workflow GitHub Actions (`.github/workflows/ci.yml`) déclenché sur push et PR vers `main`
- [ ] Étape d'installation des dépendances (avec cache npm)
- [ ] Étape de lint (ESLint)
- [ ] Étape de build (`npm run build`) pour détecter les erreurs de compilation
- [ ] Étape de test (`npm test`) — même avec un test placeholder au départ, prête à accueillir les tests des tâches 02, 03, 04
- [ ] Une fois la CI stable : activer la protection de branche sur `main` (CI obligatoire avant merge)

## Definition of done

- Une PR ouverte déclenche automatiquement lint + build + test
- Le statut de la CI est visible sur la PR
- `main` est protégée : impossible de merger si la CI est rouge
