import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';

import { PartnerCard } from '../partner-card/partner-card';
import { ApiService } from '../../../core/api/api.service';
import { API_LOADING, ApiState } from '../../../core/api/api-state';
import { PartnerEntry, PartnersResponse } from '../../../core/api/models';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [TranslocoModule, PartnerCard],
  templateUrl: './partners.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './partners.scss'
})
export class Partners {
  private readonly api = inject(ApiService);

  /** État de `GET /api/partners?kind=partner`. */
  readonly etat = toSignal(this.api.getPartners('partner'), {
    initialValue: API_LOADING as ApiState<PartnersResponse>
  });

  readonly partners = computed<PartnerEntry[]>(() => this.etat().data?.entries ?? []);

  trackByPartnerId(_index: number, partenaire: PartnerEntry): string {
    return partenaire.id;
  }
}
