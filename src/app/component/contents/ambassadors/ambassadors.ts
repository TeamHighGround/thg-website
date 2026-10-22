import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';

import { PartnerCard } from '../partner-card/partner-card';
import { ApiService } from '../../../core/api/api.service';
import { API_LOADING, ApiState } from '../../../core/api/api-state';
import { PartnerEntry, PartnersResponse } from '../../../core/api/models';

@Component({
  selector: 'app-ambassadors',
  standalone: true,
  imports: [TranslocoModule, PartnerCard],
  templateUrl: './ambassadors.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ambassadors.scss'
})
export class Ambassadors {
  private readonly api = inject(ApiService);

  /** État de `GET /api/partners?kind=ambassador`. */
  readonly etat = toSignal(this.api.getPartners('ambassador'), {
    initialValue: API_LOADING as ApiState<PartnersResponse>
  });

  readonly ambassadors = computed<PartnerEntry[]>(() => this.etat().data?.entries ?? []);

  trackByAmbassadorId(_index: number, ambassadeur: PartnerEntry): string {
    return ambassadeur.id;
  }
}
