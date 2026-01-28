# Convergence — Quelque chose qui…

Jeu de déduction sémantique pour soirées. Fais deviner une **règle** (ex. « Quelque chose qui pique ») à ton équipe en utilisant 8 mots indices. Moins tu révèles de mots, plus tu marques de points.

## Démarrer

```bash
cd ~/Desktop/Convergence
npm install
npm run dev
```

Ouvre **http://localhost:3000**, puis **Lancer une partie**.

## Structure de l’app

| Page | Route | Rôle |
|------|--------|------|
| Accueil | `/` | Titre, sous-titre, « Lancer une partie », lien Règles |
| Configuration | `/config` | Équipes (2–4), noms, nombre de tours → « Commencer le match » |
| Jeu | `/game` | Chrono 2 min, carte, 8 mots, Révéler / Trouvé / Passer, fin de tour, classement |
| Règles | `/regles` | Explication du jeu |

## Données

Les cartes sont dans `data/cartes.json`. Format :

```json
[
  { "id": 1, "regle": "Quelque chose qui pique", "mots": ["Ironie", "Jalousie", "Ortie", …] }
]
```

5 exemples sont fournis. Tu peux en ajouter pour étendre le deck.

## Commandes

| Commande | Rôle |
|----------|------|
| `npm run dev` | Lancer en local avec rechargement |
| `npm run build` | Build production |
| `npm run start` | Lancer en mode production |

## Stack

- **Next.js 15** (App Router), **React**, **Tailwind CSS**
- Design sombre, boutons larges pour mobile, accent jaune pour les mots révélés
