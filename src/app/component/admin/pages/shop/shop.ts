import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AdminApiService } from '../../core/admin-api.service';
import { ReglagesSite } from '../../core/admin-api.types';
import { PeutContenirDesModifications } from '../../core/modifications-non-enregistrees.guard';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';
import { SaveBar } from '../../shared/save-bar/save-bar';

/**
 * Boutique du site : ouverte ou fermée, et boutique HelloAsso affichée.
 *
 * Fermée, la page /shop affiche un message d'attente. Ouverte, elle intègre le
 * widget HelloAsso dont l'adresse est saisie ici.
 */
@Component({
  selector: 'app-admin-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchModule, PageHeader, SaveBar],
  templateUrl: './shop.html'
})
export class AdminShop implements PeutContenirDesModifications {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly chargement = signal(true);
  readonly enregistrement = signal(false);
  readonly reglages = signal<ReglagesSite | null>(null);

  readonly ouverte = signal(false);
  readonly adresse = signal('');

  private readonly reference = signal('');
  private readonly etatCourant = computed(() =>
    JSON.stringify({ ouverte: this.ouverte(), adresse: this.adresse().trim() })
  );
  readonly modifie = computed(() => !!this.reference() && this.etatCourant() !== this.reference());

  /** Même règle que l'API : une page HelloAsso, en https. */
  readonly erreurAdresse = computed<string | null>(() => {
    const valeur = this.adresse().trim();
    if (!valeur) return null;
    if (!/^https:\/\//i.test(valeur)) return "L'adresse doit commencer par https://";
    try {
      const url = new URL(valeur);
      return /(^|\.)helloasso\.com$/i.test(url.hostname)
        ? null
        : "L'adresse doit être une page HelloAsso (https://www.helloasso.com/…).";
    } catch {
      return "Cette adresse n'est pas valide.";
    }
  });

  /** Conseil non bloquant : HelloAsso n'accepte d'être intégré que via l'adresse du widget. */
  readonly avertissementWidget = computed(() => {
    const valeur = this.adresse().trim();
    return !!valeur && !this.erreurAdresse() && !/\/widget\/?$/i.test(valeur);
  });

  readonly blocage = computed<string | null>(() => {
    if (this.erreurAdresse()) return "Corrigez l'adresse de la boutique avant d'enregistrer.";
    if (this.ouverte() && !this.adresse().trim()) {
      return "Renseignez l'adresse de la boutique avant de l'ouvrir.";
    }
    return null;
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
      this.notif.erreur(err, 'charger les réglages de la boutique');
    } finally {
      this.chargement.set(false);
    }
  }

  private appliquer(reglages: ReglagesSite): void {
    this.ouverte.set(reglages.shopEnabled);
    this.adresse.set(reglages.shopUrl ?? '');
    this.reference.set(this.etatCourant());
  }

  async enregistrer(): Promise<void> {
    if (this.blocage()) return;

    this.enregistrement.set(true);
    try {
      const maj = await this.api.modifierReglages({
        shopEnabled: this.ouverte(),
        shopUrl: this.adresse().trim() || null
      });
      this.reglages.set(maj);
      this.appliquer(maj);
      this.notif.succes(maj.shopEnabled ? 'La boutique est ouverte.' : 'La boutique est fermée.');
    } catch (err) {
      this.notif.erreur(err, 'enregistrer la boutique');
    } finally {
      this.enregistrement.set(false);
    }
  }

  annuler(): void {
    const reglages = this.reglages();
    if (reglages) this.appliquer(reglages);
  }
}
