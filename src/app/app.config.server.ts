import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { TRANSLOCO_LOADER } from '@jsverse/transloco';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { TranslocoServerLoader } from './transloco/transloco-loader.server';
import { API_BASE_URL } from './core/api/api-base-url';

const serverConfig: ApplicationConfig = {
  providers: [
    // `withRoutes` est INDISPENSABLE : sans lui, `app.routes.server.ts` n'est
    // jamais lu et Angular prérend l'intégralité du site, quel que soit le
    // `RenderMode` déclaré. Le contenu servi serait alors figé au moment du
    // build — exactement ce que cette architecture cherche à éviter.
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: TRANSLOCO_LOADER,
      useClass: TranslocoServerLoader
    },
    {
      // Le fetch de Node exige une URL absolue. En production, l'API tourne sur la
      // même machine que le serveur SSR : on l'appelle donc en direct, sans passer
      // par nginx. Surchargeable par la variable d'env API_INTERNAL_URL.
      provide: API_BASE_URL,
      useFactory: () => process.env['API_INTERNAL_URL'] ?? 'http://localhost:4001'
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
