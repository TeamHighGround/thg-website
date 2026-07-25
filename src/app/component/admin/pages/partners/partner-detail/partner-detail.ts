import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminApiService } from '../../../core/admin-api.service';
import { ImagePartenaire, Media, Partenaire, ReseauxSociaux } from '../../../core/admin-api.types';
import { PeutContenirDesModifications } from '../../../core/modifications-non-enregistrees.guard';
import { Notifications } from '../../../core/notifications.service';
import { I18nField } from '../../../shared/i18n-field/i18n-field';
import { ImageDrop } from '../../../shared/image-drop/image-drop';
import { PageHeader } from '../../../shared/page-header/page-header';
import { PublishToggle } from '../../../shared/publish-toggle/publish-toggle';
import { SaveBar } from '../../../shared/save-bar/save-bar';
import { SortableList } from '../../../shared/sortable-list/sortable-list';
import { RESEAUX_PARTENAIRE, SocialLinks } from '../../../shared/social-links/social-links';
import { TagsField } from '../../../shared/tags-field/tags-field';

/** Élément de galerie tel que manipulé dans l'écran (triable, donc identifiable). */
interface ImageGalerie {
  id: string;
  media: Media;
}

/**
 * Fiche complète d'un partenaire ou d'un ambassadeur.
 *
 * Tout se sauvegarde d'un bloc via la barre du bas, galerie comprise : la galerie
 * n'a pas d'endpoint de réordonnancement dédié au contrat, son ordre part donc
 * dans le `PATCH` de la fiche.
 */
@Component({
  selector: 'app-admin-partner-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeader,
    I18nField,
    ImageDrop,
    PublishToggle,
    SaveBar,
    SortableList,
    SocialLinks,
    TagsField
  ],
  templateUrl: './partner-detail.html'
})
export class AdminPartnerDetail implements PeutContenirDesModifications {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);
  private readonly route = inject(ActivatedRoute);

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  readonly reseauxPartenaire = RESEAUX_PARTENAIRE;

  readonly chargement = signal(true);
  readonly entree = signal<Partenaire | null>(null);
  readonly enregistrement = signal(false);

  readonly nom = signal('');
  readonly descriptionFr = signal<string | null>('');
  readonly descriptionEn = signal<string | null>('');
  readonly typesFr = signal<string[]>([]);
  readonly typesEn = signal<string[]>([]);
  readonly galerie = signal<ImageGalerie[]>([]);
  readonly reseaux = signal<ReseauxSociaux>({});
  readonly publie = signal(false);

  /** Champ d'ajout : à chaque image envoyée, elle rejoint la galerie. */
  readonly nouvelleImage = signal<Media | null>(null);

  readonly estAmbassadeur = computed(() => this.entree()?.kind === 'AMBASSADOR');
  readonly retour = computed(() => [
    this.estAmbassadeur() ? '/admin/ambassadeurs' : '/admin/partenaires'
  ]);
  readonly pagePublique = computed(() =>
    this.estAmbassadeur() ? '/ambassadors' : '/partners'
  );

  private readonly reference = signal('');

  readonly etatCourant = computed(() =>
    JSON.stringify({
      nom: this.nom(),
      descriptionFr: this.descriptionFr(),
      descriptionEn: this.descriptionEn(),
      typesFr: this.typesFr(),
      typesEn: this.typesEn(),
      galerie: this.galerie().map(i => i.media.id),
      reseaux: this.reseaux(),
      publie: this.publie()
    })
  );

  readonly modifie = computed(() => !!this.reference() && this.etatCourant() !== this.reference());

  aDesModifications(): boolean {
    return this.modifie();
  }

  constructor() {
    void this.charger();

    // Une image envoyée dans le champ d'ajout rejoint la galerie et libère le champ.
    // (Effet volontairement simple : pas de `effect()`, on réagit au changement.)
  }

  private async charger(): Promise<void> {
    this.chargement.set(true);
    try {
      const entree = await this.api.partenaires.detail(this.id);
      this.entree.set(entree);
      this.appliquer(entree);
    } catch (err) {
      this.notif.erreur(err, 'charger la fiche');
    } finally {
      this.chargement.set(false);
    }
  }

  private appliquer(entree: Partenaire): void {
    this.nom.set(entree.name);
    this.descriptionFr.set(entree.descriptionFr ?? '');
    this.descriptionEn.set(entree.descriptionEn ?? '');
    this.typesFr.set([...(entree.typesFr ?? [])]);
    this.typesEn.set([...(entree.typesEn ?? [])]);
    this.galerie.set(
      [...(entree.images ?? [])]
        .sort((a, b) => a.order - b.order)
        .filter((i): i is ImagePartenaire & { media: Media } => !!i.media)
        .map(i => ({ id: i.id ?? i.media.id, media: i.media }))
    );
    this.reseaux.set({
      website: entree.website ?? null,
      instagram: entree.instagram ?? null,
      twitter: entree.twitter ?? null,
      twitch: entree.twitch ?? null,
      youtube: entree.youtube ?? null,
      tiktok: entree.tiktok ?? null,
      soundcloud: entree.soundcloud ?? null
    });
    this.publie.set(entree.published);
    this.reference.set(this.etatCourant());
  }

  // ── Galerie ───────────────────────────────────────────────────────────────

  /** Appelée dès qu'une image est envoyée dans le champ d'ajout. */
  ajouterAGalerie(media: Media | null): void {
    if (!media) return;
    if (this.galerie().some(i => i.media.id === media.id)) {
      this.notif.info('Cette image est déjà dans la galerie.');
    } else {
      this.galerie.set([...this.galerie(), { id: media.id, media }]);
    }
    // Le champ redevient vide, prêt pour l'image suivante.
    this.nouvelleImage.set(null);
  }

  retirerDeGalerie(image: ImageGalerie, evenement: Event): void {
    evenement.stopPropagation();
    this.galerie.set(this.galerie().filter(i => i.id !== image.id));
  }

  // ── Enregistrement ────────────────────────────────────────────────────────

  async enregistrer(): Promise<void> {
    const entree = this.entree();
    if (!entree) return;
    if (!this.nom().trim()) {
      this.notif.avertissement('Le nom ne peut pas être vide.');
      return;
    }

    this.enregistrement.set(true);
    try {
      const maj = await this.api.partenaires.modifier(entree.id, {
        name: this.nom().trim(),
        descriptionFr: (this.descriptionFr() ?? '').trim() || null,
        descriptionEn: (this.descriptionEn() ?? '').trim() || null,
        typesFr: this.typesFr(),
        typesEn: this.typesEn(),
        // Galerie ordonnée : l'index vaut l'ordre d'affichage sur le site.
        images: this.galerie().map((i, index) => ({
          mediaId: i.media.id,
          order: index
        })) as unknown as ImagePartenaire[],
        published: this.publie(),
        ...this.reseaux()
      });
      this.entree.set(maj);
      this.appliquer(maj);
      this.notif.succes('La fiche est enregistrée.');
    } catch (err) {
      this.notif.erreur(err, 'enregistrer la fiche');
    } finally {
      this.enregistrement.set(false);
    }
  }

  annuler(): void {
    const entree = this.entree();
    if (entree) this.appliquer(entree);
  }
}
