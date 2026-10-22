
import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-privacy-policy',
  imports: [TranslocoModule],
  templateUrl: './privacy-policy.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './privacy-policy.scss'
})
export class PrivacyPolicy {
  private readonly transloco = inject(TranslocoService);

  /**
   * Liste « ce que nous ne collectons pas ».
   *
   * Transloco **aplatit** les tableaux des fichiers de traduction : la clé
   * `privacyPolicy.noCollection.items` n'existe pas comme tableau, seulement
   * `items.0`, `items.1`… Le gabarit itérait donc sur une valeur non itérable,
   * ce qui levait NG0901 à chaque prérendu.
   *
   * `selectTranslateObject` reconstruit la structure d'origine et suit les
   * changements de langue.
   */
  private readonly brut = toSignal(
    this.transloco.selectTranslateObject<unknown>('privacyPolicy.noCollection.items'),
    { initialValue: undefined }
  );

  /** Toujours un tableau : la reconstruction peut rendre un objet indexé. */
  readonly pointsNonCollectes = computed<string[]>(() => {
    const valeur = this.brut();
    if (Array.isArray(valeur)) return valeur as string[];
    if (valeur && typeof valeur === 'object') {
      return Object.values(valeur as Record<string, string>);
    }
    return [];
  });
}
