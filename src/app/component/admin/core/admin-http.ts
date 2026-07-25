import { HttpClient, HttpErrorResponse, HttpEvent, HttpRequest } from '@angular/common/http';
import { PLATFORM_ID, Injectable, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NEVER, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_BASE_URL } from '../../../core/api/api-base-url';

/**
 * Couche HTTP du panel : elle joue le rôle d'intercepteur, mais sans en être un.
 *
 * Pourquoi pas un vrai `HttpInterceptor` ? Parce qu'un intercepteur ne peut être
 * enregistré qu'à la racine (`app.config.ts`), un fichier hors du périmètre de ce
 * chantier. Ce service centralise donc exactement les deux mêmes règles :
 *
 *  1. `withCredentials: true` sur TOUS les appels — la session est un cookie
 *     `httpOnly` (`thg_sid`), il n'est envoyé qu'à cette condition.
 *  2. Sur `401`, retour immédiat à l'écran de connexion, en mémorisant la page
 *     demandée pour y revenir après reconnexion.
 *
 * Toute requête du panel passe par ici. Aucun composant n'appelle `HttpClient`
 * directement.
 */
@Injectable({ providedIn: 'root' })
export class AdminHttp {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = inject(API_BASE_URL);

  /** Vrai le temps d'une tentative de connexion : évite la boucle de redirection. */
  private surEcranConnexion = false;

  /**
   * Le panel ne parle à l'API que depuis le navigateur.
   *
   * Les routes `/admin` sont en rendu client, mais leur coquille HTML est tout de
   * même générée au build : sans ce garde-fou, chaque écran lancerait ses appels
   * pendant la génération, sans cookie de session et souvent sans API démarrée.
   * Côté serveur on renvoie donc un flux qui n'émet jamais : l'écran reste sur
   * son état « Chargement… » figé dans le HTML, et tout démarre pour de bon à
   * l'hydratation.
   */
  private readonly navigateur = isPlatformBrowser(inject(PLATFORM_ID));

  url(chemin: string): string {
    return `${this.base}${chemin}`;
  }

  get<T>(chemin: string, params?: Record<string, string | number | boolean>): Observable<T> {
    if (!this.navigateur) return NEVER;
    return this.http
      .get<T>(this.url(chemin), { withCredentials: true, params: params as never })
      .pipe(catchError(e => this.gerer(e, chemin)));
  }

  post<T>(chemin: string, corps: unknown): Observable<T> {
    if (!this.navigateur) return NEVER;
    return this.http
      .post<T>(this.url(chemin), corps, { withCredentials: true })
      .pipe(catchError(e => this.gerer(e, chemin)));
  }

  patch<T>(chemin: string, corps: unknown): Observable<T> {
    if (!this.navigateur) return NEVER;
    return this.http
      .patch<T>(this.url(chemin), corps, { withCredentials: true })
      .pipe(catchError(e => this.gerer(e, chemin)));
  }

  delete<T>(chemin: string): Observable<T> {
    if (!this.navigateur) return NEVER;
    return this.http
      .delete<T>(this.url(chemin), { withCredentials: true })
      .pipe(catchError(e => this.gerer(e, chemin)));
  }

  /**
   * Envoi de fichier avec suivi de progression.
   * `reportProgress` + `observe: 'events'` alimentent la barre de progression
   * de `<app-image-drop>`.
   */
  televerser<T>(chemin: string, formulaire: FormData): Observable<HttpEvent<T>> {
    const requete = new HttpRequest<FormData>('POST', this.url(chemin), formulaire, {
      withCredentials: true,
      reportProgress: true
    });
    return this.http.request<T>(requete).pipe(catchError(e => this.gerer(e, chemin)));
  }

  /** Utilisé par le service d'authentification pour désactiver la redirection. */
  marquerEcranConnexion(actif: boolean): void {
    this.surEcranConnexion = actif;
  }

  private gerer(erreur: unknown, chemin: string): Observable<never> {
    if (erreur instanceof HttpErrorResponse && erreur.status === 401 && !this.surEcranConnexion) {
      // Les routes d'authentification s'excluent de la redirection automatique.
      //
      // Un 401 sur `/api/auth/me` est une RÉPONSE NORMALE : c'est ainsi qu'on
      // apprend que personne n'est connecté. Or cet appel vient presque toujours
      // d'un guard, qui renvoie déjà sa propre redirection. Rediriger ici aussi
      // lançait une seconde navigation concurrente : les deux s'annulaient et le
      // `router-outlet` restait vide, sur une URL `/admin/connexion?retour=%2F`
      // (le `/` venant de `router.url`, pas encore positionné à cet instant).
      if (!chemin.startsWith('/api/auth/')) {
        const url = this.router.url;
        // Ne mémoriser qu'une destination interne au panel : pendant une
        // navigation non encore validée, `router.url` vaut encore l'URL
        // précédente — voire `/` au tout premier chargement.
        const destination = url.startsWith('/admin') && !url.startsWith('/admin/connexion')
          ? url
          : null;
        void this.router.navigate(['/admin/connexion'], {
          queryParams: destination ? { retour: destination } : {}
        });
      }
    }
    return throwError(() => erreur);
  }
}
