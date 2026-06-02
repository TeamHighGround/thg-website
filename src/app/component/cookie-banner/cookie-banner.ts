// src/app/components/cookie-banner/cookie-banner.component.ts
import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { CookieConsentService, CookieConsent } from '../../services/cookie-consent.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FormsModule],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss'
})
export class CookieBannerComponent implements OnInit, OnDestroy {
  private cookieService = inject(CookieConsentService);
  private platformId = inject(PLATFORM_ID);
  private subscription = new Subscription();

  showBanner = false;
  showDetails = false;
  analyticsConsent = false;

  ngOnInit() {
    // Ne calculer l'affichage que côté navigateur : sinon le HTML prérendu (SSR)
    // contient toujours la bannière (pas de localStorage côté serveur), ce qui
    // provoque un flash de ~1s à l'hydratation quand le consentement existe déjà.
    if (!isPlatformBrowser(this.platformId)) return;

    this.showBanner = this.cookieService.shouldShowBanner();

    // Écouter les changements de consentement
    this.subscription.add(
      this.cookieService.consent$.subscribe(consent => {
        this.analyticsConsent = consent.analytics;

        // Masquer la bannière si le consentement a été donné
        if (consent.consentGiven && !this.cookieService.hasConsentExpired()) {
          this.showBanner = false;
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  acceptAll() {
    this.cookieService.acceptAll();
    this.showBanner = false;
  }

  rejectAll() {
    this.cookieService.rejectAll();
    this.showBanner = false;
  }

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  updateConsent() {

  }

  saveCustom() {
    this.cookieService.saveConsent({
      analytics: this.analyticsConsent,
      marketing: false, // Pas utilisé pour l'instant
      functional: true
    });
    this.showBanner = false;
  }
}