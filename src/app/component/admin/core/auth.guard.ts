import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Les gardes du panel n'ont de sens que dans le navigateur.
 *
 * Au rendu serveur — et surtout à la génération de la coquille pendant le build —
 * il n'y a pas de cookie de session. La garde conclurait « non connecté » et
 * FIGERAIT une redirection vers l'écran de connexion dans le HTML livré, y
 * compris pour quelqu'un qui est en réalité connecté. On laisse donc passer côté
 * serveur : la vraie vérification a lieu à l'hydratation, dans le navigateur.
 */
function surLeServeur(): boolean {
  return !isPlatformBrowser(inject(PLATFORM_ID));
}

/**
 * Garde d'accès au panel.
 *
 * CE GUARD N'EST QUE DU CONFORT UX. Il évite d'afficher une coquille vide à
 * quelqu'un qui n'est pas connecté ; il ne protège aucune donnée. Toutes les
 * routes `/api/admin/*` sont fermées par `requireAuth` côté serveur, et c'est
 * la seule chose qui compte. Ne jamais raisonner comme si ce fichier était une
 * barrière de sécurité.
 */
export const gardeAuthentification: CanActivateFn = async (_route, etat) => {
  if (surLeServeur()) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  const utilisateur = await auth.rafraichir();
  if (utilisateur) return true;

  // Seules les destinations internes au panel sont mémorisées.
  const destination = etat.url?.startsWith('/admin') && etat.url !== '/admin' ? etat.url : null;
  return router.createUrlTree(['/admin/connexion'], {
    queryParams: destination ? { retour: destination } : {}
  });
};

/** Réservé au rôle ADMIN (gestion des comptes). */
export const gardeAdmin: CanActivateFn = async () => {
  if (surLeServeur()) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  const utilisateur = await auth.rafraichir();
  if (utilisateur?.role === 'ADMIN') return true;
  return router.createUrlTree(['/admin']);
};

/** Empêche d'afficher l'écran de connexion quand on est déjà connecté. */
export const gardeInvite: CanActivateFn = async () => {
  if (surLeServeur()) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  const utilisateur = await auth.rafraichir();
  return utilisateur ? router.createUrlTree(['/admin']) : true;
};
