import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  input,
  model,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../core/admin-api.service';
import { Media } from '../../core/admin-api.types';
import { messageErreur, tailleLisible } from '../../core/admin-erreurs';
import { Notifications } from '../../core/notifications.service';

/** Types réellement acceptés par l'API (vérifiés côté serveur par magic bytes). */
const TYPES_ACCEPTES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
/** Limite imposée par l'API : 10 Mo. On la vérifie ici pour éviter un aller-retour. */
const TAILLE_MAX = 10 * 1024 * 1024;

/**
 * Le champ image du panel — de loin le composant le plus utilisé.
 *
 * Trois façons d'ajouter une image, parce que chacun a son réflexe :
 *  1. glisser le fichier depuis l'explorateur Windows sur la zone ;
 *  2. cliquer sur la zone, ce qui ouvre le sélecteur de fichiers de Windows ;
 *  3. faire Ctrl+V après avoir copié une image (capture d'écran, page web…).
 *
 * Tout est immédiat : aperçu local avant même la fin de l'envoi, barre de
 * progression pendant, et un message en français clair si ça se passe mal.
 */
@Component({
  selector: 'app-image-drop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-drop.html',
  styleUrl: './image-drop.scss'
})
export class ImageDrop implements OnInit, OnDestroy {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);
  private readonly plateforme = inject(PLATFORM_ID);

  /** Image actuellement associée. `null` = aucune. */
  readonly media = model<Media | null>(null);

  /** Intitulé affiché au-dessus de la zone. */
  readonly libelle = input('Image');
  /** Phrase d'aide sous la zone : format attendu, dimensions conseillées… */
  readonly aide = input('');
  /** Proportion de l'aperçu, en classes Tailwind (`aspect-square`, `aspect-video`…). */
  readonly proportion = input('aspect-video');
  /** Affiche ou non le champ « Texte alternatif ». */
  readonly avecTexteAlternatif = input(true);
  /** Rend l'image obligatoire visuellement (astérisque). */
  readonly obligatoire = input(false);

  @ViewChild('champFichier') champFichier?: ElementRef<HTMLInputElement>;

  readonly survol = signal(false);
  readonly focus = signal(false);
  readonly envoiEnCours = signal(false);
  readonly progression = signal(0);
  readonly erreur = signal<string | null>(null);
  /** Aperçu local affiché avant que le serveur ait répondu. */
  readonly apercuLocal = signal<string | null>(null);
  readonly texteAlternatif = signal('');

  /** URL affichée : l'aperçu local s'il existe, sinon l'image enregistrée. */
  readonly apercu = computed(() => this.apercuLocal() ?? this.media()?.url ?? null);

  private ecouteurCollage?: (e: ClipboardEvent) => void;

  ngOnInit(): void {
    this.texteAlternatif.set(this.media()?.altFr ?? this.media()?.alt ?? '');

    // Le collage n'est écouté que dans le navigateur : `document` n'existe pas
    // au rendu serveur (cf. règles SSR du projet).
    if (isPlatformBrowser(this.plateforme)) {
      this.ecouteurCollage = (evenement: ClipboardEvent) => this.surCollage(evenement);
      document.addEventListener('paste', this.ecouteurCollage);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.plateforme) && this.ecouteurCollage) {
      document.removeEventListener('paste', this.ecouteurCollage);
    }
    this.libererApercu();
  }

  // ── Ouverture du sélecteur Windows ────────────────────────────────────────

  ouvrirSelecteur(): void {
    if (this.envoiEnCours()) return;
    this.champFichier?.nativeElement.click();
  }

  surSelection(evenement: Event): void {
    const champ = evenement.target as HTMLInputElement;
    const fichier = champ.files?.[0];
    if (fichier) this.traiter(fichier);
    // Réinitialisé pour pouvoir resélectionner le même fichier deux fois de suite.
    champ.value = '';
  }

  // ── Glisser-déposer ───────────────────────────────────────────────────────

  surSurvolFichier(evenement: DragEvent): void {
    evenement.preventDefault();
    evenement.stopPropagation();
    if (!this.envoiEnCours()) this.survol.set(true);
  }

  surSortieFichier(evenement: DragEvent): void {
    evenement.preventDefault();
    evenement.stopPropagation();
    this.survol.set(false);
  }

  surDepot(evenement: DragEvent): void {
    evenement.preventDefault();
    evenement.stopPropagation();
    this.survol.set(false);
    if (this.envoiEnCours()) return;

    const fichier = evenement.dataTransfer?.files?.[0];
    if (fichier) this.traiter(fichier);
  }

  // ── Collage (Ctrl+V) ──────────────────────────────────────────────────────

  private surCollage(evenement: ClipboardEvent): void {
    // On ne réagit que si la souris survole la zone ou si elle a le focus clavier :
    // sinon un Ctrl+V dans un champ texte remplacerait l'image sans prévenir.
    if (!this.survol() && !this.focus()) return;
    if (this.envoiEnCours()) return;

    const elements = Array.from(evenement.clipboardData?.items ?? []);
    const image = elements.find(e => e.type.startsWith('image/'));
    if (!image) return;

    const fichier = image.getAsFile();
    if (fichier) {
      evenement.preventDefault();
      this.traiter(fichier);
    }
  }

  // ── Envoi ─────────────────────────────────────────────────────────────────

  private traiter(fichier: File): void {
    this.erreur.set(null);

    const probleme = this.verifier(fichier);
    if (probleme) {
      this.erreur.set(probleme);
      return;
    }

    // Aperçu instantané : l'utilisateur voit son image avant même l'envoi.
    if (isPlatformBrowser(this.plateforme)) {
      this.libererApercu();
      this.apercuLocal.set(URL.createObjectURL(fichier));
    }

    this.envoiEnCours.set(true);
    this.progression.set(0);

    this.api.envoyerImage(fichier).subscribe({
      next: etat => {
        if (etat.statut === 'progression') {
          this.progression.set(etat.pourcentage);
        } else {
          this.progression.set(100);
          this.envoiEnCours.set(false);
          this.libererApercu();
          this.media.set(etat.media);
          this.texteAlternatif.set(etat.media.altFr ?? '');
          this.notif.succes('Image ajoutée.');
        }
      },
      error: err => {
        this.envoiEnCours.set(false);
        this.libererApercu();
        this.erreur.set(messageErreur(err, "envoyer l'image"));
      }
    });
  }

  /** Contrôles faits ici pour donner une réponse immédiate, sans attendre le serveur. */
  private verifier(fichier: File): string | null {
    if (fichier.size > TAILLE_MAX) {
      return `Ce fichier fait ${tailleLisible(fichier.size)}, la limite est de 10 Mo. Réduisez l'image puis réessayez.`;
    }
    if (fichier.type && !TYPES_ACCEPTES.includes(fichier.type)) {
      return `Ce fichier n'est pas une image acceptée. Formats possibles : JPG, PNG, WebP ou AVIF.`;
    }
    if (fichier.size === 0) {
      return 'Ce fichier est vide.';
    }
    return null;
  }

  // ── Actions sur l'image en place ──────────────────────────────────────────

  retirer(evenement?: Event): void {
    evenement?.stopPropagation();
    this.media.set(null);
    this.texteAlternatif.set('');
    this.erreur.set(null);
  }

  remplacer(evenement?: Event): void {
    evenement?.stopPropagation();
    this.ouvrirSelecteur();
  }

  /** Le texte alternatif est enregistré sur le média lui-même, pas sur la fiche. */
  enregistrerTexteAlternatif(): void {
    const image = this.media();
    if (!image) return;
    const valeur = this.texteAlternatif().trim();
    if ((image.altFr ?? '') === valeur) return;

    this.api
      .modifierMedia(image.id, { altFr: valeur })
      .then(() => this.media.set({ ...image, altFr: valeur, alt: valeur }))
      .catch(err => this.notif.erreur(err, 'enregistrer le texte alternatif'));
  }

  /** Accessibilité : Entrée ou Espace ouvre le sélecteur, comme un clic. */
  surTouche(evenement: KeyboardEvent): void {
    if (evenement.key === 'Enter' || evenement.key === ' ') {
      evenement.preventDefault();
      this.ouvrirSelecteur();
    }
  }

  private libererApercu(): void {
    const url = this.apercuLocal();
    if (url && isPlatformBrowser(this.plateforme)) URL.revokeObjectURL(url);
    this.apercuLocal.set(null);
  }
}
