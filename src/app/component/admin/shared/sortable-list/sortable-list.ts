import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  TemplateRef,
  inject,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { Notifications } from '../../core/notifications.service';

/** Tout élément triable possède au minimum un identifiant. */
export interface ElementTriable {
  id: string;
}

/**
 * Liste réordonnable par glisser-déposer.
 *
 * Deux partis pris d'ergonomie :
 *  - une **poignée visible (⠿)** à gauche de chaque ligne. Un élément déplaçable
 *    sans poignée, personne ne le devine ;
 *  - **aucun bouton « Enregistrer l'ordre »**. Le nouvel ordre part au serveur dès
 *    que l'on lâche la ligne, et un toast confirme. Un ordre qu'on oublie de
 *    sauvegarder est un ordre perdu.
 *
 * La liste est aussi utilisable au clavier : Tab jusqu'à une poignée, puis les
 * flèches haut/bas déplacent la ligne.
 */
@Component({
  selector: 'app-sortable-list',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './sortable-list.html',
  styleUrl: './sortable-list.scss'
})
export class SortableList<T extends ElementTriable> {
  private readonly notif = inject(Notifications);

  /** Les éléments, dans leur ordre actuel. Modifiés en place au déplacement. */
  readonly elements = model.required<T[]>();

  /**
   * Appelée au dépôt avec les ids dans le nouvel ordre. Le composant appelant
   * branche ici `api.membres.reordonner`, `api.jalons.reordonner`, etc.
   */
  readonly reordonner = input<((ids: string[]) => Promise<unknown>) | null>(null);

  /** Nom au singulier, utilisé dans les messages : « joueur », « jalon »… */
  readonly nomElement = input('élément');
  /** Message affiché quand la liste est vide. */
  readonly messageVide = input('Aucun élément pour le moment.');
  /** Masque la poignée quand la liste ne contient qu'un seul élément. */
  readonly desactive = input(false);

  /** Émis après un déplacement réussi, avec la liste réordonnée. */
  readonly ordreChange = output<T[]>();

  /** Gabarit d'une ligne, projeté par le composant appelant via `<ng-template #ligne>`. */
  @ContentChild('ligne', { static: false }) gabaritProjete?: TemplateRef<unknown>;

  /**
   * Gabarit passé explicitement en entrée. Indispensable quand deux listes sont
   * imbriquées (les chapitres et leurs jalons) : deux `#ligne` dans le même
   * gabarit seraient ambigus pour la requête de contenu.
   */
  readonly gabarit = input<TemplateRef<unknown> | null>(null);

  gabaritLigne(): TemplateRef<unknown> | null {
    return this.gabarit() ?? this.gabaritProjete ?? null;
  }

  readonly enregistrement = signal(false);

  async surDepot(evenement: CdkDragDrop<T[]>): Promise<void> {
    if (evenement.previousIndex === evenement.currentIndex) return;
    await this.deplacer(evenement.previousIndex, evenement.currentIndex);
  }

  /** Déplacement au clavier : flèche haut / flèche bas sur la poignée. */
  async surToucheePoignee(evenement: KeyboardEvent, index: number): Promise<void> {
    let cible: number | null = null;
    if (evenement.key === 'ArrowUp') cible = index - 1;
    if (evenement.key === 'ArrowDown') cible = index + 1;
    if (cible === null) return;

    evenement.preventDefault();
    if (cible < 0 || cible >= this.elements().length) return;
    await this.deplacer(index, cible);

    // On garde le focus sur la poignée déplacée pour enchaîner les déplacements.
    const poignees = (evenement.target as HTMLElement)
      .closest('[data-liste-triable]')
      ?.querySelectorAll<HTMLElement>('[data-poignee]');
    poignees?.[cible]?.focus();
  }

  private async deplacer(depuis: number, vers: number): Promise<void> {
    const avant = [...this.elements()];
    const apres = [...avant];
    moveItemInArray(apres, depuis, vers);

    // Optimiste : l'affichage bouge tout de suite, on annule si le serveur refuse.
    this.elements.set(apres);
    this.ordreChange.emit(apres);

    const envoyer = this.reordonner();
    if (!envoyer) return;

    this.enregistrement.set(true);
    try {
      await envoyer(apres.map(e => e.id));
      this.notif.succes('Ordre enregistré.', 'Ordre mis à jour');
    } catch (err) {
      this.elements.set(avant);
      this.ordreChange.emit(avant);
      this.notif.erreur(err, "enregistrer le nouvel ordre");
    } finally {
      this.enregistrement.set(false);
    }
  }
}
