import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../core/auth.service';
import { Notifications } from '../core/notifications.service';

interface EntreeMenu {
  chemin: string;
  libelle: string;
  icone: string;
  /** Réservé aux comptes ADMIN. */
  adminSeulement?: boolean;
}

/**
 * Coquille du panel : barre latérale + zone de contenu.
 *
 * Volontairement SANS le header ni le footer du site public. On n'est pas sur le
 * site, on est dans son back-office : le mélange des deux brouille les repères et
 * fait cliquer sur des liens publics par erreur.
 *
 * `ViewEncapsulation.None` est nécessaire ici : les classes communes du panel
 * (`.champ-texte`, `.btn`, `.carte`…) définies dans `shared/admin-ui.scss` doivent
 * être visibles par tous les écrans enfants, sans toucher au `styles.scss` global
 * du site.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  encapsulation: ViewEncapsulation.None
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly notif = inject(Notifications);

  readonly utilisateur = this.auth.utilisateur;
  readonly menuOuvert = signal(false);

  private readonly entrees: EntreeMenu[] = [
    { chemin: '/admin', libelle: 'Accueil', icone: 'pi-home' },
    { chemin: '/admin/rosters', libelle: 'Rosters', icone: 'pi-users' },
    { chemin: '/admin/timeline', libelle: 'Timeline', icone: 'pi-history' },
    { chemin: '/admin/partenaires', libelle: 'Partenaires', icone: 'pi-briefcase' },
    { chemin: '/admin/ambassadeurs', libelle: 'Ambassadeurs', icone: 'pi-star' },
    { chemin: '/admin/reseaux-sociaux', libelle: 'Réseaux sociaux', icone: 'pi-share-alt' },
    { chemin: '/admin/boutique', libelle: 'Boutique', icone: 'pi-shopping-bag' },
    { chemin: '/admin/medias', libelle: 'Médiathèque', icone: 'pi-images' },
    { chemin: '/admin/compte', libelle: 'Mon compte', icone: 'pi-user' }
  ];

  readonly menu = computed(() =>
    this.entrees.filter(e => !e.adminSeulement || this.auth.estAdmin())
  );

  constructor() {
    // Le panel ne doit jamais se retrouver dans un moteur de recherche. La route
    // est déjà en rendu client (donc invisible des crawlers), la balise est la
    // ceinture par-dessus les bretelles.
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  basculerMenu(): void {
    this.menuOuvert.update(v => !v);
  }

  fermerMenu(): void {
    this.menuOuvert.set(false);
  }

  seDeconnecter(): void {
    this.notif.confirmer({
      titre: 'Se déconnecter',
      message: 'Voulez-vous vraiment quitter le panel d\'administration ?',
      libelleAction: 'Se déconnecter',
      action: async () => {
        await this.auth.deconnexion();
        void this.router.navigate(['/admin/connexion']);
      }
    });
  }
}
