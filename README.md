# THG Website

Site officiel de **Team High Ground** - Association esport bretonne.

## Development

```bash
npm install               # Install dependencies
npm start                 # Start dev server (http://localhost:4200)
```

## Build & Deploy

Le site est **auto-hébergé** : build statique prérendu (SSR/prerender) servi par nginx dans un conteneur LXD, derrière le reverse proxy de la VM (HTTPS via Let's Encrypt).

### Déploiement en une commande

Depuis **Git Bash**, à la racine du projet :

```bash
./deploy.sh
```

Le script enchaîne : `ng build` → envoi du build vers le conteneur → mise en place dans `/var/www/thg-website` + permissions → nettoyage.

> `deploy.sh` n'est **pas versionné** (il contient l'hôte, le port et le chemin de clé SSH). Chaque poste le garde en local. Voir la structure attendue plus bas.

### Déploiement manuel (sans le script)

```bash
ng build
scp -P 2222 -i "$HOME/.ssh/thg_server_val" -r dist/thg-website/browser ubuntu@54.37.85.136:/tmp/thg-build
ssh -p 2222 -i "$HOME/.ssh/thg_server_val" ubuntu@54.37.85.136 \
  "rm -rf /var/www/thg-website/* && cp -r /tmp/thg-build/* /var/www/thg-website/ && \
   chmod -R a+rX /var/www/thg-website && rm -rf /tmp/thg-build"
```

Le `chmod -R a+rX` est nécessaire (sinon nginx renvoie `403`, ne pouvant pas lire les fichiers).

### Vérifier après déploiement

```bash
ssh -p 2222 -i "$HOME/.ssh/thg_server_val" ubuntu@54.37.85.136 "curl -I http://127.0.0.1:7000"  # 200 attendu
```
Puis ouvrir https://teamhighground.fr.

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

## Post-Deployment

Après le premier déploiement, configurer **Google Search Console** :

1. Aller dans [Google Search Console](https://search.google.com/search-console)
2. Ajouter la propriété `teamhighground.fr`
3. Soumettre le sitemap : `Sitemaps > Ajouter > sitemap.xml`
4. Demander l'indexation des pages principales

## Tech Stack

- Angular 20 + SSR/Prerendering
- Tailwind CSS + PrimeNG
- Auto-hébergé : nginx (conteneur LXD) + reverse proxy VM (HTTPS Let's Encrypt)
- Umami (analytics auto-hébergé, sans cookies)
- Transloco (i18n FR/EN)
