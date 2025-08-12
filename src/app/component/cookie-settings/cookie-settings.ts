import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CookieConsentService, CookieConsent } from '../../services/cookie-consent.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cookie-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './cookie-settings.html',
  styleUrl: './cookie-settings.scss'
})
export class CookieSettingsComponent implements OnInit, OnDestroy {
  private cookieService = inject(CookieConsentService);
  private subscription = new Subscription();
  private transloco = inject(TranslocoService);

  currentConsent: CookieConsent = {
    analytics: false,
    marketing: false,
    functional: true,
    consentGiven: false
  };

  formSettings = {
    analytics: false,
    marketing: false,
    functional: true
  };

  showSuccessMessage = false;

  ngOnInit() {
    this.subscription.add(
      this.cookieService.consent$.subscribe(consent => {
        this.currentConsent = consent;
        this.formSettings = {
          analytics: consent.analytics,
          marketing: consent.marketing,
          functional: consent.functional
        };
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  hasChanges(): boolean {
    return (
      this.formSettings.analytics !== this.currentConsent.analytics ||
      this.formSettings.marketing !== this.currentConsent.marketing
    );
  }

  saveSettings() {
    this.cookieService.saveConsent({
      analytics: this.formSettings.analytics,
      marketing: this.formSettings.marketing,
      functional: this.formSettings.functional
    });
    
    this.showSuccessMessage = true;
    
    // Masquer le message après 3 secondes
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }

  cancelChanges() {
    this.formSettings = {
      analytics: this.currentConsent.analytics,
      marketing: this.currentConsent.marketing,
      functional: this.currentConsent.functional
    };
  }

  resetConsent() {
    const confirmMessage = this.transloco.translate('cookieSettings.resetConfirmation');
    
    if (confirm(confirmMessage)) {
      this.cookieService.resetConsent();
      // La bannière réapparaîtra automatiquement
      window.location.reload();
    }
  }
}