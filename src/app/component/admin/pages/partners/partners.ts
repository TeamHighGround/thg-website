import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminApiService } from '../../core/admin-api.service';
import { Partenaire, TypePartenaire } from '../../core/admin-api.types';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';
import { SortableList } from '../../shared/sortable-list/sortable-list';

/**
 * Écran unique pour les partenaires et les ambassadeurs.
 *
 * Les deux partagent exactement la même fiche (nom, description bilingue,
 * galerie, réseaux sociaux) : seul le `kind` change. Deux écrans jumeaux auraient
 * doublé la maintenance sans rien apporter.
 *
 * Le type est lu dans les données de route (`data.kind`).
 */
@Component({
  selector: 'app-admin-partners',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader, SortableList],
  templateUrl: './partners.html'
})
export class AdminPartners {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly kind = signal<TypePartenaire>(
    (this.route.snapshot.data['kind'] as TypePartenaire) ?? 'PARTNER'
  );

  readonly estAmbassadeur = computed(() => this.kind() === 'AMBASSADOR');
  readonly titre = computed(() => (this.estAmbassadeur() ? 'Ambassadeurs' : 'Partenaires'));
  readonly nomSingulier = computed(() =>
    this.estAmbassadeur() ? 'ambassadeur' : 'partenaire'
  );
  readonly pagePublique = computed(() =>
    this.estAmbassadeur() ? '/ambassadors' : '/partners'
  );
  readonly baseAdmin = computed(() =>
    this.estAmbassadeur() ? '/admin/ambassadeurs' : '/admin/partenaires'
  );

  readonly chargement = signal(true);
  readonly entrees = signal<Partenaire[]>([]);
  readonly creation = signal(false);

  constructor() {
    void this.charger();
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const toutes = await this.api.partenaires.liste();
      this.entrees.set(
        toutes.filter(e => e.kind === this.kind()).sort((a, b) => a.order - b.order)
      );
    } catch (err) {
      this.notif.erreur(err, `charger les ${this.titre().toLowerCase()}`);
    } finally {
      this.chargement.set(false);
    }
  }

  reordonner = (ids: string[]) => this.api.partenaires.reordonner(ids);

  /** Crée une fiche vide puis ouvre directement son écran d'édition. */
  async creer(): Promise<void> {
    this.creation.set(true);
    try {
      const entree = await this.api.partenaires.creer({
        kind: this.kind(),
        name: `Nouveau ${this.nomSingulier()}`,
        published: false,
        typesFr: [],
        typesEn: []
      });
      this.notif.info(
        'Fiche créée en brouillon. Complétez-la, puis rendez-la visible sur le site.'
      );
      void this.router.navigate([this.baseAdmin(), entree.id]);
    } catch (err) {
      this.notif.erreur(err, 'créer la fiche');
    } finally {
      this.creation.set(false);
    }
  }

  supprimer(entree: Partenaire, evenement: Event): void {
    evenement.preventDefault();
    evenement.stopPropagation();
    this.notif.confirmerSuppression({
      quoi: `${this.estAmbassadeur() ? "l'ambassadeur" : 'le partenaire'} ${entree.name}`,
      action: async () => {
        try {
          await this.api.partenaires.supprimer(entree.id);
          this.entrees.set(this.entrees().filter(e => e.id !== entree.id));
          this.notif.succes(`${entree.name} a été supprimé.`);
        } catch (err) {
          this.notif.erreur(err, 'supprimer la fiche');
        }
      }
    });
  }
}
