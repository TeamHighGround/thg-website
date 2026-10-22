import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { SiteSettingsService } from '../../../core/api/site-settings.service';

@Component({
  selector: 'app-legal-notice',
  imports: [TranslocoModule],
  templateUrl: './legal-notice.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './legal-notice.scss'
})
export class LegalNotice {
  /** Adresse de contact, configurée dans le panel (« Réseaux sociaux »). */
  readonly email = inject(SiteSettingsService).emailContact;
}
