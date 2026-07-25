import { Observable, catchError, map, of, startWith } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from './models';

/**
 * État d'un appel API, tel que consommé par les composants.
 *
 * On ne laisse jamais une erreur réseau remonter jusqu'au rendu : une page qui
 * ne s'affiche plus du tout parce que l'API est tombée est un échec. Les
 * composants lisent `status` et affichent un état dégradé lisible.
 */
export type ApiState<T> =
  | { status: 'loading'; data: null; message: null }
  | { status: 'ready'; data: T; message: null }
  | { status: 'error'; data: null; message: string };

export const API_LOADING: ApiState<never> = { status: 'loading', data: null, message: null };

/** Message générique quand l'API ne renvoie rien d'exploitable. */
const MESSAGE_PAR_DEFAUT = "Les données n'ont pas pu être chargées.";

/**
 * Extrait le message lisible du corps d'erreur normalisé par le contrat, en
 * retombant sur un texte générique si la réponse n'a pas la forme attendue
 * (API injoignable, proxy en erreur, page HTML renvoyée par nginx…).
 */
export function messageDErreur(erreur: unknown): string {
  if (erreur instanceof HttpErrorResponse) {
    const corps = erreur.error as Partial<ApiErrorBody> | string | null;
    if (corps && typeof corps === 'object' && corps.error?.message) {
      return corps.error.message;
    }
  }
  return MESSAGE_PAR_DEFAUT;
}

/**
 * Transforme un flux HTTP brut en flux d'`ApiState` : `loading` d'abord,
 * puis `ready` ou `error`. L'observable résultant ne peut pas échouer.
 */
export function versApiState<T>(source$: Observable<T>): Observable<ApiState<T>> {
  return source$.pipe(
    map((data): ApiState<T> => ({ status: 'ready', data, message: null })),
    catchError((erreur) =>
      of<ApiState<T>>({ status: 'error', data: null, message: messageDErreur(erreur) })
    ),
    startWith(API_LOADING as ApiState<T>)
  );
}
