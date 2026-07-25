import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
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
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'tailwind, primeng'
          },
          darkModeSelector: '.app-dark',
          prefix: 'p'
        }
      },
      ripple: true,
      inputVariant: 'outlined'
    }),
    // `withFetch` est requis pour que HttpClient fonctionne côté serveur (SSR).
    provideHttpClient(withFetch()),
    // Rejoue le HTML rendu par le serveur au lieu de tout reconstruire, et embarque
    // les réponses GET de l'API dans la page : le navigateur ne refait pas les
    // appels déjà faits pendant le rendu serveur.
    provideClientHydration(
      withHttpTransferCacheOptions({ includePostRequests: false })
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