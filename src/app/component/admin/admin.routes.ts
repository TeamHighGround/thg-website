import { Routes } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { gardeAuthentification, gardeInvite } from './core/auth.guard';
import { gardeModificationsNonEnregistrees } from './core/modifications-non-enregistrees.guard';
import { Notifications } from './core/notifications.service';

/**
 * Routes du panel d'administration.
 *
 * Chargées à la demande depuis `app.routes.ts` : tant que personne ne va sur
 * `/admin`, rien de tout ceci n'est téléchargé par les visiteurs du site.
 *
 * `MessageService` et `ConfirmationService` sont fournis ici plutôt qu'à la
 * racine : ils ne servent qu'au panel, autant qu'ils restent dans le même
 * morceau de code.
 *
 * Rappel : `gardeAuthentification` n'est que du confort d'affichage. La
 * protection réelle est `requireAuth` côté API.
 */
export const adminRoutes: Routes = [
  {
    path: '',
    // `Notifications` dépend des deux services PrimeNG : les trois vivent dans le
    // même injecteur de route, donc dans le même morceau chargé à la demande.
    providers: [MessageService, ConfirmationService, Notifications],
    children: [
      // ── Connexion (hors layout : pas de menu quand on n'est pas connecté) ──
      {
        path: 'connexion',
        canActivate: [gardeInvite],
        title: 'Connexion — Administration THG',
        loadComponent: () => import('./pages/login/login').then(m => m.AdminLogin)
      },

      // ── Panel ─────────────────────────────────────────────────────────────
      {
        path: '',
        canActivate: [gardeAuthentification],
        loadComponent: () => import('./layout/admin-layout').then(m => m.AdminLayout),
        children: [
          {
            path: '',
            title: 'Administration THG',
            loadComponent: () => import('./pages/home/home').then(m => m.AdminHome)
          },

          // Rosters
          {
            path: 'rosters',
            title: 'Rosters — Administration THG',
            loadComponent: () => import('./pages/rosters/rosters').then(m => m.AdminRosters)
          },
          {
            path: 'rosters/:id',
            title: 'Équipe — Administration THG',
            canDeactivate: [gardeModificationsNonEnregistrees],
            loadComponent: () =>
              import('./pages/rosters/team-detail/team-detail').then(m => m.AdminTeamDetail)
          },

          // Timeline
          {
            path: 'timeline',
            title: 'Timeline — Administration THG',
            loadComponent: () => import('./pages/timeline/timeline').then(m => m.AdminTimeline)
          },

          // Partenaires
          {
            path: 'partenaires',
            data: { kind: 'PARTNER' },
            title: 'Partenaires — Administration THG',
            loadComponent: () => import('./pages/partners/partners').then(m => m.AdminPartners)
          },
          {
            path: 'partenaires/:id',
            title: 'Partenaire — Administration THG',
            canDeactivate: [gardeModificationsNonEnregistrees],
            loadComponent: () =>
              import('./pages/partners/partner-detail/partner-detail').then(
                m => m.AdminPartnerDetail
              )
          },

          // Ambassadeurs — même écran, autre `kind`
          {
            path: 'ambassadeurs',
            data: { kind: 'AMBASSADOR' },
            title: 'Ambassadeurs — Administration THG',
            loadComponent: () => import('./pages/partners/partners').then(m => m.AdminPartners)
          },
          {
            path: 'ambassadeurs/:id',
            title: 'Ambassadeur — Administration THG',
            canDeactivate: [gardeModificationsNonEnregistrees],
            loadComponent: () =>
              import('./pages/partners/partner-detail/partner-detail').then(
                m => m.AdminPartnerDetail
              )
          },

          // Médiathèque
          {
            path: 'medias',
            title: 'Médiathèque — Administration THG',
            loadComponent: () => import('./pages/media/media').then(m => m.AdminMedia)
          },

          // Compte
          {
            path: 'compte',
            title: 'Mon compte — Administration THG',
            loadComponent: () => import('./pages/account/account').then(m => m.AdminAccount)
          },

          // Adresse inconnue dans le panel : retour à l'accueil du panel.
          { path: '**', redirectTo: '' }
        ]
      }
    ]
  }
];
