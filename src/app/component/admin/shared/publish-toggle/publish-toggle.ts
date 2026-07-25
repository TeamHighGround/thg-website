import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

/**
 * Interrupteur « Visible sur le site ».
 *
 * Le mot « publié » est du vocabulaire de développeur ; « visible sur le site »
 * décrit ce que l'utilisateur constate réellement. L'explication sous
 * l'interrupteur lève le dernier doute.
 *
 * Rappel : à la création, l'API met `published` à `false` — mieux vaut oublier de
 * publier que publier un roster incomplet.
 */
@Component({
  selector: 'app-publish-toggle',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchModule],
  templateUrl: './publish-toggle.html'
})
export class PublishToggle {
  readonly publie = model.required<boolean>();
  /** Nom de l'élément, injecté dans l'explication : « ce joueur », « cet article »… */
  readonly nomElement = input('cet élément');
  readonly desactive = input(false);
}
