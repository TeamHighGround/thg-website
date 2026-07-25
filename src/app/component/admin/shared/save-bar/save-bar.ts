import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

/**
 * Barre d'enregistrement collée en bas de l'écran.
 *
 * Elle n'apparaît que lorsqu'il y a quelque chose à enregistrer. Tant qu'elle est
 * visible, le travail n'est pas sauvegardé — c'est un rappel permanent, plus
 * fiable qu'un bouton perdu en haut de page que l'on oublie de cliquer.
 * Le guard `gardeModificationsNonEnregistrees` prend le relais si on quitte quand même.
 */
@Component({
  selector: 'app-save-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './save-bar.html',
  styleUrl: './save-bar.scss'
})
export class SaveBar {
  /** La barre est affichée uniquement si des champs ont changé. */
  readonly visible = input(false);
  /** Enregistrement en cours : boutons verrouillés. */
  readonly enregistrement = input(false);
  /** Bloque l'enregistrement (formulaire incomplet) et explique pourquoi. */
  readonly blocage = input<string | null>(null);
  readonly libelleEnregistrer = input('Enregistrer');

  readonly enregistrer = output<void>();
  readonly annuler = output<void>();
}
