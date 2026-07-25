# Panel d'administration THG — plan détaillé

> Branche : `feat/admin-api` (créée depuis `main`)
> Objectif : remplacer toutes les données en dur du front par une API, avec un panel d'admin
> utilisable par n'importe qui dans l'asso. **Aucun déploiement serveur dans ce lot.**

## Décisions actées

| Sujet | Choix |
|---|---|
| Front | Une seule app Angular, section `/admin` lazy-loadée |
| Backend | **Express 5 + TypeScript**, projet séparé dans `api/` |
| ORM / base | Prisma + **PostgreSQL via Docker** |
| Rendu | Bascule `Prerender` → `Server` (SSR runtime) sur les pages dynamiques |
| Textes FR/EN | **En base**, éditables depuis l'admin (plus de clés Transloco pour le contenu) |
| Périmètre | Tout : rosters, timeline, ambassadeurs, partenaires, news, médias |

---

## 1. État des lieux — ce qui est en dur aujourd'hui

| Fichier | Contenu | Destination |
|---|---|---|
| `teams/lol/lol.ts` | 2 équipes (THG, THG Skol), 10 joueurs, 7 staff, logos, images de roster | `Team` + `TeamMember` |
| `teams/lol/lol.ts` | maps `getRoleIcon` / `getRoleColor` (10 rôles) | `Role` |
| `timeline/timeline.ts` | 2 chapitres, 12 jalons, images + dimensions, rosters, badges | `TimelineChapter` + `TimelineMilestone` |
| `ambassadors/ambassadors.ts` | 3 ambassadeurs, 2 images chacun, réseaux sociaux | `PartnerEntry` (kind=AMBASSADOR) |
| `partners/partners.ts` | 2 partenaires | `PartnerEntry` (kind=PARTNER) |
| `assets/i18n/{fr,en}.json` | textes de `contents.timeline.*`, `contents.ambassadors.list.*`, `contents.partners.list.*` | colonnes `*Fr` / `*En` en base |
| `assets/image/**` | ~30 images | table `Media` + dossier `uploads/` |

**Cas particuliers à connaître :**
- `news.ts` et `tft.ts` sont des composants **vides** : leurs pages sont du HTML statique. Créer le CMS
  news, c'est donc de la fonctionnalité nouvelle, pas de la migration.
- `ssbu.ts` embarque des tweets via `platform.twitter.com/widgets.js`. Le roster SSBU devient
  administrable, **l'embed Twitter reste statique**.
- La timeline stocke `width`/`height` à la main pour éviter le layout shift. En base, ces
  dimensions seront **déduites automatiquement de l'image uploadée** (via `sharp`) — un souci de
  moins pour l'utilisateur.

---

## 2. Arborescence cible

```
thg-website/
├── api/                              ← NOUVEAU
│   ├── src/
│   │   ├── index.ts                  bootstrap Express
│   │   ├── env.ts                    validation des variables d'env (zod)
│   │   ├── prisma.ts                 client singleton
│   │   ├── middleware/
│   │   │   ├── auth.ts               requireAuth / requireRole
│   │   │   ├── validate.ts           validation zod des body/params
│   │   │   ├── rateLimit.ts
│   │   │   └── error.ts              handler d'erreurs centralisé
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── teams.routes.ts
│   │   │   ├── timeline.routes.ts
│   │   │   ├── partners.routes.ts
│   │   │   ├── news.routes.ts
│   │   │   └── media.routes.ts
│   │   ├── schemas/                  DTO zod (partagés admin/public)
│   │   └── services/                 logique métier + réordonnancement
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── scripts/
│   │   ├── seed.ts                   importe les données actuelles
│   │   └── create-user.ts            création de compte en CLI
│   ├── uploads/                      images (gitignored)
│   ├── .env.example
│   └── package.json
├── docker-compose.dev.yml            ← NOUVEAU : Postgres local
├── proxy.conf.json                   ← NOUVEAU : /api et /media → :4001
└── src/app/
    ├── core/api/                     ← NOUVEAU : client HTTP + modèles
    └── component/admin/              ← NOUVEAU : le panel
```

---

## 3. Modèle de données (Prisma)

### Principe i18n
Chaque texte éditable devient **deux colonnes** (`titleFr` / `titleEn`) plutôt qu'une table de
traductions. C'est plus verbeux en base mais beaucoup plus simple à requêter et à afficher dans
un formulaire à deux onglets.

### Entités

```
User            id, email(unique), passwordHash, role(ADMIN|EDITOR), lastLoginAt
Session         table gérée par connect-pg-simple

Media           id, filename, originalName, mime, width, height, sizeBytes,
                altFr, altEn, createdAt, createdById
                ↳ width/height renseignés automatiquement par sharp

Role            id, key('Top'), labelFr, labelEn, iconPath, colorClass, order
                ↳ remplace les maps getRoleIcon/getRoleColor, éditable

Game            id, slug(lol|tft|ssbu), nameFr, nameEn, order, published
Team            id, gameId, key(league|tour), name, logoId→Media,
                rosterImageId→Media, order, published
TeamMember      id, teamId, name, roleId→Role, imageId→Media,
                type(PLAYER|STAFF), order,
                twitter, twitch, instagram, youtube, tiktok, lolpros, website

TimelineChapter    id, slug, titleFr/En, subtitleFr/En, order, published
TimelineMilestone  id, chapterId, slug, dateLabelFr/En, titleFr/En,
                   descriptionFr/En, resultFr/En, imageId→Media,
                   roster(String[]), hasBadge, order, published

PartnerEntry    id, kind(PARTNER|AMBASSADOR), name, descriptionFr/En,
                typesFr(String[]), typesEn(String[]), order, published,
                website, instagram, twitter, twitch, soundcloud, youtube, tiktok
PartnerImage    id, entryId, mediaId→Media, order   (galerie ordonnée)

NewsPost        id, slug(unique), titleFr/En, excerptFr/En, bodyFr/En(markdown),
                coverId→Media, status(DRAFT|PUBLISHED), publishedAt, authorId
```

**Champ `order` partout** → c'est lui que le drag & drop met à jour.
**Champ `published` partout** → permet de préparer un roster à l'avance sans le publier.

---

## 4. API Express

### Routes publiques (sans auth, lecture seule)
```
GET  /api/teams?game=lol           équipes + membres, triés, published only
GET  /api/timeline                 chapitres + jalons imbriqués
GET  /api/partners?kind=partner    partenaires ou ambassadeurs
GET  /api/news                     liste paginée des posts publiés
GET  /api/news/:slug
GET  /media/:filename              images (express.static en dev)
```
Toutes acceptent `?lang=fr|en` et renvoient les champs déjà résolus dans la bonne langue,
pour que les composants front n'aient pas à gérer les suffixes `Fr`/`En`.

### Routes d'authentification
```
POST /api/auth/login       { email, password } → pose le cookie de session
POST /api/auth/logout
GET  /api/auth/me          profil courant (sert au guard front)
```

### Routes d'administration (auth obligatoire)
```
GET|POST|PATCH|DELETE  /api/admin/teams        /api/admin/teams/:id
GET|POST|PATCH|DELETE  /api/admin/members      /api/admin/members/:id
GET|POST|PATCH|DELETE  /api/admin/roles
GET|POST|PATCH|DELETE  /api/admin/timeline/chapters
GET|POST|PATCH|DELETE  /api/admin/timeline/milestones
GET|POST|PATCH|DELETE  /api/admin/partners
GET|POST|PATCH|DELETE  /api/admin/news
GET|POST|DELETE        /api/admin/media
POST                   /api/admin/media/upload        (multipart)
PATCH                  /api/admin/<entité>/reorder    { ids: [...] }
```
`reorder` est un endpoint dédié : le drag & drop envoie le tableau d'ids dans le nouvel ordre,
le serveur réécrit les `order` dans une transaction. Une seule requête par déplacement.

### Dépendances
`express@5`, `@prisma/client`, `zod`, `argon2`, `express-session`, `connect-pg-simple`,
`helmet`, `cors`, `express-rate-limit`, `multer`, `sharp`, `file-type`, `dotenv`,
`tsx` (dev), `typescript`, `vitest`.

---

## 5. Sécurité

**Authentification**
- Mots de passe hashés en **argon2id** (paramètres par défaut de la lib, largement suffisants).
- Session par **cookie `httpOnly` + `Secure` + `SameSite=Strict`**, stockée en base
  (`connect-pg-simple`) — donc révocable et persistante aux redémarrages.
  Pas de JWT en `localStorage` : un XSS le volerait.
- **Aucune page d'inscription.** Les comptes se créent avec `npm run create-user` en SSH.
- `express-rate-limit` : 5 tentatives / 15 min / IP sur `/api/auth/login`, avec délai progressif.
- Message d'erreur de login **identique** que l'email existe ou non (pas d'énumération de comptes).
- Rotation de l'id de session à la connexion (anti session fixation).

**Autorisation**
- Middleware `requireAuth` sur tout `/api/admin/*`, en amont du routeur — impossible d'oublier
  une route.
- `requireRole('ADMIN')` en plus sur la gestion des comptes.
- Le guard Angular n'est **que du confort UX** : il évite d'afficher un écran vide, il ne protège
  rien. La seule barrière réelle est côté API.

**Entrées**
- Validation **zod** sur chaque body / query / param. Rejet strict des champs inconnus.
- Prisma paramètre toutes les requêtes → pas d'injection SQL.
- CORS restreint à l'origine du site (et `localhost:4200` en dev uniquement).
- `helmet` pour les en-têtes (`nosniff`, `X-Frame-Options`, CSP).

**Uploads — le point le plus sensible**
1. Limite de taille (10 Mo) et nombre de fichiers, appliquée par `multer` avant lecture.
2. Type vérifié par **magic bytes** (`file-type`), jamais par l'extension ni le `Content-Type`
   du client. Whitelist : jpeg, png, webp, avif.
3. **Ré-encodage systématique via `sharp`** → WebP. Ça détruit tout payload planqué dans les
   métadonnées EXIF et optimise le poids au passage.
4. Nom de fichier = UUID généré. Le nom d'origine est conservé en base pour l'affichage seulement.
5. Stockage **hors du webroot**, servi par une route dédiée avec `nosniff`. Aucune exécution
   possible dans ce dossier.
6. Dimensions extraites automatiquement → alimente `width`/`height` de la timeline.

**Divers**
- Variables d'env validées au démarrage (`env.ts`) : le serveur refuse de démarrer si
  `SESSION_SECRET` est absent ou trop court.
- `.env` gitignored, `.env.example` versionné.
- `/admin` en `noindex` + exclu du `sitemap.xml` + `Disallow` dans `robots.txt`.

---

## 6. Front — passage au SSR runtime

**a. Client API** (`src/app/core/api/`)
- `ApiService` typé, un modèle TS par entité.
- **URL de base variable selon le contexte** : côté serveur il faut une URL absolue
  (`http://localhost:4001`), côté navigateur une relative (`/api`). Géré par un `InjectionToken`
  `API_BASE_URL` fourni différemment dans `app.config.ts` et `app.config.server.ts`.
  *C'est le piège classique du SSR : oublier ça donne une erreur "Invalid URL" au prerender.*

**b. Éviter le double appel**
- `provideClientHydration(withHttpTransferCacheOptions({ includePostRequests: false }))`.
  Le JSON récupéré côté serveur est sérialisé dans le HTML et réutilisé à l'hydratation :
  le navigateur ne refait pas l'appel au premier chargement.

**c. `app.routes.server.ts`**
```
Prerender (inchangé) : contact, legal-notice, privacy-policy, cookie-settings, shop
Server (nouveau)     : '', about, teams/lol, teams/tft, teams/ssbu,
                       news, ambassadors, partners  (+ toutes les variantes /en)
Client               : admin/**, wildcard
```
> `''` (accueil) passe en Server parce que `home.html` inclut `<app-about>` et `<app-timeline>`.

**d. Composants**
- `lol.ts` : les 155 lignes de données en dur disparaissent, remplacées par un `resource()` /
  `toSignal()` sur `ApiService.getTeams('lol')`. `getRoleIcon`/`getRoleColor` lisent les données
  de `Role` renvoyées par l'API.
- Idem pour `timeline.ts`, `ambassadors.ts`, `partners.ts`.
- États de chargement et d'erreur à prévoir (en SSR ils ne s'affichent jamais, mais ils comptent
  pour la navigation interne).

**e. Images**
- Les chemins `assets/image/...` deviennent `/media/...`. Les fichiers actuels sont importés en
  base par le seed, donc **rien ne casse visuellement**.

**f. Transloco**
- Reste en place pour toute l'UI statique (titres de page, boutons, libellés, mentions légales).
- Les clés de **contenu** (`contents.timeline.chapters.*`, `contents.ambassadors.list.*`,
  `contents.partners.list.*`) sont supprimées des JSON une fois migrées en base.

---

## 7. Le panel d'admin — spécification UX

> Principe directeur : **quelqu'un qui n'est pas développeur doit s'en sortir seul.**
> Chaque champ a une explication d'une ligne, chaque action a un retour visuel immédiat.

### Composants transverses à construire

**`<app-image-drop>` — le champ image**
Le composant le plus important, réutilisé partout.
- **Glisser-déposer** un fichier depuis l'explorateur Windows sur la zone.
- **Clic sur la zone** → ouvre le sélecteur de fichiers Windows natif.
- **Coller** (Ctrl+V) une image depuis le presse-papier.
- Aperçu immédiat, barre de progression pendant l'envoi.
- Bouton *Remplacer* / *Supprimer* au survol.
- Sous la zone, une ligne d'aide contextuelle :
  *« Photo du joueur — carré, 500×500 px minimum. Fond transparent recommandé. »*
- Champ *Texte alternatif* optionnel, avec l'explication :
  *« Décrit l'image pour les personnes malvoyantes et pour Google. »*
- Erreurs en clair : *« Ce fichier fait 14 Mo, la limite est de 10 Mo. »* — jamais un code HTTP.

**`<app-sortable-list>` — le réordonnancement**
- Drag & drop via **Angular CDK** (`@angular/cdk/drag-drop`, à installer).
- Poignée de préhension visible (⠿) à gauche de chaque ligne — on ne devine pas qu'un élément
  est déplaçable, on le montre.
- Placeholder animé pendant le déplacement.
- Sauvegarde automatique au dépôt + toast *« Ordre enregistré »*. Pas de bouton à cliquer.
- Fonctionne au clavier (flèches) pour l'accessibilité.

**`<app-i18n-field>` — le champ bilingue**
- Deux onglets FR / EN sur le même champ, pas deux formulaires séparés.
- Pastille orange sur l'onglet EN s'il est vide : *« Traduction anglaise manquante »*.
- Bouton *Copier le français* pour démarrer une traduction.

**`<app-save-bar>` — la barre d'enregistrement**
- Barre collante en bas de l'écran, apparaît dès qu'un champ change.
- *« Modifications non enregistrées »* + boutons *Annuler* / *Enregistrer*.
- `CanDeactivate` guard : confirmation avant de quitter la page avec des changements en cours.

**Autres**
- Interrupteur **Visible sur le site** (brouillon / publié) sur chaque élément, avec l'explication
  *« Désactivé, cet élément n'apparaît pas sur le site public. »*
- Bouton **Voir sur le site** qui ouvre la page publique correspondante dans un onglet.
- Suppression toujours derrière une confirmation nommant l'élément :
  *« Supprimer le joueur Kitano ? Cette action est définitive. »*
- Toasts PrimeNG pour tous les retours (succès / erreur).

### Écrans

| Écran | Contenu |
|---|---|
| **Connexion** | Email + mot de passe. Message d'erreur unique et neutre. |
| **Accueil** | Grandes tuiles : *Rosters, Timeline, Partenaires, Ambassadeurs, Actualités, Médias*. Une phrase sous chacune expliquant ce qu'elle contient. |
| **Rosters** | Choix du jeu (LoL / TFT / SSBU) → liste des équipes → détail. Joueurs et staff en deux listes triables. Ajout d'un membre en modale : nom, rôle (liste déroulante), photo, réseaux sociaux. |
| **Timeline** | Chapitres triables, jalons triables à l'intérieur. Édition d'un jalon : date, titre, description (FR/EN), image, roster (saisie par tags), badge, résultat. |
| **Partenaires / Ambassadeurs** | Même écran, filtré par type. Galerie d'images multiples triable. Réseaux sociaux avec validation d'URL. |
| **Actualités** | Liste avec statut brouillon/publié. Éditeur markdown avec aperçu côte à côte, image de couverture, date de publication. |
| **Médiathèque** | Grille de vignettes, upload multiple par glisser-déposer, recherche, indication *« utilisée dans 3 endroits »* et blocage de la suppression si l'image est utilisée. |
| **Compte** | Changement de mot de passe. Gestion des utilisateurs réservée au rôle ADMIN. |

### Technique
- Route `/admin` **lazy-loadée** (`loadChildren`) → aucun impact sur le poids du bundle public.
- Layout dédié : pas de header/footer du site public, sidebar de navigation.
- `RenderMode.Client` + `<meta name="robots" content="noindex">`.
- Réutilise PrimeNG (déjà présent) : `Dialog`, `Toast`, `ConfirmDialog`, `Select`, `ToggleSwitch`,
  `Tabs`, `Chips`, `InputText`, `Textarea`.
- **Seule dépendance à ajouter : `@angular/cdk`** (pour le drag & drop).

---

## 8. Migration des données existantes

Script `api/scripts/seed.ts`, idempotent :
1. Crée les rôles LoL depuis les maps `getRoleIcon`/`getRoleColor`.
2. Copie `src/assets/image/**` vers `api/uploads/`, crée les entrées `Media` avec dimensions
   réelles lues par `sharp`.
3. Insère les 2 équipes LoL, 10 joueurs, 7 staff avec leurs réseaux sociaux.
4. Insère les 2 chapitres et 12 jalons de la timeline, en **fusionnant** les données de
   `timeline.ts` (images, rosters, badges) avec les textes de `fr.json` / `en.json`.
5. Insère les 3 ambassadeurs et 2 partenaires, textes tirés des JSON.
6. Crée un compte admin de développement (identifiants affichés dans la console).

**Critère de réussite : après le seed, le site doit être visuellement identique à `main`.**
C'est la vérification qui prouve que la migration n'a rien perdu.

---

## 9. Développement local

**`docker-compose.dev.yml`** — Postgres 16 sur le port **5433** (5432 est pris par Umami en prod,
autant prendre l'habitude tout de suite), volume nommé, healthcheck.

**Lancement (3 terminaux) :**
```bash
docker compose -f docker-compose.dev.yml up -d
cd api && npm install && npm run db:migrate && npm run seed && npm run dev   # :4001
npm start                                                                    # :4200
```

**`proxy.conf.json`** route `/api` et `/media` de `:4200` vers `:4001` — pas de CORS à gérer en dev,
et l'URL relative fonctionne exactement comme elle le fera en production.

### Checklist de recette
- [ ] `http://localhost:4200/teams/lol` affiche le roster identique à `main`
- [ ] **`view-source:` sur cette page contient « Kitano »** ← la preuve que le SSR fonctionne
- [ ] Onglet Réseau : aucun appel `/api/teams` au premier chargement (transfer cache actif)
- [ ] `/en/teams/lol` affiche bien les textes anglais
- [ ] `/admin` redirige vers la connexion si non authentifié
- [ ] `curl -X POST localhost:4001/api/admin/teams` sans cookie → **401**
- [ ] Glisser une image depuis l'explorateur Windows → aperçu puis envoi
- [ ] Renommer un joueur dans l'admin → visible après refresh de la page publique
- [ ] Réordonner un roster par drag & drop → ordre conservé après refresh
- [ ] Uploader un `.exe` renommé en `.png` → **rejeté**
- [ ] Timeline : aucun layout shift au chargement (dimensions bien transmises)

---

## 10. Découpage en lots

| Lot | Contenu | Testable à la fin |
|---|---|---|
| **1** | Docker + schéma Prisma + Express + auth + seed | `curl` sur `/api/teams` renvoie le roster |
| **2** | Upload/médias + endpoints CRUD complets | API complète testable au client HTTP |
| **3** | Front : `ApiService`, bascule SSR, migration des 4 composants | Site public identique, servi par l'API |
| **4** | Admin : layout, login, guards, composants transverses | Connexion + navigation dans le panel |
| **5** | Admin : écrans Rosters + Timeline | Édition complète des deux gros blocs |
| **6** | Admin : Partenaires, Ambassadeurs, News, Médiathèque | Panel complet |
| **7** | Nettoyage des JSON i18n, README, recette finale | Checklist ci-dessus verte |

---

## 11. Hors périmètre de ce lot

- **Tout déploiement** : `deploy.sh`, `nginx-thg.conf` et le serveur OVH ne sont pas touchés.
  Le passage en production (service systemd pour le SSR + l'API, `proxy_pass` nginx, Postgres
  de prod, sauvegardes `pg_dump`) fera l'objet d'un lot séparé.
- L'embed Twitter de la page SSBU reste statique.
- Les pages `contact`, `legal-notice`, `privacy-policy`, `shop` restent prérendues et statiques.
- Pas de CI/CD, pas de prévisualisation de brouillon sur le site public.

## 12. Points d'attention identifiés

1. **URL absolue en SSR** — la cause n°1 d'échec de ce type de migration. Traité par `API_BASE_URL`.
2. **Perte du prerender = dépendance à un process Node en prod.** Si l'API tombe, les pages
   dynamiques tombent aussi. Prévoir un cache court côté SSR et une page d'erreur propre.
3. **Le seed doit être rejouable** sans dupliquer les données (upsert sur des slugs stables).
4. **Suppression d'un média utilisé** — à bloquer côté API, sinon on casse le site public depuis
   la médiathèque sans s'en rendre compte.
5. **`published` par défaut à `false`** sur les créations : mieux vaut oublier de publier que
   publier un roster incomplet.
