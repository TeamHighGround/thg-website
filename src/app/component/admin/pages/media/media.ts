import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AdminApiService } from '../../core/admin-api.service';
import { MediaItem } from '../../core/admin-api.types';
import { messageErreur, tailleLisible } from '../../core/admin-erreurs';
import { Notifications } from '../../core/notifications.service';
import { PageHeader } from '../../shared/page-header/page-header';

/** Suivi d'un envoi en cours dans la file. */
interface EnvoiEnCours {
  nom: string;
  pourcentage: number;
  erreur?: string;
}

const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const TAILLE_MAX = 10 * 1024 * 1024;

/**
 * Médiathèque : toutes les images du site au même endroit.
 *
 * L'envoi accepte plusieurs fichiers d'un coup, glissés depuis l'explorateur.
 * Chaque vignette indique combien de fois l'image est utilisée : quand ce nombre
 * n'est pas zéro, la suppression est bloquée AVANT même d'être tentée, avec
 * l'explication. C'est ce qui empêche de casser une page du site sans le voir.
 */
@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, PageHeader],
  templateUrl: './media.html',
  styleUrl: './media.scss'
})
export class AdminMedia {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);
  private readonly plateforme = inject(PLATFORM_ID);

  readonly chargement = signal(true);
  readonly medias = signal<MediaItem[]>([]);
  readonly recherche = signal('');
  readonly survol = signal(false);
  readonly envois = signal<EnvoiEnCours[]>([]);

  readonly selection = signal<MediaItem | null>(null);
  readonly altFr = signal('');
  readonly altEn = signal('');
  readonly enregistrementAlt = signal(false);

  readonly resultats = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const liste = this.medias();
    if (!terme) return liste;
    return liste.filter(
      m =>
        m.originalName?.toLowerCase().includes(terme) ||
        (m.altFr ?? '').toLowerCase().includes(terme) ||
        (m.altEn ?? '').toLowerCase().includes(terme)
    );
  });

  constructor() {
    void this.charger();
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      this.medias.set(await this.api.listeMedias());
    } catch (err) {
      this.notif.erreur(err, 'charger la médiathèque');
    } finally {
      this.chargement.set(false);
    }
  }

  // ── Envoi multiple ────────────────────────────────────────────────────────

  surSurvolFichier(evenement: DragEvent): void {
    evenement.preventDefault();
    this.survol.set(true);
  }

  surSortieFichier(evenement: DragEvent): void {
    evenement.preventDefault();
    this.survol.set(false);
  }

  surDepot(evenement: DragEvent): void {
    evenement.preventDefault();
    this.survol.set(false);
    this.envoyer(Array.from(evenement.dataTransfer?.files ?? []));
  }

  surSelection(evenement: Event): void {
    const champ = evenement.target as HTMLInputElement;
    this.envoyer(Array.from(champ.files ?? []));
    champ.value = '';
  }

  private envoyer(fichiers: File[]): void {
    if (!fichiers.length) return;

    for (const fichier of fichiers) {
      const probleme = this.verifier(fichier);
      if (probleme) {
        this.notif.avertissement(`${fichier.name} : ${probleme}`, 'Fichier refusé');
        continue;
      }

      const suivi: EnvoiEnCours = { nom: fichier.name, pourcentage: 0 };
      this.envois.set([...this.envois(), suivi]);

      this.api.envoyerImage(fichier).subscribe({
        next: etat => {
          if (etat.statut === 'progression') {
            this.majEnvoi(suivi, { pourcentage: etat.pourcentage });
          } else {
            this.retirerEnvoi(suivi);
            this.medias.set([etat.media, ...this.medias()]);
            this.notif.succes(`${fichier.name} a été ajouté à la médiathèque.`);
          }
        },
        error: err => {
          this.retirerEnvoi(suivi);
          this.notif.avertissement(
            `${fichier.name} : ${messageErreur(err, "envoyer l'image")}`,
            'Envoi échoué'
          );
        }
      });
    }
  }

  private majEnvoi(suivi: EnvoiEnCours, champs: Partial<EnvoiEnCours>): void {
    this.envois.set(this.envois().map(e => (e === suivi ? Object.assign(e, champs) : e)));
  }

  private retirerEnvoi(suivi: EnvoiEnCours): void {
    this.envois.set(this.envois().filter(e => e !== suivi));
  }

  private verifier(fichier: File): string | null {
    if (fichier.size > TAILLE_MAX) {
      return `ce fichier fait ${tailleLisible(fichier.size)}, la limite est de 10 Mo.`;
    }
    if (fichier.type && !TYPES_ACCEPTES.includes(fichier.type)) {
      return 'seules les images JPG, PNG, WebP et AVIF sont acceptées.';
    }
    return null;
  }

  ouvrirSelecteur(champ: HTMLInputElement): void {
    if (isPlatformBrowser(this.plateforme)) champ.click();
  }

  // ── Détail d'une image ────────────────────────────────────────────────────

  ouvrir(media: MediaItem): void {
    this.selection.set(media);
    this.altFr.set(media.altFr ?? '');
    this.altEn.set(media.altEn ?? '');
  }

  fermer(): void {
    this.selection.set(null);
  }

  async enregistrerAlt(): Promise<void> {
    const media = this.selection();
    if (!media) return;

    this.enregistrementAlt.set(true);
    try {
      await this.api.modifierMedia(media.id, {
        altFr: this.altFr().trim() || null,
        altEn: this.altEn().trim() || null
      });
      const maj = { ...media, altFr: this.altFr().trim(), altEn: this.altEn().trim() };
      this.medias.set(this.medias().map(m => (m.id === media.id ? maj : m)));
      this.selection.set(maj);
      this.notif.succes('Textes alternatifs enregistrés.');
    } catch (err) {
      this.notif.erreur(err, 'enregistrer les textes alternatifs');
    } finally {
      this.enregistrementAlt.set(false);
    }
  }

  supprimer(media: MediaItem): void {
    // Blocage local AVANT l'appel : l'utilisateur comprend pourquoi, tout de suite.
    if (media.usageCount > 0) {
      this.notif.avertissement(
        `Cette image est utilisée à ${media.usageCount} endroit${
          media.usageCount > 1 ? 's' : ''
        } du site. Retirez-la d'abord de ces pages, puis revenez la supprimer.`,
        'Suppression impossible'
      );
      return;
    }

    this.notif.confirmerSuppression({
      quoi: `l'image « ${media.originalName || media.url} »`,
      consequence: "Le fichier sera effacé du serveur. Cette action est définitive.",
      action: async () => {
        try {
          await this.api.supprimerMedia(media.id);
          this.medias.set(this.medias().filter(m => m.id !== media.id));
          this.fermer();
          this.notif.succes('Image supprimée.');
        } catch (err) {
          this.notif.erreur(err, "supprimer l'image");
        }
      }
    });
  }

  poids(media: MediaItem): string {
    return tailleLisible(media.sizeBytes ?? 0);
  }
}
