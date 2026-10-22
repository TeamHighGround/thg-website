# THG Website

Site officiel de **Team High Ground** - Association esport bretonne.

## Développement

```bash
npm install
npm start                 # http://localhost:4200 — nécessite l'API (thg-api) sur :4001
```

Lancement complet (base, API, site, panel) : [`docs/demarrage-local.md`](docs/demarrage-local.md).

## Déploiement

**Automatique à chaque push sur `main`** (`.github/workflows/ci-cd.yml`) : build, puis
image Docker (`Dockerfile`) envoyée au serveur, où le conteneur `thg-web` est remplacé
(image précédente remise s'il ne devient pas sain), puis vérification que le HTML servi
contient bien les données de l'API.

Si l'API a changé (nouvelle route, migration), pousser **`thg-api` d'abord**.

Tester l'image en local : `docker build -t thg-web:test .`

## Infrastructure

Serveur, nginx, Docker Compose, Umami, sauvegardes et exploitation : dépôt
**`TeamHighGround/thg-infra`**.

- **DNS (OVH)** : `teamhighground.fr`, `www`, `analytics` et `admin` en A vers l'adresse du serveur (voir `thg-infra`).
- **Analytics** : Umami, auto-hébergé et sans cookies, sur https://analytics.teamhighground.fr.
  Le snippet de suivi est dans `src/index.html`.

## Référencement

À faire une fois (déjà fait si la propriété existe), configurer **Google Search Console** :

1. Aller dans [Google Search Console](https://search.google.com/search-console)
2. Ajouter la propriété `teamhighground.fr`
3. Soumettre le sitemap : `Sitemaps > Ajouter > sitemap.xml`
4. Demander l'indexation des pages principales

## Tech Stack

- Angular 22, rendu serveur à chaque requête (SSR) et hydratation
- Contenu servi par l'API `thg-api` (Express + PostgreSQL), administré depuis le panel `thg-admin`
- Tailwind CSS 4, PrimeIcons, Angular CDK (menu Équipes)
- Auto-hébergé : conteneurs Docker (`thg-web`, `thg-api`, `thg-admin`, Umami) derrière nginx, dans un conteneur LXD + reverse proxy VM (HTTPS Let's Encrypt) — voir `thg-infra`
- Umami (analytics auto-hébergé, sans cookies)
- Transloco (i18n FR/EN)
