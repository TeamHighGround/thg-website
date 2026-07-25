import { InjectionToken } from '@angular/core';

/**
 * Préfixe appliqué à tous les appels vers l'API THG.
 *
 * Côté navigateur, une URL relative suffit : `proxy.conf.json` en dev et nginx en
 * production routent `/api` vers l'API Express.
 *
 * Côté serveur (SSR), `HttpClient` s'appuie sur le `fetch` de Node, qui exige une
 * URL ABSOLUE. Sans ce token, le rendu serveur échoue avec « Invalid URL » — c'est
 * l'erreur n°1 de ce type de migration. La valeur serveur est fournie par
 * `app.config.server.ts`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => ''
});
