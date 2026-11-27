import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

/**
 * Serveur de rendu du site THG.
 *
 * Il ne sert QUE l'application Angular. En production, nginx route `/api` et
 * `/media` directement vers l'API Express (dépôt `thg-api`) : ces chemins
 * n'arrivent jamais ici.
 *
 * Sans ce fichier — et sans `outputMode: "server"` dans `angular.json` — le
 * build se contente de prérendre les pages et n'émet aucun serveur. Les routes
 * déclarées `RenderMode.Server` dans `app.routes.server.ts` seraient alors
 * figées au moment du build, et le contenu modifié depuis le panel
 * n'apparaîtrait qu'après un redéploiement.
 */
const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
/**
 * nginx forwards `X-Forwarded-For` and `X-Forwarded-Proto`; since Angular 20.3 any
 * proxy header that is not listed here makes the engine fall back to client-side
 * rendering (empty HTML for search engines). `X-Forwarded-Host` and `-Prefix` stay
 * untrusted: the allowed hosts are fixed in `angular.json` (`security.allowedHosts`).
 */
const angularApp = new AngularNodeAppEngine({
  trustProxyHeaders: ['x-forwarded-for', 'x-forwarded-proto']
});

/**
 * Build outputs whose name carries a content hash (`main-QINDNIFO.js`,
 * `chunk-CCkn47_2.js`, `styles-…`, `bundle-assets/…`): a new content means a new
 * URL, so they can be cached for a year. Allow-list on purpose: a generic
 * "-XXXXXXXX" pattern could one day match an unhashed file such as a logo.
 */
const HASHED_FILE =
  /[\\/](?:main|chunk|polyfills|styles)-[A-Za-z0-9_-]{8}\.(?:js|css)$|[\\/]bundle-assets[\\/]/;

/**
 * Fichiers statiques du bundle navigateur.
 * `index: false` : la page d'accueil doit passer par le rendu Angular, pas être
 * servie telle quelle depuis le disque.
 * Everything without a hash (robots.txt, sitemap.xml, files from `public/` and
 * `src/assets/`) keeps its URL across deploys: `no-cache` makes browsers
 * revalidate it (ETag, 304) instead of keeping a stale copy for a year.
 */
app.use(
  express.static(browserDistFolder, {
    cacheControl: false,
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      res.setHeader(
        'Cache-Control',
        HASHED_FILE.test(path) ? 'public, max-age=31536000, immutable' : 'no-cache'
      );
    }
  })
);

/** Tout le reste part au moteur de rendu Angular. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next()
    )
    .catch(next);
});

if (isMainModule(import.meta.url)) {
  const port = Number(process.env['PORT'] ?? 4000);
  app.listen(port, () => {
    console.log(`Serveur SSR THG démarré sur http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
