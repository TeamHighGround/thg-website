# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the THG (Team High Ground) website - an Angular 20 application with **static prerendering (SSR)**, internationalization, Firebase hosting, and a gaming esports focus. The site features team pages (LoL, TFT), news, ambassadors, and contact pages.

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

## SSR / Prerendering

The application uses **static prerendering** for SEO optimization. Key files:

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

- L'URL du widget est définie dans `shop.ts` (`HELLOASSO_URL`) et assainie via `DomSanitizer.bypassSecurityTrustResourceUrl()`.
- L'iframe n'est rendue que côté navigateur (`isPlatformBrowser`) ; en SSR/prerender un message de chargement (`shop.loading`) est affiché à la place.
- L'attribut `allow="payment"` autorise le paiement dans l'iframe ; un handler `onload` ajuste la hauteur via les `postMessage` envoyés par HelloAsso.

Pour changer de boutique, mettre à jour `HELLOASSO_URL` dans `shop.ts`.

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
