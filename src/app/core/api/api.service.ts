import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';
import { Observable, of, switchMap, tap } from 'rxjs';

import { API_BASE_URL } from './api-base-url';
import { ApiState, versApiState } from './api-state';
import {
  NewsListResponse,
  NewsPostDetail,
  PartnerKind,
  PartnersResponse,
  TeamsResponse,
  TimelineResponse
} from './models';

/** Paramètres de requête acceptés par les routes publiques. */
type ParametresRequete = Record<string, string | number>;

/**
 * Accès aux routes **publiques** de l'API THG.
 *
 * Trois responsabilités :
 *
 * 1. **Préfixer les URL** avec `API_BASE_URL` — relatif dans le navigateur,
 *    absolu côté SSR (le `fetch` de Node refuse les URL relatives).
 * 2. **Propager la langue** : chaque méthode s'abonne à `langChanges$` et
 *    relance l'appel avec `?lang=` quand la langue active change.
 * 3. **Transférer les réponses du serveur au navigateur** pour ne pas refaire
 *    les appels à l'hydratation (voir `recupererAvecTransfert`).
 *
 * Aucune méthode ne peut échouer : elles renvoient un `ApiState`, jamais une
 * erreur RxJS. Une API tombée doit dégrader l'affichage, pas casser le rendu.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly transloco = inject(TranslocoService);
  private readonly transferState = inject(TransferState);
  private readonly estNavigateur = isPlatformBrowser(inject(PLATFORM_ID));

  // ── Routes publiques ────────────────────────────────────────────────────────

  /** `GET /api/teams?game=<slug>` — roster et rôles d'un jeu. */
  getTeams(game: string): Observable<ApiState<TeamsResponse>> {
    return this.selonLangue((lang) =>
      this.recupererAvecTransfert<TeamsResponse>('/api/teams', { game, lang })
    );
  }

  /** `GET /api/timeline` — chapitres et jalons de l'histoire du club. */
  getTimeline(): Observable<ApiState<TimelineResponse>> {
    return this.selonLangue((lang) =>
      this.recupererAvecTransfert<TimelineResponse>('/api/timeline', { lang })
    );
  }

  /** `GET /api/partners?kind=<kind>` — partenaires ou ambassadeurs. */
  getPartners(kind: PartnerKind): Observable<ApiState<PartnersResponse>> {
    return this.selonLangue((lang) =>
      this.recupererAvecTransfert<PartnersResponse>('/api/partners', { kind, lang })
    );
  }

  /** `GET /api/news` — liste paginée des actualités. */
  getNews(page = 1, pageSize = 10): Observable<ApiState<NewsListResponse>> {
    return this.selonLangue((lang) =>
      this.recupererAvecTransfert<NewsListResponse>('/api/news', { lang, page, pageSize })
    );
  }

  /** `GET /api/news/:slug` — actualité complète, corps en markdown. */
  getNewsPost(slug: string): Observable<ApiState<NewsPostDetail>> {
    return this.selonLangue((lang) =>
      this.recupererAvecTransfert<NewsPostDetail>(`/api/news/${encodeURIComponent(slug)}`, { lang })
    );
  }

  // ── Rouages internes ────────────────────────────────────────────────────────

  /**
   * Rejoue `fabrique` à chaque changement de langue Transloco et emballe le
   * résultat dans un `ApiState`. `langChanges$` émet immédiatement la langue
   * courante, l'appel part donc dès la souscription — c'est ce qui permet au
   * rendu serveur de l'attendre.
   */
  private selonLangue<T>(fabrique: (lang: string) => Observable<T>): Observable<ApiState<T>> {
    return this.transloco.langChanges$.pipe(switchMap((lang) => versApiState(fabrique(lang))));
  }

  /**
   * `GET` avec transfert serveur → navigateur.
   *
   * Le cache de transfert intégré d'Angular ne peut pas servir ici : il indexe
   * les réponses sur l'URL complète, or le serveur appelle
   * `http://localhost:4001/api/…` quand le navigateur appelle `/api/…`. Les
   * clés ne coïncideraient jamais et l'appel serait refait à l'hydratation.
   *
   * On le désactive donc pour ces requêtes (`transferCache: false`, ce qui
   * évite en prime de sérialiser deux fois le même JSON dans la page) et on
   * gère nous-mêmes un `TransferState` indexé sur le chemin et les paramètres,
   * identiques des deux côtés.
   */
  private recupererAvecTransfert<T>(chemin: string, params: ParametresRequete): Observable<T> {
    const cle = makeStateKey<T>(`thg-api|${chemin}|${this.serialiser(params)}`);

    if (this.estNavigateur && this.transferState.hasKey(cle)) {
      const valeur = this.transferState.get<T | null>(cle, null);
      // Consommée une seule fois : une navigation ultérieure doit interroger
      // l'API pour ne pas resservir indéfiniment des données figées.
      this.transferState.remove(cle);
      if (valeur !== null) {
        return of(valeur);
      }
    }

    return this.http
      .get<T>(`${this.baseUrl}${chemin}`, { params, transferCache: false })
      .pipe(
        tap((reponse) => {
          if (!this.estNavigateur) {
            this.transferState.set(cle, reponse);
          }
        })
      );
  }

  /** Sérialisation stable des paramètres, pour une clé de transfert déterministe. */
  private serialiser(params: ParametresRequete): string {
    return Object.keys(params)
      .sort()
      .map((nom) => `${nom}=${params[nom]}`)
      .join('&');
  }
}
