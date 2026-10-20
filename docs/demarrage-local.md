# Démarrage local — site + API + panel d'administration

Le projet se compose de **trois dépôts** et d'**une base de données** :

| Composant | Dépôt | Port |
|---|---|---|
| Site Angular (SSR) | `thg-website` | 4200 |
| Panel d'administration | `thg-admin` | 4300 |
| API Express | `thg-api` | 4001 |
| PostgreSQL (Docker) | conteneur `thg-postgres-dev` | 5433 |

En développement, le `proxy.conf.json` du site comme celui du panel renvoient `/api`
et `/media` vers 4001.

Le panel exige **Node 24.15 ou plus** (Angular 22) : voir le README de `thg-admin`.
Sur ce poste, le Node global est plus ancien ; un Node 24.15+ (par exemple celui d'une version installée par nvm)
s'utilise en le plaçant en tête du PATH, sans `nvm use`.

> **Raccourci** : le `.claude/launch.json` du dossier qui contient les trois dépôts
> déclare les trois serveurs (`thg-api`, `thg-website`, `thg-admin`). Il reste à
> démarrer Docker et la base (`npm run db:up` dans `thg-api`).

---

## Première installation

### 1. Docker

Docker Desktop doit tourner. **Attention** : après son installation, `docker` n'est
pas disponible tant que le terminal n'a pas été rouvert. Si tu obtiens
« docker : terme non reconnu », ferme et rouvre ton terminal.

Vérification :
```bash
docker --version
```

### 2. L'API

```bash
cd thg-api
npm install
cp .env.example .env      # puis ouvre .env (voir ci-dessous)
```

Dans `.env`, la seule variable à renseigner impérativement est `SESSION_SECRET` :
une chaîne aléatoire d'**au moins 32 caractères**. Le serveur refuse de démarrer
sinon — c'est volontaire. Pour en générer une :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Puis :
```bash
npm run db:up        # lance PostgreSQL dans Docker
npm run db:migrate   # crée les tables
npm run seed         # importe les rosters, la timeline, les partenaires, les images
```

Les postes de la page « Nous rejoindre » ne viennent pas du seed : ils sont insérés
par leur migration (`20261018120000_postes_ouverts`), en brouillon.

Le seed affiche **une seule fois** le mot de passe du compte administrateur créé
(`admin@thg.local`). Note-le. Si tu le perds, crée-toi un autre compte :

```bash
npm run create-user -- --email=ton.prenom@thg.fr --role=ADMIN
```
Le mot de passe est demandé au clavier, jamais passé en argument (il finirait dans
l'historique du shell et dans la liste des processus).

### 3. Le site et le panel

```bash
cd thg-website
npm install

cd thg-admin
npm install          # avec Node 24.15+ en tête du PATH
```

---

## Utilisation quotidienne

Docker Desktop lancé, puis trois terminaux :

```bash
# Terminal 1 — API
cd thg-api
npm run db:up
npm run dev

# Terminal 2 — site
cd thg-website
npm start

# Terminal 3 — panel (Node 24.15+ en tête du PATH)
cd thg-admin
npm start
```

- Site public : http://localhost:4200
- Panel d'administration : http://localhost:4300

---

## Vérifier que tout marche

**Le SSR fonctionne** — le test le plus important. Le HTML *brut* doit contenir les
données, pas seulement le DOM une fois le JavaScript exécuté :
```bash
curl -s http://localhost:4200/teams/lol | grep -c Kitano
```
Doit renvoyer un nombre supérieur à 0. Si c'est 0, le contenu n'est plus visible
des moteurs de recherche ni des aperçus de lien Discord/X — c'est une régression
grave, même si la page s'affiche correctement dans le navigateur.

**Les routes d'administration sont fermées** :
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4001/api/admin/teams
```
Doit renvoyer `401`.

**L'API renvoie bien le roster** :
```bash
curl -s "http://localhost:4001/api/teams?game=lol&lang=fr"
```

---

## Commandes utiles de l'API

| Commande | Effet |
|---|---|
| `npm run db:up` / `db:down` | démarre / arrête PostgreSQL |
| `npm run db:migrate` | applique les migrations |
| `npm run db:studio` | ouvre Prisma Studio (exploration visuelle de la base) |
| `npm run seed` | réimporte les données de départ (idempotent, rejouable) |
| `npm run create-user` | crée un compte d'administration |
| `npm test` | lance les tests (base de test dédiée, créée automatiquement) |

---

## Problèmes courants

**« docker : terme non reconnu »** → rouvre le terminal après l'installation de
Docker Desktop.

**`failed to connect to the docker API … dockerDesktopLinuxEngine`** → Docker Desktop
n'est pas lancé. Le démarrer et attendre que `docker ps` réponde.

**Le panel refuse de démarrer (version de Node)** → Angular 22 exige Node 24.15+ :
mettre un Node 24.15+ en tête du PATH.

**Le port 4001 ou 4200 est déjà pris** → un serveur d'une session précédente tourne
encore. Sous Windows :
```powershell
Get-NetTCPConnection -LocalPort 4001 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

**« Trop de tentatives de connexion »** → le rate-limit s'est déclenché (5 échecs).
Il se réinitialise au bout de 15 minutes, ou immédiatement en redémarrant l'API
(le compteur est en mémoire).

**Le site affiche « contenu momentanément indisponible »** → l'API n'est pas
démarrée. C'est le comportement voulu : le site se dégrade proprement au lieu de
s'effondrer. Lance `npm run dev` côté API.

**Le seed échoue sur des clés i18n manquantes** → normal, et prévu : les textes de
contenu ont été retirés de `src/assets/i18n/` puisqu'ils vivent maintenant en base.
Le seed retombe automatiquement sur l'instantané versionné dans
`scripts/i18n-snapshot.json`.
