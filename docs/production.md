# Production — architecture, exploitation, repli

Serveur : conteneur LXD `backend` sur `54.37.85.136`, accès `ssh ubuntu@54.37.85.136 -p 2222 -i ~/.ssh/thg_server_val`.

## Ce qui tourne

| Composant | Type | Écoute | Emplacement |
|---|---|---|---|
| `thg-web` | service systemd | 127.0.0.1:4000 | `/opt/thg/web` |
| `thg-api` | service systemd | 127.0.0.1:4001 | `/opt/thg/api` |
| `thg-db` | conteneur Docker | 127.0.0.1:5433 | `/opt/thg/postgres` |
| panel (thg-admin) | fichiers statiques | via nginx | `/opt/thg/admin` |
| nginx | service système | 7000 | `/etc/nginx/sites-available/thg` et `thg-admin` |

Le nginx de la VM termine le HTTPS et transmet vers le port 7000 du conteneur.

**Changement majeur par rapport à avant :** le site n'est plus statique. Trois
composants doivent tourner. Si `thg-api` tombe, les pages dynamiques affichent un
message dégradé mais **restent accessibles** ; si `thg-web` tombe, le site est
indisponible.

### Routage nginx

teamhighground.fr (`deploy/nginx-thg.conf`) :

```
/media/                  ──► thg-api   (images envoyées depuis le panel)
/api/admin/, /api/auth/  ──► 404       (le panel a son propre domaine)
/api/                    ──► thg-api
/admin…                  ──► 301 vers admin.teamhighground.fr…
/                        ──► thg-web   (rendu serveur Angular)
```

admin.teamhighground.fr (`thg-admin/deploy/nginx-admin.conf`) :

```
/media/  ──► thg-api
/api/    ──► thg-api   (session du panel, cookie limité à ce domaine)
/        ──► /opt/thg/admin (application statique, CSP stricte)
```

> Les blocs `/media/` et `/api/` utilisent `location ^~`. C'est **indispensable** :
> sans le `^~`, le bloc en expression régulière qui gère les extensions de
> fichiers (`.webp`, `.png`…) est évalué en premier et détourne `/media/xxx.webp`
> vers le rendu Angular au lieu de l'API. Toutes les images du site tombent.

> `client_max_body_size 12m` : l'API accepte des images jusqu'à 10 Mo. Sans cette
> ligne, nginx coupe à 1 Mo et les envois depuis le panel échouent en 413.

## Déployer

Depuis Git Bash, **après avoir committé et poussé** (les scripts envoient le dossier
local tel quel, sans vérifier git), et **dans cet ordre** — le site et le panel
appellent les routes de l'API :

```bash
# 1. L'API : sauvegarde la base, applique les migrations, redémarre thg-api
cd thg-api && ./deploy.sh

# 2. Le site : build SSR, remplace /opt/thg/web, redémarre thg-web
cd thg-website && ./deploy.sh

# 3. Le panel : tests, build, bascule atomique de /opt/thg/admin (Node 24.15+ requis)
cd thg-admin && ./deploy.sh
```

Les trois scripts vérifient le résultat et sortent en erreur en cas de problème :

- API : `/api/admin/teams` doit répondre **404** sur teamhighground.fr (routes absentes
  du site public) et **401** sur admin.teamhighground.fr (fermées sans session).
- Site : refuse de partir si le bundle serveur est absent — sans lui, le site serait
  publié sans rendu serveur — puis vérifie que le HTML servi contient les données.
  Le site est coupé quelques secondes pendant le redémarrage, sans retour arrière
  automatique.
- Panel : la version précédente est gardée dans `/opt/thg/admin.prev` (retour arrière :
  voir le README de `thg-admin`).

Les messages `tar: … time stamp … in the future` sont sans gravité (léger décalage
d'horloge entre le poste et le serveur).

**Ni le `.env` du serveur, ni le dossier `uploads/`, ni la base ne sont touchés
par un déploiement.**

## Comptes d'administration

Aucune page d'inscription. Création en SSH :

```bash
cd /opt/thg/api
node_modules/.bin/tsx scripts/create-user.ts \
  --email=prenom@teamhighground.fr --role=ADMIN
```

Le mot de passe est demandé au clavier (jamais en argument : il finirait dans
l'historique du shell et dans la liste des processus). Minimum 12 caractères.

Rôles : `ADMIN` (tout, dont la gestion des comptes) et `EDITOR` (contenu seul).

## Sauvegardes

Timer systemd `thg-sauvegarde.timer`, tous les jours à 3h20 UTC.

- base : `~/backups/db/thg-*.sql.gz`, conservée 14 jours
- médias : `~/backups/uploads/uploads-*.tgz`, conservés 7 jours

Le déploiement de l'API fait en plus une sauvegarde **avant chaque migration** :
`~/backups/db/avant-deploiement-AAAAMMJJ-HHMMSS.sql` (non compressée). Celles-ci ne
sont **pas** concernées par la rotation : à supprimer à la main de temps en temps
(quelques centaines de Ko chacune en octobre 2026).

```bash
systemctl list-timers thg-sauvegarde.timer   # prochaine exécution
sudo systemctl start thg-sauvegarde.service  # sauvegarde immédiate
cat ~/backups/journal.log
```

### Restaurer une sauvegarde

```bash
gunzip -c ~/backups/db/thg-AAAAMMJJ-HHMMSS.sql.gz > /tmp/restauration.sql
docker exec thg-db psql -U thg -d thg -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
docker exec -i thg-db psql -U thg -d thg < /tmp/restauration.sql
sudo systemctl restart thg-api
```

## Diagnostic

```bash
systemctl status thg-web thg-api
sudo journalctl -u thg-api -n 50 --no-pager
sudo journalctl -u thg-web -n 50 --no-pager
docker ps --filter name=thg-db

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4000/          # SSR
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4001/api/timeline  # API
```

**Le contrôle qui compte le plus** — il prouve que le rendu serveur fonctionne :

```bash
curl -s https://teamhighground.fr/teams/lol | grep -c Kitano
```

Doit renvoyer un nombre supérieur à 0. Si c'est 0 alors que la page s'affiche
normalement dans un navigateur, le contenu n'est plus visible des moteurs de
recherche ni des aperçus de lien Discord ou X : c'est une régression grave, même
si rien ne semble cassé à l'œil.

---

## REPLI — revenir au site statique

Le site statique d'avant la migration est conservé, ainsi que l'ancienne config
nginx. Le chemin exact de la sauvegarde est dans `~/.thg-derniere-sauvegarde`.

```bash
B=$(cat ~/.thg-derniere-sauvegarde)

# 1. Rendre la main à l'ancien site
sudo rm -rf /var/www/thg-website
sudo cp -a "$B/site-statique" /var/www/thg-website
sudo chmod -R a+rX /var/www/thg-website

# 2. Restaurer la configuration nginx d'origine
sudo cp "$B/nginx-sites-available/thg" /etc/nginx/sites-available/thg
sudo nginx -t && sudo systemctl reload nginx

# 3. Arrêter les nouveaux services
sudo systemctl stop thg-web thg-api
```

Le site redevient exactement ce qu'il était : des fichiers statiques servis par
nginx, sans dépendance à Node ni à PostgreSQL. **La base et les médias ne sont pas
supprimés** — un retour en avant reste possible avec `sudo systemctl start
thg-api thg-web` et la config nginx actuelle.

---

## Restes sur le serveur

Constatés en octobre 2026, laissés en place faute d'usage connu — à vérifier avant de
supprimer :

- `/opt/thg/web.bak-20260903` : ancienne copie du site rendu serveur ;
- `/opt/thg/thg-dump.sql` et `/opt/thg/uploads.tgz` : export de la base et des médias de
  la mise en service initiale ;
- `/var/www/thg-website` et `~/backups/thg-20260725-155150/` : **utilisés par la
  procédure de repli ci-dessus**, à conserver tant qu'un retour au site statique doit
  rester possible.
