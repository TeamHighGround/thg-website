# Contrat d'API THG — source de vérité

> Ce fichier fait foi pour **tous** les chantiers (API, front public, panel admin).
> Aucun agent ne modifie ce contrat sans le signaler. Toute divergence est un bug.

## Topologie

| Élément | Emplacement / port |
|---|---|
| API Express | `thg-api` — port **4001** |
| Front Angular | `thg-website` — port **4200** |
| PostgreSQL (Docker) | port **5433** (5432 est réservé à Umami) |
| Images servies sur | `/media/<filename>` |

En dev, `proxy.conf.json` renvoie `/api` et `/media` de `:4200` vers `:4001`.

---

## Conventions générales

- Toutes les réponses sont en JSON, encodage UTF-8.
- Les routes **publiques** acceptent `?lang=fr|en` (défaut `fr`) et renvoient les textes
  **déjà résolus** dans cette langue. Le front n'a jamais à gérer les suffixes `Fr`/`En`.
- Les routes **admin** renvoient les champs bruts bilingues (`titleFr`, `titleEn`, …).
- Les identifiants sont des `uuid` (string).
- Les routes publiques ne renvoient que les éléments `published: true`, triés par `order` croissant.
- Les clés de `socialLinks` / `socialMedia` valant `null` sont **omises** de la réponse
  (compatible avec l'interface `SocialLinks` existante du front).

### Objet `Media` (partout identique)

```json
{ "id": "uuid", "url": "/media/a1b2c3.webp", "width": 1080, "height": 1350, "alt": "" }
```
`alt` est résolu selon `lang`. Un champ média absent vaut `null`, jamais `undefined`.

### Format d'erreur (toutes les routes)

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Le nom est obligatoire.",
             "details": [{ "field": "name", "message": "obligatoire" }] } }
```
`message` est **en français et lisible par un humain** — il est affiché tel quel dans le panel.

Codes HTTP : `400` validation · `401` non authentifié · `403` rôle insuffisant · `404` introuvable
· `409` conflit (slug déjà pris, média utilisé) · `413` fichier trop lourd · `415` type non autorisé
· `429` trop de tentatives · `500` erreur serveur.

---

## Routes publiques

### `GET /api/teams?game=lol&lang=fr`

```json
{
  "game": { "slug": "lol", "name": "League of Legends" },
  "roles": [
    { "key": "Top", "label": "Top",
      "iconPath": "assets/logo/lol-icons/top.svg", "colorClass": "bg-blue-500" }
  ],
  "teams": [
    {
      "id": "uuid", "key": "league", "name": "THG",
      "description": "League Of Legends est le jeu historique…",
      "logo": { "...Media" },
      "rosterImage": { "...Media" },
      "players": [
        { "id": "uuid", "name": "Kitano", "role": "Top",
          "image": { "...Media" },
          "socialLinks": { "twitter": "https://x.com/Kitano_LoL",
                           "lolpros": "https://lolpros.gg/player/kitano" } }
      ],
      "staff": [
        { "id": "uuid", "name": "Zarrix", "role": "Head Coach", "image": null,
          "socialLinks": { "twitter": "https://x.com/Zarrix_LoL" } }
      ]
    }
  ]
}
```
`roles` est renvoyé au niveau racine : il remplace les maps `getRoleIcon` / `getRoleColor`
aujourd'hui codées en dur dans `lol.ts`.

### `GET /api/timeline?lang=fr`

```json
{
  "chapters": [
    { "id": "uuid", "slug": "competitive", "title": "Parcours compétitif", "subtitle": null,
      "milestones": [
        { "id": "uuid", "slug": "b12",
          "dateLabel": "Janvier 2026", "title": "…", "description": "…",
          "result": null,
          "image": { "...Media" },
          "roster": ["Kitano", "Infinity", "Scimmia", "Tebox", "Metha"],
          "hasBadge": true }
      ] }
  ]
}
```
> `hasResult` disparaît : `result` non-`null` remplit le même rôle.
> `width`/`height` viennent de l'objet `Media` (déduits à l'upload) — le front continue de les
> utiliser pour réserver l'espace et éviter le layout shift.

### `GET /api/partners?kind=partner|ambassador&lang=fr`

```json
{
  "entries": [
    { "id": "uuid", "name": "EZZA", "types": ["Streameuse", "Créatrice de contenu"],
      "description": "…",
      "images": [ { "...Media" }, { "...Media" } ],
      "socialMedia": { "instagram": "…", "twitter": "…", "twitch": "…" } }
  ]
}
```
Correspond à l'interface `Partner` existante (`src/app/component/contents/partner-card/`),
au champ `id` près qui devient un `uuid` string.

### `GET /api/news?lang=fr&page=1&pageSize=10`

```json
{ "items": [ { "id": "uuid", "slug": "…", "title": "…", "excerpt": "…",
               "cover": { "...Media" }, "publishedAt": "2026-07-01T10:00:00.000Z" } ],
  "page": 1, "pageSize": 10, "total": 12 }
```

### `GET /api/news/:slug?lang=fr`
Idem + `"body"` (markdown brut, le front le rend). `404` si absent ou non publié.

### `GET /api/settings`
Réglages globaux du site, sans paramètre de langue. Les réseaux non renseignés sont
**omis** (même règle que les autres blocs de réseaux sociaux).

```json
{ "socialLinks": { "twitter": "https://x.com/teamhigh_ground",
                   "instagram": "https://www.instagram.com/team_high_ground_/",
                   "discord": "https://discord.gg/teamhighground" } }
```

Consommé par le footer (toutes les pages), la page contact et le JSON-LD `sameAs`.

---

## Authentification

| Route | Corps | Réponse |
|---|---|---|
| `POST /api/auth/login` | `{ "email": "...", "password": "..." }` | `200 { "user": { "id", "email", "role" } }` + cookie `thg_sid` |
| `POST /api/auth/logout` | — | `204` |
| `GET /api/auth/me` | — | `200 { "user": {...} }` ou `401` |

- Cookie `thg_sid` : `httpOnly`, `sameSite=strict`, `secure` en production, durée 7 jours.
- Échec de login → **toujours** `401` avec le même message, que l'email existe ou non :
  *« Email ou mot de passe incorrect. »*
- `429` après 5 tentatives en 15 minutes depuis la même IP.

---

## Routes d'administration

Toutes sous `/api/admin/*`, toutes protégées par `requireAuth`. Rôles : `ADMIN`, `EDITOR`
(`EDITOR` peut tout éditer sauf la gestion des utilisateurs).

### Schéma CRUD standard
Pour chaque ressource `<res>` ci-dessous :

```
GET    /api/admin/<res>            liste complète (publiés ET brouillons), champs bruts
                                   → TOUJOURS enveloppée : { "items": [ … ] }
GET    /api/admin/<res>/:id        détail (objet nu, sans enveloppe)
POST   /api/admin/<res>            création  → 201 + objet créé
PATCH  /api/admin/<res>/:id        mise à jour partielle → 200 + objet
DELETE /api/admin/<res>/:id        → 204
PATCH  /api/admin/<res>/reorder    { "ids": ["uuid", "uuid", …] } → 204
```

Ressources : `games`, `teams`, `members`, `roles`, `timeline/chapters`, `timeline/milestones`,
`partners`, `news`, `users` (ADMIN uniquement).

> `games` a été ajouté après coup : une équipe ne peut pas être créée sans `gameId`,
> le CRUD des jeux était donc indispensable.

- `POST` et `PATCH` acceptent les champs bruts bilingues.
- `published` vaut **`false` par défaut** à la création.
- `reorder` réécrit les `order` dans une transaction ; les ids doivent tous appartenir au même
  parent, sinon `400`.

### Réglages du site

Ressource à ligne unique (table `site_settings`, `id = 1`, créée par la migration) :
pas de liste, pas de création, pas de suppression.

| Route | Détail |
|---|---|
| `GET /api/admin/settings` | `{ "id": 1, "twitter", "instagram", "discord", "updatedAt" }` — champs nuls inclus |
| `PATCH /api/admin/settings` | mise à jour partielle de `twitter` / `instagram` / `discord` ; `""` ou `null` efface le lien |

Accessible aux rôles `ADMIN` et `EDITOR`.

### Médias

| Route | Détail |
|---|---|
| `GET /api/admin/media` | `{ "items": [ { …Media, "originalName", "mime", "sizeBytes", "usageCount", "createdAt" } ] }` |
| `POST /api/admin/media/upload` | `multipart/form-data`, champ **`file`** → `201` + objet `Media` étendu |
| `PATCH /api/admin/media/:id` | modification de `altFr` / `altEn` |
| `DELETE /api/admin/media/:id` | `409` si `usageCount > 0`, avec la liste des utilisations dans `details` |

Upload : max **10 Mo**, types acceptés jpeg/png/webp/avif **vérifiés par magic bytes**,
ré-encodage systématique en WebP, nom de fichier UUID.

---

---

## Précisions apportées pendant l'implémentation

Points laissés ambigus par la première rédaction, tranchés à l'usage et vérifiés
sur l'API réelle :

| Point | Décision |
|---|---|
| `description` sur `Team` | Ajouté après coup. Ce texte vivait dans Transloco (`contents.teams.lol.teams.<clé>.description`) et n'était donc pas administrable, ce qui contredisait l'objectif « plus aucune donnée en dur ». Colonnes `descriptionFr` / `descriptionEn`, résolues selon `lang`. Peut valoir `null` : le site n'affiche alors aucun paragraphe. |
| Enveloppe des listes admin | **`{ "items": [ … ] }` pour toutes**, sans exception. La première rédaction disait « liste complète » sans trancher : le panel a supposé un tableau nu et ses écrans restaient vides (`@for` sur un objet non itérable). Le déballage est centralisé dans `AdminApiService.ressource()`. |
| `GET /api/teams` sans `game` | **400**. Le paramètre est obligatoire, pas optionnel. |
| Galerie des partenaires | `POST`/`PATCH /api/admin/partners` acceptent `imageIds: string[]` qui **remplace intégralement** la galerie ordonnée. |
| `GET /api/admin/media/:id` | Ajouté. Renvoie en plus le détail des `usages` (où le média est utilisé). |
| `slug` sur `PartnerEntry` | Colonne unique ajoutée, indispensable à l'upsert idempotent du seed. **N'apparaît pas** dans les réponses publiques. |
| `409` doublon | `details` est omis quand Prisma ne remonte pas le champ fautif ; `message` reste explicite. |
| Jalons : `tag` et `badge` | Ces clés i18n existaient mais n'étaient rendues par aucun template. Abandonnées ; `hasBadge` (booléen) est conservé. |
| Rôle `Assistant Coach` | Absent de l'ancienne map `getRoleColor`, le front retombait sur `bg-gray-500`. Ce comportement est figé tel quel en base. |
| Messages de validation | zod configuré en français (`z.config(z.locales.fr())`) pour respecter la règle « message lisible par un humain ». |

## Règles non négociables

1. Le front public n'appelle **jamais** `/api/admin/*`.
2. Aucun secret, aucune clé, aucun identifiant dans le bundle Angular.
3. Le guard Angular sur `/admin` est du confort UX. La seule protection réelle est
   `requireAuth` côté Express.
4. Toute route admin absente de ce document doit être ajoutée **ici d'abord**.
