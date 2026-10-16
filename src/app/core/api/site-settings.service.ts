import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay } from 'rxjs';

import { ApiService } from './api.service';
import { API_LOADING, ApiState } from './api-state';
import { SiteSettingsResponse, SiteSocialLinks } from './models';

/** Réseau social de l'association, prêt à afficher. */
export interface ReseauSite {
  cle: keyof SiteSocialLinks;
  libelle: string;
  icone: string;
  url: string;
}

/** Ordre d'affichage et habillage des réseaux de l'association. */
const RESEAUX: Omit<ReseauSite, 'url'>[] = [
  { cle: 'twitter', libelle: 'X', icone: 'pi-twitter' },
  { cle: 'instagram', libelle: 'Instagram', icone: 'pi-instagram' },
  { cle: 'discord', libelle: 'Discord', icone: 'pi-discord' }
];

/**
 * Réglages globaux du site, configurés dans le panel (« Réseaux sociaux »).
 *
 * Un seul appel par rendu, partagé par le footer, la page contact et le JSON-LD :
 * le `TransferState` d'`ApiService` n'est consommé qu'une fois côté navigateur,
 * plusieurs abonnés directs referaient donc l'appel à l'hydratation.
 */
@Injectable({ providedIn: 'root' })
export class SiteSettingsService {
  private readonly api = inject(ApiService);

  readonly etat$ = this.api.getSettings().pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly etat = toSignal(this.etat$, {
    initialValue: API_LOADING as ApiState<SiteSettingsResponse>
  });

  /** Réseaux renseignés, dans l'ordre d'affichage. Vide si l'API est injoignable. */
  readonly reseaux = computed<ReseauSite[]>(() => {
    const liens = this.etat().data?.socialLinks ?? {};
    return RESEAUX.filter(r => !!liens[r.cle]).map(r => ({ ...r, url: liens[r.cle]! }));
  });
}
