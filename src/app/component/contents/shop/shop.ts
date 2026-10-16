import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';
import { SiteSettingsService } from '../../../core/api/site-settings.service';

/** Seules les pages HelloAsso en https peuvent être intégrées (même règle que l'API). */
function estUrlHelloAsso(valeur: string): boolean {
  try {
    const url = new URL(valeur);
    return url.protocol === 'https:' && /(^|\.)helloasso\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Boutique : widget HelloAsso en iframe.
 *
 * Ouverture et adresse du widget se règlent dans le panel (« Boutique »). Fermée,
 * ou si l'API est injoignable, la page affiche un message d'attente.
 */
@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class ShopComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly reglages = inject(SiteSettingsService);

  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly chargement = computed(() => this.reglages.statut() === 'loading');

  /** Adresse du widget, `null` si la boutique est fermée. */
  readonly widgetUrl = computed<SafeResourceUrl | null>(() => {
    const { enabled, url } = this.reglages.boutique();
    if (!enabled || !url || !estUrlHelloAsso(url)) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
