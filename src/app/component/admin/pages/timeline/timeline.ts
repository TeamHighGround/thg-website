import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AdminApiService } from '../../core/admin-api.service';
import { Chapitre, Jalon } from '../../core/admin-api.types';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';
import { SortableList } from '../../shared/sortable-list/sortable-list';
import { ChapterDialog } from './chapter-dialog/chapter-dialog';
import { MilestoneDialog } from './milestone-dialog/milestone-dialog';

/**
 * Écran Timeline : les chapitres, et les dates de chaque chapitre.
 *
 * Deux niveaux de tri, tous deux par glisser-déposer. Un chapitre se replie pour
 * ne pas noyer la page quand il contient une douzaine de dates.
 */
@Component({
  selector: 'app-admin-timeline',
  standalone: true,
  imports: [CommonModule, PageHeader, SortableList, ChapterDialog, MilestoneDialog],
  templateUrl: './timeline.html'
})
export class AdminTimeline {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly chargement = signal(true);
  readonly chapitres = signal<Chapitre[]>([]);
  /** Jalons regroupés par chapitre, chacun trié par `order`. */
  readonly jalons = signal<Record<string, Jalon[]>>({});
  readonly deplies = signal<Set<string>>(new Set());

  readonly dialogueChapitre = signal(false);
  readonly chapitreEnCours = signal<Chapitre | null>(null);
  readonly dialogueJalon = signal(false);
  readonly jalonEnCours = signal<Jalon | null>(null);
  readonly chapitreDuJalon = signal<string>('');

  constructor() {
    void this.charger();
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const [chapitres, jalons] = await Promise.all([
        this.api.chapitres.liste(),
        this.api.jalons.liste()
      ]);
      this.chapitres.set([...chapitres].sort((a, b) => a.order - b.order));
      this.regrouper(jalons);
      // Premier chapitre ouvert d'office : on voit tout de suite à quoi ça ressemble.
      const premier = this.chapitres()[0];
      if (premier) this.deplies.set(new Set([premier.id]));
    } catch (err) {
      this.notif.erreur(err, 'charger la timeline');
    } finally {
      this.chargement.set(false);
    }
  }

  private regrouper(jalons: Jalon[]): void {
    const parChapitre: Record<string, Jalon[]> = {};
    for (const jalon of [...jalons].sort((a, b) => a.order - b.order)) {
      (parChapitre[jalon.chapterId] ??= []).push(jalon);
    }
    this.jalons.set(parChapitre);
  }

  // ── Pliage ────────────────────────────────────────────────────────────────

  estDeplie(id: string): boolean {
    return this.deplies().has(id);
  }

  basculer(id: string): void {
    const suivant = new Set(this.deplies());
    suivant.has(id) ? suivant.delete(id) : suivant.add(id);
    this.deplies.set(suivant);
  }

  jalonsDe(id: string): Jalon[] {
    return this.jalons()[id] ?? [];
  }

  // ── Chapitres ─────────────────────────────────────────────────────────────

  reordonnerChapitres = (ids: string[]) => this.api.chapitres.reordonner(ids);

  ouvrirChapitre(chapitre: Chapitre | null, evenement?: Event): void {
    evenement?.stopPropagation();
    this.chapitreEnCours.set(chapitre);
    this.dialogueChapitre.set(true);
  }

  surChapitreEnregistre(chapitre: Chapitre): void {
    const existe = this.chapitres().some(c => c.id === chapitre.id);
    this.chapitres.set(
      existe
        ? this.chapitres().map(c => (c.id === chapitre.id ? chapitre : c))
        : [...this.chapitres(), chapitre]
    );
  }

  supprimerChapitre(chapitre: Chapitre, evenement: Event): void {
    evenement.stopPropagation();
    const nombre = this.jalonsDe(chapitre.id).length;
    this.notif.confirmerSuppression({
      quoi: `le chapitre « ${chapitre.titleFr} »`,
      consequence: nombre
        ? `Ses ${nombre} date${nombre > 1 ? 's' : ''} seront supprimées avec lui. Cette action est définitive.`
        : 'Cette action est définitive.',
      action: async () => {
        try {
          await this.api.chapitres.supprimer(chapitre.id);
          this.chapitres.set(this.chapitres().filter(c => c.id !== chapitre.id));
          this.notif.succes('Chapitre supprimé.');
        } catch (err) {
          this.notif.erreur(err, 'supprimer le chapitre');
        }
      }
    });
  }

  // ── Jalons ────────────────────────────────────────────────────────────────

  reordonnerJalons = (ids: string[]) => this.api.jalons.reordonner(ids);

  majJalons(chapitreId: string, liste: Jalon[]): void {
    this.jalons.set({ ...this.jalons(), [chapitreId]: liste });
  }

  ouvrirJalon(chapitreId: string, jalon: Jalon | null, evenement?: Event): void {
    evenement?.stopPropagation();
    this.chapitreDuJalon.set(chapitreId);
    this.jalonEnCours.set(jalon);
    this.dialogueJalon.set(true);
  }

  surJalonEnregistre(jalon: Jalon): void {
    const liste = this.jalonsDe(jalon.chapterId);
    const existe = liste.some(j => j.id === jalon.id);
    this.majJalons(
      jalon.chapterId,
      existe ? liste.map(j => (j.id === jalon.id ? jalon : j)) : [...liste, jalon]
    );
  }

  supprimerJalon(jalon: Jalon, evenement: Event): void {
    evenement.stopPropagation();
    this.notif.confirmerSuppression({
      quoi: `la date « ${jalon.titleFr} »`,
      action: async () => {
        try {
          await this.api.jalons.supprimer(jalon.id);
          this.majJalons(
            jalon.chapterId,
            this.jalonsDe(jalon.chapterId).filter(j => j.id !== jalon.id)
          );
          this.notif.succes('Date supprimée.');
        } catch (err) {
          this.notif.erreur(err, 'supprimer la date');
        }
      }
    });
  }
}
