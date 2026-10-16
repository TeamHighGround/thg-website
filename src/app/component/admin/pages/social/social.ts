import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AdminApiService } from '../../core/admin-api.service';
import { ReglagesSite, ReseauxSociaux } from '../../core/admin-api.types';
import { PeutContenirDesModifications } from '../../core/modifications-non-enregistrees.guard';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';
import { SaveBar } from '../../shared/save-bar/save-bar';
import { RESEAUX_SITE, SocialLinks } from '../../shared/social-links/social-links';

/**
 * Réseaux sociaux de l'association.
 *
 * Une seule fiche (pas de liste) : les liens X, Instagram et Discord affichés
 * dans le footer de toutes les pages, sur la page contact et dans les données
 * structurées lues par les moteurs de recherche.
 */
@Component({
  selector: 'app-admin-social',
  standalone: true,
  imports: [CommonModule, PageHeader, SaveBar, SocialLinks],
  templateUrl: './social.html'
})
export class AdminSocial implements PeutContenirDesModifications {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly reseauxSite = RESEAUX_SITE;

  readonly chargement = signal(true);
  readonly enregistrement = signal(false);
  readonly reglages = signal<ReglagesSite | null>(null);
  readonly reseaux = signal<ReseauxSociaux>({});

  private readonly reference = signal('');
  private readonly etatCourant = computed(() => JSON.stringify(this.reseaux()));
  readonly modifie = computed(() => !!this.reference() && this.etatCourant() !== this.reference());

  /** Même règle que `<app-social-links>` : une adresse saisie doit être une URL complète. */
  readonly blocage = computed(() => {
    const valeurs = Object.values(this.reseaux()).filter((v): v is string => !!v);
    const invalide = valeurs.some(v => {
      if (!/^https?:\/\//i.test(v)) return true;
      try {
        new URL(v);
        return false;
      } catch {
        return true;
      }
    });
    return invalide ? "Corrigez les adresses en rouge avant d'enregistrer." : null;
  });

  aDesModifications(): boolean {
    return this.modifie();
  }

  constructor() {
    void this.charger();
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const reglages = await this.api.reglages();
      this.reglages.set(reglages);
      this.appliquer(reglages);
    } catch (err) {
      this.notif.erreur(err, 'charger les réseaux sociaux');
    } finally {
      this.chargement.set(false);
    }
  }

  private appliquer(reglages: ReglagesSite): void {
    this.reseaux.set({
      twitter: reglages.twitter ?? null,
      instagram: reglages.instagram ?? null,
      discord: reglages.discord ?? null
    });
    this.reference.set(this.etatCourant());
  }

  async enregistrer(): Promise<void> {
    if (this.blocage()) return;
    const { twitter, instagram, discord } = this.reseaux();

    this.enregistrement.set(true);
    try {
      const maj = await this.api.modifierReglages({
        twitter: twitter ?? null,
        instagram: instagram ?? null,
        discord: discord ?? null
      });
      this.reglages.set(maj);
      this.appliquer(maj);
      this.notif.succes('Les réseaux sociaux sont enregistrés.');
    } catch (err) {
      this.notif.erreur(err, 'enregistrer les réseaux sociaux');
    } finally {
      this.enregistrement.set(false);
    }
  }

  annuler(): void {
    const reglages = this.reglages();
    if (reglages) this.appliquer(reglages);
  }
}
