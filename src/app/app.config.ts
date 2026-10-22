import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withHttpTransferCacheOptions, withNoIncrementalHydration } from '@angular/platform-browser';
import { TranslocoHttpLoader } from './transloco/transloco-loader';
import { provideTransloco } from '@jsverse/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })
    ),
    // `withFetch` est requis pour que HttpClient fonctionne côté serveur (SSR).
    provideHttpClient(withFetch()),
    // Rejoue le HTML rendu par le serveur au lieu de tout reconstruire, et embarque
    // les réponses GET de l'API dans la page : le navigateur ne refait pas les
    // appels déjà faits pendant le rendu serveur.
    provideClientHydration(
      withHttpTransferCacheOptions({ includePostRequests: false }),
      withNoIncrementalHydration()
    ),
    provideTransloco({
      config: {
        availableLangs: ['en', 'fr'],
        defaultLang: 'fr',
        prodMode: !isDevMode()
      },
      loader: TranslocoHttpLoader
    })
  ]
};