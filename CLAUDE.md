# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the THG (Team High Ground) website - an Angular 20 application with **hybrid rendering (SSR + prerendering)**, internationalization, and a gaming esports focus. The site features team pages (LoL, TFT), news, ambassadors, and contact pages.

**Le contenu éditorial (rosters, timeline, partenaires, ambassadeurs, actualités) ne vit plus dans le code** : il est servi par une API séparée et administré depuis un panel, projet Angular distinct (`thg-admin`, servi sur admin.teamhighground.fr). Voir les sections « API THG » et « Panel d'administration » plus bas, et `docs/demarrage-local.md` pour lancer l'ensemble.

## Git

- **Jamais de ligne `Co-Authored-By: Claude …`** (ni aucune autre mention de Claude) dans les messages de commit ou les descriptions de PR, sur ce dépôt comme sur `thg-api`.

## Build Commands

### Development
```bash
npm start                 # Start dev server with SSR (auto-open browser)
ng serve                  # Alternative: start dev server without auto-open
```

### Production Build
```bash
ng build                  # Build with prerendering (outputs to dist/thg-website/browser)
```

The build generates **prerendered HTML files** for all routes, improving SEO and initial load performance.

### Testing
```bash
ng test                   # Run Karma tests
```

### Deployment
```bash
ng build                  # Build with prerendering first
firebase deploy           # Deploy to Firebase hosting
```

### Troubleshooting
```bash
rm -rf .angular/cache     # Clear cache if SSR errors occur (NG0400)
```

## Architecture

### Component Structure

The application follows Angular standalone components architecture (no NgModule). All components are located in `src/app/component/` with a clear separation:

- **Layout components**: `header/`, `footer/`, `background/`, `cookie-banner/`, `cookie-settings/`
- **Content pages**: `contents/` - all route-based page components
  - Each page has its own directory with `.ts`, `.html`, `.scss`, and `.spec.ts` files
  - Sub-components (like `member-card/`, `partner-card/`, `team-card/`) are nested within their parent page directories

### Routing

Routes are defined in `src/app/app.routes.ts`. All routes use a `TranslocoResolver` to ensure translations are loaded before rendering. The application supports **multilingual URLs**.

**French routes (default)**:
- `/` - Home
- `/about` - About page
- `/teams/lol` - League of Legends team
- `/teams/tft` - Teamfight Tactics team
- `/news` - News page
- `/ambassadors` - Ambassadors page
- `/contact` - Contact page
- `/legal-notice` - Legal notice
- `/privacy-policy` - Privacy policy
- `/cookie-settings` - Cookie settings (lazy-loaded)

**English routes** (prefixed with `/en`):
- `/en` - Home (English)
- `/en/about` - About page (English)
- etc.

### Internationalization (i18n)

The application uses **@jsverse/transloco** for internationalization:

- **Supported languages**: English (`en`), French (`fr`)
- **Default language**: French (`fr`)
- **Translation files**: Located at `src/assets/i18n/en.json` and `src/assets/i18n/fr.json`
- **Configuration**: `transloco.config.ts` defines root path as `public/assets/i18n/` but actual files are in `src/assets/i18n/`
- **Loader**: Custom `TranslocoHttpLoader` in `src/app/transloco/transloco-loader.ts` handles HTTP-based translation loading

When adding translatable content, update both `en.json` and `fr.json` files.

### Styling

The application uses a **Tailwind CSS + PrimeNG** combination:

- **Tailwind**: Primary utility-first CSS framework
- **PrimeNG**: UI component library with Aura theme preset
- **Custom colors**: `thgGreen` (brand green with 50-950 scale) and `thgDark` defined in `tailwind.config.js`
- **Style language**: SCSS for component-specific styles
- **CSS layers**: Configured to order as `tailwind, primeng` for proper style precedence
- **Dark mode**: Supported via `.app-dark` selector (configured in `app.config.ts`)

### Application Configuration

Global configuration in `src/app/app.config.ts` includes:

- Zone change detection with event coalescing
- Router with defined routes
- Async animations
- PrimeNG with Aura theme, ripple effects, and outlined input variant
- HTTP client for API calls
- Transloco for internationalization

### Firebase Hosting

Deployment configuration in `firebase.json`:
- Output directory: `dist/thg-website/browser`
- Rewrites all routes to `/index.html` for SPA routing support

## File Naming Conventions

Components use a consistent naming pattern:
- Component class: PascalCase (e.g., `MemberCard`)
- Files: kebab-case (e.g., `member-card.ts`, `member-card.html`, `member-card.scss`, `member-card.spec.ts`)
- Component selector prefix: `app-` (configured in `angular.json`)

## Angular Configuration Notes

- **Angular version**: 20.1.x (latest)
- **TypeScript version**: 5.8.2
- **Package manager**: npm (specified in `angular.json`)
- **Style preprocessor**: SCSS (configured in schematics)
- **Bundle budgets**: Initial max 1MB error, component styles max 8kB error
- **Test runner**: Karma with Jasmine

## API THG (`thg-api`)

Dépôt **séparé**. Express 5 + Prisma 7 + PostgreSQL (Docker, port 5433), API sur le port 4001.

- **`docs/api-contract.md` fait foi** pour toute évolution : formes JSON, codes d'erreur, noms de routes. Toute nouvelle route s'y inscrit **avant** d'être codée.
- Les routes publiques (`/api/teams`, `/api/timeline`, `/api/partners`, `/api/news`) acceptent `?lang=fr|en` et renvoient les textes **déjà résolus** : le front ne manipule jamais de suffixes `Fr`/`En`.
- Les routes `/api/admin/*` sont fermées par `requireAuth` (session par cookie). **C'est la seule barrière de sécurité réelle** — le guard Angular n'est que du confort UX.
- En dev, `proxy.conf.json` renvoie `/api` et `/media` de 4200 vers 4001.

### Appeler l'API depuis un composant

Utiliser `ApiService` (`src/app/core/api/`). Ne jamais construire une URL à la main :
le token `API_BASE_URL` fournit un préfixe **relatif dans le navigateur et absolu côté
SSR**, parce que le `fetch` de Node refuse les URL relatives. C'est l'erreur n°1 de
cette architecture.

Toutes les méthodes renvoient un `ApiState<T>` (`loading` / `ready` / `error`) et ne
peuvent pas échouer : **une API tombée doit dégrader l'affichage, jamais casser le
rendu serveur.**

## Panel d'administration (`thg-admin`)

Dépôt **séparé** (Angular 22, application statique), servi sur
**admin.teamhighground.fr**. Ce site-ci ne contient plus aucun code du panel.

- `teamhighground.fr/admin…` est redirigé (301) vers le sous-domaine par nginx.
- `/api/admin/*` et `/api/auth/*` répondent 404 sur `teamhighground.fr` : la session
  n'existe que sur le sous-domaine du panel, hors de portée des scripts tiers
  chargés par le site public (widgets X, Umami). Voir `deploy/nginx-thg.conf`.
- Le site public n'a donc **jamais** besoin d'authentification : ne pas y appeler
  de route `/api/admin` ou `/api/auth`.

## SSR / Prerendering

Le rendu est **hybride** — voir `src/app/app.routes.server.ts` :

- **`RenderMode.Server`** pour toutes les pages publiques et leurs variantes `/en`. Rendues à chaque requête, pour que le HTML livré contienne les données à jour. Même les pages au contenu figé (contact, mentions légales…) : le footer affiche les réseaux sociaux configurés dans le panel (`SiteSettingsService`), un prérendu les figerait au build.

L'hydratation est activée (`provideClientHydration`). Conséquence : **un composant qui
manipule le DOM ou lance un timer doit être vérifié**. Un `setInterval` dans la zone
Angular empêche l'application de se stabiliser et fait avorter l'hydratation (cas déjà
rencontré sur `partner-card`) ; un composant qui injecte un script tiers a besoin de
`ngSkipHydration` sur son nœud hôte (cas de `ssbu`).

Le cache de transfert HTTP intégré d'Angular **ne peut pas** servir ici : il indexe sur
l'URL complète, or le serveur appelle `http://localhost:4001/api/…` et le navigateur
`/api/…`. `ApiService` gère donc son propre `TransferState`, indexé sur chemin +
paramètres. Ne pas le « simplifier » en réactivant `transferCache`.

Key files:

- `src/main.server.ts` - Server entry point
- `src/app/app.config.server.ts` - Server-side Angular configuration
- `src/app/app.routes.server.ts` - Routes configuration for prerendering
- `src/app/transloco/transloco-loader.server.ts` - Server-side translation loader

### SSR Compatibility Rules

**IMPORTANT**: When creating or modifying components, ensure SSR compatibility:

```typescript
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// In the class
private platformId = inject(PLATFORM_ID);

// Before using browser APIs
if (isPlatformBrowser(this.platformId)) {
  // window, document, localStorage, setInterval, etc.
}
```

Browser-only APIs that require this check:
- `window.*` (setInterval, open, scrollTo, etc.)
- `document.*` (querySelector, cookie, etc.)
- `localStorage` / `sessionStorage`
- `navigator`
- DOM methods like `getBoundingClientRect()`

## Shop (`src/app/component/contents/shop/`)

La boutique est une **iframe HelloAsso intégrée** : tout le merch est géré directement sur la boutique HelloAsso de l'association, le site se contente d'afficher le widget.

### Fonctionnement

- Ouverture/fermeture et URL du widget se règlent dans le panel (admin.teamhighground.fr/boutique), stockées dans `site_settings` (`shopEnabled`, `shopUrl`) et lues via `SiteSettingsService.boutique()`. Fermée (ou API injoignable), la page affiche `shop.closed.*`.
- L'URL n'est acceptée que sur `helloasso.com` en https — vérifié par l'API **et** par `shop.ts` avant `DomSanitizer.bypassSecurityTrustResourceUrl()`.
- L'iframe n'est rendue que côté navigateur (`isPlatformBrowser`) ; en SSR/prerender un message de chargement (`shop.loading`) est affiché à la place.
- L'attribut `allow="payment"` autorise le paiement dans l'iframe ; un handler `onload` ajuste la hauteur via les `postMessage` envoyés par HelloAsso.

Pour changer de boutique : panel → Boutique, rien à modifier dans le code.

### Clés de traduction shop

```
shop.title    — titre de la page
shop.subtitle — sous-titre
shop.loading  — message affiché avant le rendu de l'iframe
```

## SEO

SEO is managed by dedicated services in `src/app/services/seo/`:

- **`seo.service.ts`** - Dynamic meta tags (title, description, Open Graph, Twitter Cards)
- **`json-ld.service.ts`** - Structured data (Organization, BreadcrumbList, SportsTeam)
- **`routes-seo.config.ts`** - SEO configuration per route (FR/EN)

### Static SEO Files

- `public/robots.txt` - Crawler directives
- `public/sitemap.xml` - Sitemap with hreflang for FR/EN

### Adding SEO to a New Route

1. Add route config in `src/app/services/seo/routes-seo.config.ts`
2. Add route to `public/sitemap.xml`
3. Add route to `src/app/app.routes.server.ts` for prerendering
