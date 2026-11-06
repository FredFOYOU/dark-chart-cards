# Contribuer

Les signalements de bugs et les propositions sont les bienvenus via les [issues](https://github.com/FredFOYOU/dark-chart-cards/issues).

## Démarrer

```bash
npm install
npm run dev
```

La galerie s'ouvre sur `http://localhost:5173`. Partez de la branche `fix/video-fidelity`.

## Règles du projet

- Un fichier par graphique dans `src/charts/`, avec ses données d'exemple dans `src/data/`.
- Couleurs uniquement via les tokens de `src/styles/tokens.css`.
- TypeScript strict, sans `any`.
- Pas de tooltip Recharts : l'information passe par l'en-tête et les tuiles.
- Respect de `prefers-reduced-motion`, voir `useFadeIn` et `useRechartsMotion`.

## Avant d'ouvrir une pull request

Lancez `npm run build`, qui inclut le typecheck, puis contrôlez le rendu dans le navigateur. Le modèle de pull request reprend la liste complète.

## Comportement

Restez respectueux et constructif dans tous les échanges. Les propos ou comportements hostiles ne sont pas acceptés et peuvent entraîner un blocage du dépôt.
