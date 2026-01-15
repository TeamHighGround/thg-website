import { Injectable } from "@angular/core";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { Observable, of } from "rxjs";

import fr from '../../assets/i18n/fr.json';
import en from '../../assets/i18n/en.json';

const translations: Record<string, Translation> = { fr, en };

@Injectable({ providedIn: 'root' })
export class TranslocoServerLoader implements TranslocoLoader {
  getTranslation(lang: string): Observable<Translation> {
    return of(translations[lang] || translations['fr']);
  }
}
