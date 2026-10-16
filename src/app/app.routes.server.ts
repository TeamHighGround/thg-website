import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Toutes les pages publiques sont en `Server` : rendues à chaque requête pour que
 * le HTML livré contienne les données à jour de l'API — c'est ce qui garde le SEO
 * et les aperçus de lien (Discord, X…) fonctionnels.
 *
 * Même les pages au contenu figé (mentions légales, contact, boutique…) en ont
 * besoin : le footer, présent partout, affiche les réseaux sociaux configurés
 * dans le panel. Prérendues, elles figeraient ces liens au moment du build — ou
 * n'en afficheraient aucun si l'API n'était pas joignable pendant le build.
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

  { path: 'shop', renderMode: RenderMode.Server },
  { path: 'contact', renderMode: RenderMode.Server },
  { path: 'legal-notice', renderMode: RenderMode.Server },
  { path: 'privacy-policy', renderMode: RenderMode.Server },
  { path: 'cookie-settings', renderMode: RenderMode.Server },

  // ── Routes anglaises ────────────────────────────────────────────────────────
  { path: 'en', renderMode: RenderMode.Server },
  { path: 'en/about', renderMode: RenderMode.Server },
  { path: 'en/teams/lol', renderMode: RenderMode.Server },
  { path: 'en/teams/tft', renderMode: RenderMode.Server },
  { path: 'en/teams/ssbu', renderMode: RenderMode.Server },
  { path: 'en/news', renderMode: RenderMode.Server },
  { path: 'en/ambassadors', renderMode: RenderMode.Server },
  { path: 'en/partners', renderMode: RenderMode.Server },

  { path: 'en/shop', renderMode: RenderMode.Server },
  { path: 'en/contact', renderMode: RenderMode.Server },
  { path: 'en/legal-notice', renderMode: RenderMode.Server },
  { path: 'en/privacy-policy', renderMode: RenderMode.Server },
  { path: 'en/cookie-settings', renderMode: RenderMode.Server },

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
