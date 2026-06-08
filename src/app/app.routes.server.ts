import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // French routes (default)
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'teams/lol', renderMode: RenderMode.Prerender },
  { path: 'teams/tft', renderMode: RenderMode.Prerender },
  { path: 'teams/ssbu', renderMode: RenderMode.Prerender },
  { path: 'news', renderMode: RenderMode.Prerender },
  { path: 'ambassadors', renderMode: RenderMode.Prerender },
  { path: 'partners', renderMode: RenderMode.Prerender },
  { path: 'shop', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'legal-notice', renderMode: RenderMode.Prerender },
  { path: 'privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'cookie-settings', renderMode: RenderMode.Prerender },

  // English routes
  { path: 'en', renderMode: RenderMode.Prerender },
  { path: 'en/about', renderMode: RenderMode.Prerender },
  { path: 'en/teams/lol', renderMode: RenderMode.Prerender },
  { path: 'en/teams/tft', renderMode: RenderMode.Prerender },
  { path: 'en/teams/ssbu', renderMode: RenderMode.Prerender },
  { path: 'en/news', renderMode: RenderMode.Prerender },
  { path: 'en/ambassadors', renderMode: RenderMode.Prerender },
  { path: 'en/partners', renderMode: RenderMode.Prerender },
  { path: 'en/shop', renderMode: RenderMode.Prerender },
  { path: 'en/contact', renderMode: RenderMode.Prerender },
  { path: 'en/legal-notice', renderMode: RenderMode.Prerender },
  { path: 'en/privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'en/cookie-settings', renderMode: RenderMode.Prerender },

  // Wildcard - client-side only
  { path: '**', renderMode: RenderMode.Client }
];
