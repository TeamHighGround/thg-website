# CLAUDE.md

Site public de la **Team High Ground** (teamhighground.fr) : Angular 20, rendu serveur
(SSR) à chaque requête, FR/EN. La vue d'ensemble des trois dépôts (API, site, panel),
le lancement local et le déploiement sont dans `../CLAUDE.md`.

## Git

- **Jamais de ligne `Co-Authored-By: Claude …`** (ni aucune autre mention de Claude) dans
  les messages de commit ou les descriptions de PR, sur ce dépôt comme sur `thg-api` et
  `thg-admin`.
- `deploy.sh` est **gitignoré** (il contient l'hôte et la clé SSH) : il existe en local
  mais ne se committe pas.

## Commandes

```bash
npm start              # ng serve --open, http://localhost:4200 (proxy /api et /media → :4001)
npx ng build           # build de production : navigateur + serveur (dist/thg-website/server/server.mjs)
rm -rf .angular/cache  # en cas d'erreur SSR NG0400 après une mise à jour
```

- `npx ng build` est **la** vérification : il compile aussi les gabarits.
- Les specs Karma (`ng test`) ne sont pas entretenues : 17 sur 21 échouent faute de
  providers (HttpClient, Transloco). Ne pas s'y fier ; ne pas en ajouter sans les réparer.
- Le build affiche « Prerendered 0 static routes » : c'est normal, tout est en rendu serveur.
- Sans l'API (`thg-api` sur :4001), les pages s'affichent en mode dégradé — c'est voulu.

## Le contenu ne vit pas dans le code

Rosters, timeline, partenaires, ambassadeurs, postes (`/careers`), réseaux sociaux,
e-mail de contact et boutique sont **servis par l'API** et **administrés depuis le panel**
(`thg-admin`, admin.teamhighground.fr). Ne pas les recoder en dur, ni les remettre dans
les fichiers de traduction.

- **`docs/api-contract.md` fait foi** pour les trois dépôts : formes JSON, codes d'erreur,
  noms de routes. Toute route nouvelle s'y inscrit **avant** d'être codée.
- Les routes publiques acceptent `?lang=fr|en` et renvoient des textes **déjà résolus** :
  le site ne manipule jamais de suffixes `Fr`/`En`.
- Le site n'appelle **jamais** `/api/admin/*` ni `/api/auth/*` : en production, nginx les
  refuse (404) sur ce domaine. La session n'existe que sur le sous-domaine du panel, hors
  de portée des scripts tiers chargés ici (widgets X, Umami).

### Appeler l'API depuis un composant

Passer par `ApiService` (`src/app/core/api/`), jamais par une URL construite à la main :
le jeton `API_BASE_URL` fournit un préfixe **relatif dans le navigateur et absolu côté
SSR**, parce que le `fetch` de Node refuse les URL relatives. C'est l'erreur n°1 de
cette architecture.

- Chaque méthode renvoie un `ApiState<T>` (`loading` / `ready` / `error`) et ne peut pas
  échouer : **une API tombée dégrade l'affichage, elle ne casse jamais le rendu serveur.**
- Les méthodes dépendantes de la langue passent par `selonLangue()` : l'appel est rejoué
  à chaque changement de langue Transloco.
- Les types des réponses sont dans `models.ts` et recopient le contrat à l'identique.
- Les réglages globaux (`/api/settings`) se lisent via `SiteSettingsService`
  (`reseaux()`, `emailContact()`, `boutique()`), partagé par le footer, la page contact,
  la boutique et le JSON-LD : ne pas s'abonner une seconde fois à `getSettings()`.
- Modèle de composant : `component/contents/partners/partners.ts` ou `careers/careers.ts`
  (`toSignal(api.getXxx(), { initialValue: API_LOADING })` puis `computed()`).

## Rendu serveur et hydratation

Toutes les routes publiques et leurs variantes `/en` sont en **`RenderMode.Server`**
(`src/app/app.routes.server.ts`), même les pages au contenu figé : le footer affiche les
réseaux configurés dans le panel, un prérendu les figerait au moment du build. Le serveur
Node écoute sur le port 4000 en production (`src/server.ts`).

L'hydratation est activée (`provideClientHydration`). Conséquences :

- **Un composant qui manipule le DOM ou lance un timer doit être vérifié.** Un
  `setInterval` dans la zone Angular empêche l'application de se stabiliser et fait
  avorter l'hydratation (cas rencontré sur `partner-card`).
- Un composant qui injecte un script tiers a besoin de `ngSkipHydration` sur son nœud
  hôte (cas de `ssbu`, qui intègre un tweet via le script de X).
- Pour un contenu qui se déplie, préférer `<details>` natif à un état de composant :
  rien à réconcilier, et le texte reste dans le HTML servi (cas de `job-card`).
- Navigateur uniquement (`window`, `document`, `localStorage`, `navigator`,
  `getBoundingClientRect`, `setInterval`…) : protéger par
  `isPlatformBrowser(inject(PLATFORM_ID))`.

Le cache de transfert HTTP intégré d'Angular **ne peut pas** servir ici : il indexe sur
l'URL complète, or le serveur appelle `http://localhost:4001/api/…` et le navigateur
`/api/…`. `ApiService` gère donc son propre `TransferState`, indexé sur chemin +
paramètres. Ne pas le « simplifier » en réactivant `transferCache`.

Le contrôle qui compte : le HTML **brut** doit contenir les données
(`curl -s http://localhost:4200/teams/lol | grep -c Kitano` > 0). Une page qui s'affiche
bien dans le navigateur mais dont le HTML brut est vide est une régression grave (SEO,
aperçus de lien Discord/X).

## Routes

Définies dans `src/app/app.routes.ts`, dupliquées sous `/en` pour l'anglais. Les chemins
sont en anglais dans les deux langues.

`/` · `/about` · `/teams/lol` · `/teams/tft` · `/teams/ssbu` · `/news` · `/partners` ·
`/ambassadors` · `/shop` · `/contact` · `/careers` (« Nous rejoindre ») · `/legal-notice` ·
`/privacy-policy` · `/cookie-settings` (chargée à la demande)

### Ajouter une page

1. Composant dans `src/app/component/contents/<page>/` (`<page>.ts`, `.html`) ;
   sélecteur préfixé `app-`, composants autonomes, fichiers en kebab-case.
2. Route dans `app.routes.ts` **et** dans `app.routes.server.ts` (`<page>` et `en/<page>`,
   en `RenderMode.Server`).
3. Lien dans le header — **deux fois** : la pilule desktop et le menu mobile de
   `component/header/header.html` — et, si pertinent, dans le footer.
4. SEO : entrée dans `services/seo/routes-seo.config.ts` (FR et EN), libellé du fil
   d'Ariane dans `services/seo/json-ld.service.ts`, deux entrées dans `public/sitemap.xml`.
5. Traductions dans `src/assets/i18n/fr.json` **et** `en.json`.
6. Gabarit : reprendre l'en-tête de `contact.html` ou `careers.html`
   (`<section class="min-h-screen pt-12 pb-12 sm:pb-16 md:pb-20 lg:pb-28">`). Toutes les
   pages commencent à **48 px** sous le header, comme la boutique.

## Traductions (Transloco)

- Langues `fr` (défaut) et `en`. Fichiers : `src/assets/i18n/fr.json` et `en.json`.
  Le navigateur les charge en HTTP ; le serveur les **importe à la compilation**
  (`transloco-loader.server.ts`) : une clé modifiée exige de relancer le serveur de dev
  ou de rebuilder. `transloco.config.ts` (`public/assets/i18n/`) n'est utilisé par rien.
- Format à respecter : JSON indenté de 2 espaces, **fins de ligne CRLF**, accents non
  échappés. Les fichiers ne contiennent que l'interface (titres, boutons, messages) :
  le contenu éditorial est en base.
- Toute clé ajoutée l'est dans les deux fichiers ; toute clé retirée du gabarit est
  supprimée des deux.
- Les deux fichiers ont **exactement la même arborescence** de clés : une section
  rangée ailleurs dans `en.json` s'affiche en clés brutes sur le site anglais (cas des
  mentions légales, corrigé en octobre 2026).

## Styles

- **Tailwind 3** (configuration et couleurs `thgGreen`, `thgDark` dans
  `tailwind.config.js`) + **PrimeNG 20** (thème Aura, mode sombre `.app-dark` ; utilisé par le
  menu Équipes du header, `partner-card`, la page LoL et `team-card`). Couches CSS
  ordonnées `tailwind, primeng`.
- Classes Tailwind dynamiques : les écrire **en entier** dans le code (pas de
  `'bg-' + couleur`), sinon Tailwind ne les génère pas. Exemples : `contact.ts`, `job-card.ts`.
- Cartes : `bg-white/[0.025] rounded-[10px] border border-white/[0.08]
  hover:border-thgGreen/30`. Icônes : PrimeIcons (`pi pi-…`).
- Pas d'effet clignotant ou animé en boucle dans les pages (refusé par l'utilisateur).

## Boutique (`component/contents/shop/`)

Iframe HelloAsso intégrée : tout le merch est géré sur la boutique HelloAsso de
l'association.

- Ouverture/fermeture et URL du widget se règlent dans le panel (Boutique), stockées dans
  `site_settings` (`shopEnabled`, `shopUrl`) et lues via `SiteSettingsService.boutique()`.
  Fermée (ou API injoignable), la page affiche `shop.closed.*`.
- L'URL n'est acceptée que sur `helloasso.com` en https — vérifié par l'API **et** par
  `shop.ts` avant `DomSanitizer.bypassSecurityTrustResourceUrl()`.
- L'iframe n'est rendue que côté navigateur ; en SSR, `shop.loading` est affiché à la place.
- `allow="payment"` autorise le paiement ; un handler `onload` ajuste la hauteur via les
  `postMessage` envoyés par HelloAsso.

## SEO

Services dans `src/app/services/seo/` : `seo.service.ts` (balises meta, Open Graph,
Twitter Cards), `json-ld.service.ts` (Organization, BreadcrumbList, SportsTeam),
`routes-seo.config.ts` (configuration par route, FR/EN). Fichiers statiques :
`public/robots.txt` et `public/sitemap.xml` (hreflang FR/EN).
