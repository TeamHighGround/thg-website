import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AdminApiService } from '../../../core/admin-api.service';
import { Jalon, Media } from '../../../core/admin-api.types';
import { Notifications } from '../../../core/notifications.service';
import { slugifier } from '../../../core/slug';
import { I18nField } from '../../../shared/i18n-field/i18n-field';
import { ImageDrop } from '../../../shared/image-drop/image-drop';
import { PublishToggle } from '../../../shared/publish-toggle/publish-toggle';
import { TagsField } from '../../../shared/tags-field/tags-field';

/**
 * Fiche d'un jalon : une date marquante à l'intérieur d'un chapitre.
 *
 * Les dimensions de l'image ne sont pas demandées : elles sont déduites du
 * fichier envoyé par le serveur. C'était l'un des points les plus pénibles de
 * l'ancien fonctionnement, où il fallait les saisir à la main.
 */
@Component({
  selector: 'app-milestone-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ToggleSwitchModule,
    I18nField,
    ImageDrop,
    PublishToggle,
    TagsField
  ],
  templateUrl: './milestone-dialog.html'
})
export class MilestoneDialog {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly ouvert = model(false);
  readonly jalon = input<Jalon | null>(null);
  readonly chapterId = input.required<string>();
  readonly enregistre = output<Jalon>();

  readonly dateFr = signal<string | null>('');
  readonly dateEn = signal<string | null>('');
  readonly titreFr = signal<string | null>('');
  readonly titreEn = signal<string | null>('');
  readonly descriptionFr = signal<string | null>('');
  readonly descriptionEn = signal<string | null>('');
  readonly resultatFr = signal<string | null>('');
  readonly resultatEn = signal<string | null>('');
  readonly image = signal<Media | null>(null);
  readonly roster = signal<string[]>([]);
  readonly badge = signal(false);
  readonly publie = signal(false);
  readonly enregistrement = signal(false);

  readonly estCreation = computed(() => !this.jalon());

  constructor() {
    effect(() => {
      if (!this.ouvert()) return;
      const j = this.jalon();
      this.dateFr.set(j?.dateLabelFr ?? '');
      this.dateEn.set(j?.dateLabelEn ?? '');
      this.titreFr.set(j?.titleFr ?? '');
      this.titreEn.set(j?.titleEn ?? '');
      this.descriptionFr.set(j?.descriptionFr ?? '');
      this.descriptionEn.set(j?.descriptionEn ?? '');
      this.resultatFr.set(j?.resultFr ?? '');
      this.resultatEn.set(j?.resultEn ?? '');
      this.image.set(j?.image ?? null);
      this.roster.set([...(j?.roster ?? [])]);
      this.badge.set(j?.hasBadge ?? false);
      this.publie.set(j?.published ?? false);
    });
  }

  async valider(): Promise<void> {
    const titre = (this.titreFr() ?? '').trim();
    if (!titre) {
      this.notif.avertissement('Le titre français du jalon est obligatoire.');
      return;
    }
    if (!(this.dateFr() ?? '').trim()) {
      this.notif.avertissement('Indiquez la date affichée, par exemple « Janvier 2026 ».');
      return;
    }

    const corps: Partial<Jalon> = {
      chapterId: this.chapterId(),
      dateLabelFr: (this.dateFr() ?? '').trim(),
      dateLabelEn: (this.dateEn() ?? '').trim(),
      titleFr: titre,
      titleEn: (this.titreEn() ?? '').trim(),
      descriptionFr: (this.descriptionFr() ?? '').trim() || null,
      descriptionEn: (this.descriptionEn() ?? '').trim() || null,
      resultFr: (this.resultatFr() ?? '').trim() || null,
      resultEn: (this.resultatEn() ?? '').trim() || null,
      imageId: this.image()?.id ?? null,
      roster: this.roster(),
      hasBadge: this.badge(),
      published: this.publie()
    };

    if (this.estCreation()) corps.slug = slugifier(titre);

    this.enregistrement.set(true);
    try {
      const existant = this.jalon();
      const resultat = existant
        ? await this.api.jalons.modifier(existant.id, corps)
        : await this.api.jalons.creer(corps);
      this.enregistre.emit(resultat);
      this.ouvert.set(false);
      this.notif.succes(existant ? 'Jalon mis à jour.' : 'Jalon ajouté au chapitre.');
    } catch (err) {
      this.notif.erreur(err, 'enregistrer le jalon');
    } finally {
      this.enregistrement.set(false);
    }
  }
}
