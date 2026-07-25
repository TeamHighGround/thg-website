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
const angularApp = new AngularNodeAppEngine();

/**
 * Fichiers statiques du bundle navigateur.
 * `index: false` : la page d'accueil doit passer par le rendu Angular, pas être
 * servie telle quelle depuis le disque.
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false
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
