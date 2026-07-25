import { CommonModule } from '@angular/common';
import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Saisie d'une liste de courts libellés (roster d'un jalon, types d'un
 * ambassadeur…).
 *
 * On tape, on valide avec Entrée ou une virgule, l'étiquette apparaît. Retour
 * arrière sur un champ vide supprime la dernière : c'est le comportement que tout
 * le monde connaît des champs de destinataires d'un e-mail.
 */
@Component({
  selector: 'app-tags-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tags-field.html'
})
export class TagsField {
  readonly valeurs = model.required<string[]>();
  readonly libelle = input.required<string>();
  readonly aide = input('Tapez un mot puis appuyez sur Entrée pour l\'ajouter.');
  readonly placeholder = input('Ajouter…');

  readonly saisie = signal('');

  surTouche(evenement: KeyboardEvent): void {
    if (evenement.key === 'Enter' || evenement.key === ',') {
      evenement.preventDefault();
      this.ajouter();
      return;
    }
    if (evenement.key === 'Backspace' && !this.saisie() && this.valeurs().length) {
      this.retirer(this.valeurs().length - 1);
    }
  }

  ajouter(): void {
    const valeur = this.saisie().trim();
    if (!valeur) return;
    // Doublon silencieusement ignoré : ré-ajouter deux fois « Kitano » n'a pas de sens.
    if (!this.valeurs().includes(valeur)) {
      this.valeurs.set([...this.valeurs(), valeur]);
    }
    this.saisie.set('');
  }

  retirer(index: number): void {
    this.valeurs.set(this.valeurs().filter((_, i) => i !== index));
  }
}
