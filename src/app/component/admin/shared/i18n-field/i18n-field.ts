import { CommonModule } from '@angular/common';
import { Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Champ bilingue : un seul champ, deux onglets FR / EN.
 *
 * Pourquoi pas deux formulaires côte à côte ? Parce qu'on saisit le contenu
 * français d'abord et l'anglais ensuite : deux colonnes doublent la hauteur de
 * page pour rien. Ici, on bascule d'un onglet à l'autre, et une pastille orange
 * signale en permanence les traductions anglaises manquantes — impossible de
 * publier un texte à moitié traduit sans l'avoir vu.
 */
@Component({
  selector: 'app-i18n-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './i18n-field.html'
})
export class I18nField {
  /** Valeur française. */
  readonly fr = model<string | null>('');
  /** Valeur anglaise. */
  readonly en = model<string | null>('');

  readonly libelle = input.required<string>();
  /** Explication d'une ligne affichée sous le champ. */
  readonly aide = input('');
  /** Champ multiligne (description, corps d'article…). */
  readonly multiligne = input(false);
  /** Nombre de lignes visibles en mode multiligne. */
  readonly lignes = input(4);
  readonly placeholder = input('');
  readonly obligatoire = input(false);
  /** Message d'erreur de validation affiché sous le champ. */
  readonly erreur = input<string | null>(null);

  readonly langue = signal<'fr' | 'en'>('fr');

  /** Une traduction anglaise vide se voit avant même d'ouvrir l'onglet. */
  readonly traductionManquante = computed(() => !(this.en() ?? '').trim());
  readonly francaisVide = computed(() => !(this.fr() ?? '').trim());

  readonly valeur = computed(() => (this.langue() === 'fr' ? this.fr() : this.en()) ?? '');

  ecrire(valeur: string): void {
    if (this.langue() === 'fr') this.fr.set(valeur);
    else this.en.set(valeur);
  }

  /** Point de départ d'une traduction : on recopie le français et on adapte. */
  copierLeFrancais(): void {
    this.en.set(this.fr() ?? '');
    this.langue.set('en');
  }

  identifiant(): string {
    return `i18n-${this.libelle().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }
}
