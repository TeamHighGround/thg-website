import { Injectable } from "@angular/core";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { from, map, Observable } from "rxjs";

/**
 * Browser loader. The translations are pulled in by dynamic import, so the build
 * emits them as hashed chunks: a deploy that changes a text also changes the
 * chunk URL, and no browser can keep a stale copy (a fixed `assets/i18n/fr.json`
 * URL left returning visitors with old texts and raw keys after hydration).
 * The server keeps its own loader (`transloco-loader.server.ts`).
 */
@Injectable({ providedIn: 'root' })
export class TranslocoBrowserLoader implements TranslocoLoader {
    getTranslation(lang: string): Observable<Translation> {
        const file = lang === 'en'
            ? import('../../assets/i18n/en.json')
            : import('../../assets/i18n/fr.json');
        return from(file).pipe(map((module) => module.default));
    }
}
