import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * En-tête commun à tous les écrans du panel.
 *
 * Trois informations toujours au même endroit : où je suis, à quoi sert cette
 * page (une phrase, pas un paragraphe), et comment revenir en arrière. Le bouton
 * « Voir sur le site » ouvre la page publique correspondante dans un nouvel
 * onglet, pour vérifier le rendu réel sans quitter le panel.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './page-header.html'
})
export class PageHeader {
  readonly titre = input.required<string>();
  /** Une phrase expliquant ce que l'on fait ici. */
  readonly description = input('');
  /** Lien de retour dans le panel (tableau de segments de route). */
  readonly retour = input<unknown[] | null>(null);
  readonly libelleRetour = input('Retour');
  /** URL publique correspondante, ex. `/teams/lol`. */
  readonly lienPublic = input<string | null>(null);
}
