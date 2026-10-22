import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-cookie-settings',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './cookie-settings.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './cookie-settings.scss'
})
export class CookieSettingsComponent {}
