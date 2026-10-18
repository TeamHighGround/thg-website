# THG Website

Site officiel de **Team High Ground** - Association esport bretonne.

## Développement

```bash
npm install
npm start                 # http://localhost:4200 — nécessite l'API (thg-api) sur :4001
```

Lancement complet (base, API, site, panel) : [`docs/demarrage-local.md`](docs/demarrage-local.md).

## Déploiement

Le site est **auto-hébergé** et **rendu côté serveur** : le build produit un serveur Node
(`dist/thg-website/server/server.mjs`) lancé par le service systemd `thg-web` dans un
conteneur LXD, derrière le reverse proxy de la VM (HTTPS via Let's Encrypt).

Depuis **Git Bash**, à la racine du projet, après avoir committé et poussé :

```bash
./deploy.sh
```

Le script enchaîne : `ng build` → contrôle de la présence du bundle serveur → envoi →
arrêt de `thg-web`, remplacement de `/opt/thg/web`, redémarrage → vérification que le
HTML servi contient bien les données de l'API.

- `deploy.sh` n'est **pas versionné** (il contient l'hôte, le port et le chemin de clé
  SSH) : chaque poste le garde en local.
- Si `ng` est introuvable : `export PATH="$PWD/node_modules/.bin:$PATH"` avant le script.
- Si l'API a changé (nouvelle route, migration), déployer **`thg-api` d'abord**.
- Le site est indisponible quelques secondes pendant le redémarrage du service.

Exploitation, diagnostic et retour arrière : [`docs/production.md`](docs/production.md).

## Infrastructure

```
Internet ─▶ nginx VM (TLS/Let's Encrypt) ─▶ :7000 [proxy LXD] ─▶ nginx conteneur ─┬─▶ 127.0.0.1:4000  thg-web (site, rendu serveur)
                                                                                   ├─▶ 127.0.0.1:4001  thg-api (/api, /media)
                                                                                   ├─▶ /opt/thg/admin  panel (admin.teamhighground.fr)
                                                                                   └─▶ 127.0.0.1:3000  Umami (analytics)
```

Détails d'exploitation : [`docs/production.md`](docs/production.md).

- **Conteneur LXD** (Ubuntu) : accès SSH sur le port `2222`, forwards `7000-7010` vers le host.
- **nginx du conteneur** : écoute sur `7000` et route par nom de domaine (site, panel, Umami). Config versionnée dans [`deploy/nginx-thg.conf`](deploy/nginx-thg.conf) — à recopier dans le conteneur après modification.
- **nginx de la VM** : reverse proxy + HTTPS, géré par l'admin de la VM (hors de ce dépôt).
- **DNS (OVH)** : `teamhighground.fr`, `www`, `analytics` et `admin` en A vers `54.37.85.136`.

### Analytics (Umami)

Stats auto-hébergées, sans cookies, sur https://analytics.teamhighground.fr. Déployé via Docker Compose dans le conteneur ([`deploy/umami/`](deploy/umami/)). Le snippet de tracking est dans `src/index.html`.

### Mettre à jour la config nginx du conteneur

Après avoir modifié `deploy/nginx-thg.conf` :
```bash
scp -P 2222 -i "$HOME/.ssh/thg_server_val" deploy/nginx-thg.conf ubuntu@54.37.85.136:/tmp/nginx-thg.conf
ssh -p 2222 -i "$HOME/.ssh/thg_server_val" ubuntu@54.37.85.136 \
  "sudo mv /tmp/nginx-thg.conf /etc/nginx/sites-available/thg && sudo nginx -t && sudo systemctl reload nginx"
```

## Référencement

À faire une fois (déjà fait si la propriété existe), configurer **Google Search Console** :

1. Aller dans [Google Search Console](https://search.google.com/search-console)
2. Ajouter la propriété `teamhighground.fr`
3. Soumettre le sitemap : `Sitemaps > Ajouter > sitemap.xml`
4. Demander l'indexation des pages principales

## Tech Stack

- Angular 20, rendu serveur à chaque requête (SSR) et hydratation
- Contenu servi par l'API `thg-api` (Express + PostgreSQL), administré depuis le panel `thg-admin`
- Tailwind CSS 3 + PrimeNG 20
- Auto-hébergé : services Node `thg-web` / `thg-api` et nginx (conteneur LXD) + reverse proxy VM (HTTPS Let's Encrypt)
- Umami (analytics auto-hébergé, sans cookies)
- Transloco (i18n FR/EN)
