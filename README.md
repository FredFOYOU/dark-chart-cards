# dark-chart-cards

[![CI](https://github.com/FredFOYOU/dark-chart-cards/actions/workflows/ci.yml/badge.svg?branch=fix%2Fvideo-fidelity)](https://github.com/FredFOYOU/dark-chart-cards/actions/workflows/ci.yml)
[![Déploiement](https://github.com/FredFOYOU/dark-chart-cards/actions/workflows/pages.yml/badge.svg?branch=fix%2Fvideo-fidelity)](https://github.com/FredFOYOU/dark-chart-cards/actions/workflows/pages.yml)
[![Démo](https://img.shields.io/badge/d%C3%A9mo-Vercel-9de300?logo=vercel&logoColor=white)](https://dark-chart-cards.vercel.app/)
[![Release](https://img.shields.io/github/v/release/FredFOYOU/dark-chart-cards)](https://github.com/FredFOYOU/dark-chart-cards/releases)
[![Licence MIT](https://img.shields.io/github/license/FredFOYOU/dark-chart-cards)](LICENSE)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-3-22B5BF)](https://recharts.org)
[![Motion](https://img.shields.io/badge/Motion-14-111111?logo=framer&logoColor=white)](https://motion.dev)

[![Dernier commit](https://img.shields.io/github/last-commit/FredFOYOU/dark-chart-cards/fix%2Fvideo-fidelity)](https://github.com/FredFOYOU/dark-chart-cards/commits/fix/video-fidelity)
[![Taille du dépôt](https://img.shields.io/github/repo-size/FredFOYOU/dark-chart-cards)](https://github.com/FredFOYOU/dark-chart-cards)
[![Issues](https://img.shields.io/github/issues/FredFOYOU/dark-chart-cards)](https://github.com/FredFOYOU/dark-chart-cards/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/FredFOYOU/dark-chart-cards)](https://github.com/FredFOYOU/dark-chart-cards/pulls)
[![Étoiles](https://img.shields.io/github/stars/FredFOYOU/dark-chart-cards?style=flat)](https://github.com/FredFOYOU/dark-chart-cards/stargazers)
[![Forks](https://img.shields.io/github/forks/FredFOYOU/dark-chart-cards?style=flat)](https://github.com/FredFOYOU/dark-chart-cards/forks)

Reproduction d'une galerie de 10 cartes de graphiques en thème sombre, avec survol synchronisé, compteurs animés et changement de période.

**[Voir la démo en ligne](https://dark-chart-cards.vercel.app/)** · [Miroir GitHub Pages](https://fredfoyou.github.io/dark-chart-cards/)

<a href="https://dark-chart-cards.vercel.app/"><img src="docs/screenshots/page-desktop.png" alt="Galerie complète sur bureau" width="720"></a>

## Fonctionnalités

- **10 cartes :** Funnel, Earnings, Radar, Radar comparison, Sankey, Stage bars, Radial, Speedometer, Area et Combo.
- **Focus synchronisé :** survoler un élément met à jour le chiffre, le libellé et la tuile correspondante.
- **Animations :** compteurs, changement de période et graphiques qui s'animent en arrivant à l'écran. Elles se coupent avec `prefers-reduced-motion`.
- **Personnalisation :** toutes les couleurs passent par des variables CSS dans [`tokens.css`](src/styles/tokens.css).
- **Responsive :** une colonne sur mobile, et des tuiles qui s'adaptent à la largeur de la carte.

## Démarrer

Prérequis : Node.js 24 (la version utilisée par la CI).

```bash
git clone https://github.com/FredFOYOU/dark-chart-cards.git
cd dark-chart-cards
npm install
npm run dev
```

La galerie s'ouvre sur `http://localhost:5173`.

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run typecheck` | Vérifie les types |
| `npm run build` | Vérifie les types et crée le site dans `dist/` |
| `npm run preview` | Sert le site construit |

## Structure

```text
src/
├── charts/       Un fichier par graphique
├── components/   ChartCard, compteur animé, sélecteurs de période, composants UI
├── data/         Données d'exemple, avec trois jeux par période
├── hooks/        Animations et mesures
├── lib/          Formats, couleurs et utilitaires SVG
└── styles/       Tokens de design et CSS global
```

## Utiliser une carte

Chaque fichier de `src/charts/` exporte une carte prête à l'emploi :

```tsx
import { FunnelCard } from "@/charts/FunnelChart";

export function Dashboard() {
  return <FunnelCard variant="sharp" />;
}
```

Pour changer de couleurs, modifiez les tokens :

```css
:root {
  --chart-1: #9de300;
  --card-inner: #161616;
}
```

## Limites connues

- Thème sombre uniquement.
- Données fictives, incluses dans `src/data/`. Les cartes ne les reçoivent pas encore en props.
- Earnings, Radar, Stage bars, Sankey, Area et Combo ne s'explorent pas au clavier. Le survol n'est pas prévu pour le tactile.
- Les boutons de la page de démonstration ne mènent à aucun service.

## Captures

### Mobile

<img src="docs/screenshots/page-mobile.png" alt="Galerie complète sur mobile" width="240">

### Cartes

| Carte | Au repos | Au survol |
|---|---|---|
| Funnel | ![Funnel au repos](docs/screenshots/funnel.png) | ![Funnel au survol](docs/screenshots/funnel-hover.png) |
| Earnings | ![Earnings au repos](docs/screenshots/earnings.png) | ![Earnings au survol](docs/screenshots/earnings-hover.png) |
| Radar | ![Radar au repos](docs/screenshots/radar.png) | ![Radar au survol](docs/screenshots/radar-hover.png) |
| Radar comparison | ![Radar comparison au repos](docs/screenshots/radar-comparison.png) | ![Radar comparison au survol](docs/screenshots/radar-comparison-hover.png) |
| Sankey | ![Sankey au repos](docs/screenshots/sankey.png) | ![Sankey au survol](docs/screenshots/sankey-hover.png) |
| Stage bars | ![Stage bars au repos](docs/screenshots/stage-bars.png) | ![Stage bars au survol](docs/screenshots/stage-bars-hover.png) |
| Radial | ![Radial au repos](docs/screenshots/radial.png) | ![Radial au survol](docs/screenshots/radial-hover.png) |
| Speedometer | ![Speedometer au repos](docs/screenshots/speedometer.png) | ![Speedometer au survol](docs/screenshots/speedometer-hover.png) |
| Area | ![Area au repos](docs/screenshots/area.png) | ![Area au survol](docs/screenshots/area-hover.png) |
| Combo | ![Combo au repos](docs/screenshots/combo.png) | ![Combo au survol](docs/screenshots/combo-hover.png) |

## Branches

- `fix/video-fidelity` (par défaut) : la version alignée sur la vidéo de référence.
- `master` : la version construite d'après le brief écrit, conservée pour comparaison.

## Contribuer

Consultez [CONTRIBUTING.md](CONTRIBUTING.md). Pour signaler une faille, consultez [SECURITY.md](SECURITY.md).

## Licence

Le code est distribué sous licence [MIT](LICENSE).

Ce projet est une reproduction et n'est affilié à aucun produit existant. La licence ne couvre que le code de ce dépôt, ni le design ni les marques du produit d'origine, qui restent à leurs titulaires.
