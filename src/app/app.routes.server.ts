import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Deux régimes de rendu coexistent :
 *
 * - `Prerender` : pages dont le contenu est figé dans le code (mentions légales,
 *   contact, boutique…). Générées au build, servies en statique. Rien ne change.
 *
 * - `Server` : pages dont le contenu vient désormais de l'API. Rendues à chaque
 *   requête pour que le HTML livré contienne les données à jour — c'est ce qui
 *   garde le SEO et les aperçus de lien (Discord, X…) fonctionnels.
 *
 * L'accueil est en `Server` parce que `home.html` inclut `<app-about>` et
 * `<app-timeline>`, qui dépendent de l'API.
 */
export const serverRoutes: ServerRoute[] = [
  // ── Routes françaises (par défaut) ──────────────────────────────────────────
  { path: '', renderMode: RenderMode.Server },
  { path: 'about', renderMode: RenderMode.Server },
  { path: 'teams/lol', renderMode: RenderMode.Server },
  { path: 'teams/tft', renderMode: RenderMode.Server },
  { path: 'teams/ssbu', renderMode: RenderMode.Server },
  { path: 'news', renderMode: RenderMode.Server },
  { path: 'ambassadors', renderMode: RenderMode.Server },
  { path: 'partners', renderMode: RenderMode.Server },

  { path: 'shop', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'legal-notice', renderMode: RenderMode.Prerender },
  { path: 'privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'cookie-settings', renderMode: RenderMode.Prerender },

  // ── Routes anglaises ────────────────────────────────────────────────────────
  { path: 'en', renderMode: RenderMode.Server },
  { path: 'en/about', renderMode: RenderMode.Server },
  { path: 'en/teams/lol', renderMode: RenderMode.Server },
  { path: 'en/teams/tft', renderMode: RenderMode.Server },
  { path: 'en/teams/ssbu', renderMode: RenderMode.Server },
  { path: 'en/news', renderMode: RenderMode.Server },
  { path: 'en/ambassadors', renderMode: RenderMode.Server },
  { path: 'en/partners', renderMode: RenderMode.Server },

  { path: 'en/shop', renderMode: RenderMode.Prerender },
  { path: 'en/contact', renderMode: RenderMode.Prerender },
  { path: 'en/legal-notice', renderMode: RenderMode.Prerender },
  { path: 'en/privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'en/cookie-settings', renderMode: RenderMode.Prerender },

  // ── Panel d'administration ──────────────────────────────────────────────────
  // Jamais rendu côté serveur : contenu privé, aucun intérêt SEO, et le rendu
  // dépend d'une session navigateur.
  //
  // Les routes à paramètre sont déclarées une par une : le joker `admin/**` ne
  // les couvre pas. Sans ces lignes, Angular les considère comme à prérendre et
  // le build échoue en réclamant un `getPrerenderParams` — qui n'aurait aucun
  // sens ici, puisqu'il faudrait interroger la base au moment du build pour
  // générer des pages privées.
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/rosters/:id', renderMode: RenderMode.Client },
  { path: 'admin/partenaires/:id', renderMode: RenderMode.Client },
  { path: 'admin/ambassadeurs/:id', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },

  // ── Reste ───────────────────────────────────────────────────────────────────
  { path: '**', renderMode: RenderMode.Client }
];
