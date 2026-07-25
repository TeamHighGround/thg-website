import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AdminApiService } from '../../../core/admin-api.service';
import { Chapitre } from '../../../core/admin-api.types';
import { Notifications } from '../../../core/notifications.service';
import { slugifier } from '../../../core/slug';
import { I18nField } from '../../../shared/i18n-field/i18n-field';
import { PublishToggle } from '../../../shared/publish-toggle/publish-toggle';

/** Fiche d'un chapitre de la timeline (le grand titre qui regroupe des jalons). */
@Component({
  selector: 'app-chapter-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, I18nField, PublishToggle],
  templateUrl: './chapter-dialog.html'
})
export class ChapterDialog {
  private readonly api = inject(AdminApiService);
  private readonly notif = inject(Notifications);

  readonly ouvert = model(false);
  readonly chapitre = input<Chapitre | null>(null);
  readonly enregistre = output<Chapitre>();

  readonly titreFr = signal<string | null>('');
  readonly titreEn = signal<string | null>('');
  readonly sousTitreFr = signal<string | null>('');
  readonly sousTitreEn = signal<string | null>('');
  readonly publie = signal(false);
  readonly enregistrement = signal(false);

  readonly estCreation = computed(() => !this.chapitre());

  constructor() {
    effect(() => {
      if (!this.ouvert()) return;
      const c = this.chapitre();
      this.titreFr.set(c?.titleFr ?? '');
      this.titreEn.set(c?.titleEn ?? '');
      this.sousTitreFr.set(c?.subtitleFr ?? '');
      this.sousTitreEn.set(c?.subtitleEn ?? '');
      this.publie.set(c?.published ?? false);
    });
  }

  async valider(): Promise<void> {
    const titre = (this.titreFr() ?? '').trim();
    if (!titre) {
      this.notif.avertissement('Le titre français du chapitre est obligatoire.');
      return;
    }

    const corps: Partial<Chapitre> = {
      titleFr: titre,
      titleEn: (this.titreEn() ?? '').trim(),
      subtitleFr: (this.sousTitreFr() ?? '').trim() || null,
      subtitleEn: (this.sousTitreEn() ?? '').trim() || null,
      published: this.publie()
    };

    // Le slug identifie le chapitre dans les URLs : généré à la création, jamais
    // modifié ensuite pour ne pas casser les liens existants.
    if (this.estCreation()) {
      corps.slug = slugifier(titre);
    }

    this.enregistrement.set(true);
    try {
      const existant = this.chapitre();
      const resultat = existant
        ? await this.api.chapitres.modifier(existant.id, corps)
        : await this.api.chapitres.creer(corps);
      this.enregistre.emit(resultat);
      this.ouvert.set(false);
      this.notif.succes(existant ? 'Chapitre mis à jour.' : 'Chapitre créé.');
    } catch (err) {
      this.notif.erreur(err, 'enregistrer le chapitre');
    } finally {
      this.enregistrement.set(false);
    }
  }
}
