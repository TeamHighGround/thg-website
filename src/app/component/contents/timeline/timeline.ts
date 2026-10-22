import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';

import { ApiService } from '../../../core/api/api.service';
import { API_LOADING, ApiState } from '../../../core/api/api-state';
import { TimelineChapter, TimelineMilestone, TimelineResponse } from '../../../core/api/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './timeline.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './timeline.scss'
})
export class Timeline {
  private readonly api = inject(ApiService);

  /** État de `GET /api/timeline`, rejoué à chaque changement de langue. */
  readonly etat = toSignal(this.api.getTimeline(), {
    initialValue: API_LOADING as ApiState<TimelineResponse>
  });

  readonly chapters = computed<TimelineChapter[]>(() => this.etat().data?.chapters ?? []);

  trackByChapterId(_index: number, chapitre: TimelineChapter): string {
    return chapitre.id;
  }

  trackByMilestoneId(_index: number, jalon: TimelineMilestone): string {
    return jalon.id;
  }
}
