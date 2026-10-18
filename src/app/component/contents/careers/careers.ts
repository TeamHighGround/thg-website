import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { JobCard } from './job-card/job-card';
import { ApiService } from '../../../core/api/api.service';
import { API_LOADING, ApiState } from '../../../core/api/api-state';
import { JobOpening, JobsResponse } from '../../../core/api/models';
import { SiteSettingsService } from '../../../core/api/site-settings.service';

/**
 * Page « Nous rejoindre » : les postes que la THG cherche à pourvoir.
 *
 * Postes administrés dans le panel (« Recrutement »), répartis en deux blocs :
 * « On recrute » (besoins ponctuels, mis en avant) puis « Candidatures ouvertes
 * toute l'année » (une tuile par jeu : on étudie les profils même quand les
 * effectifs sont complets). Un bloc sans poste publié est masqué ; la
 * candidature spontanée reste toujours proposée en bas de page.
 */
@Component({
  selector: 'app-careers',
  imports: [TranslocoModule, RouterLink, JobCard],
  templateUrl: './careers.html'
})
export class Careers {
  private readonly api = inject(ApiService);

  /** État de `GET /api/jobs`. */
  readonly etat = toSignal(this.api.getJobs(), {
    initialValue: API_LOADING as ApiState<JobsResponse>
  });

  private readonly postes = computed<JobOpening[]>(() => this.etat().data?.openings ?? []);
  readonly ponctuels = computed(() => this.postes().filter(p => p.category === 'opening'));
  readonly permanents = computed(() => this.postes().filter(p => p.category === 'always_open'));

  /** Adresse de contact, configurée dans le panel (« Réseaux sociaux »). */
  readonly email = inject(SiteSettingsService).emailContact;

  readonly lienSpontane = computed(() => {
    const email = this.email();
    return email ? `mailto:${email}?subject=${encodeURIComponent('Candidature spontanée')}` : null;
  });
}
