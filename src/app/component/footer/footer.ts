import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { SiteSettingsService } from '../../core/api/site-settings.service';

@Component({
  selector: 'app-footer',
  imports: [TranslocoModule, RouterModule],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.scss'
})
export class Footer {
  readonly reseaux = inject(SiteSettingsService).reseaux;
}
