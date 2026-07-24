import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-cookie-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './cookie-settings.html',
  styleUrl: './cookie-settings.scss'
})
export class CookieSettingsComponent {}
