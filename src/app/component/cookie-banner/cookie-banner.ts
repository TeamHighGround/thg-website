// src/app/components/cookie-banner/cookie-banner.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  private subscription = new Subscription();

  showBanner = false;
  showDetails = false;
  analyticsConsent = false;

  ngOnInit() {
    this.showBanner = this.cookieService.shouldShowBanner();
    
    // Bloquer le scroll si la bannière s'affiche
    if (this.showBanner) {
      this.preventScroll();
    }
    
    // Écouter les changements de consentement
    this.subscription.add(
      this.cookieService.consent$.subscribe(consent => {
        this.analyticsConsent = consent.analytics;
        
        // Masquer la bannière si le consentement a été donné
        if (consent.consentGiven && !this.cookieService.hasConsentExpired()) {
          this.showBanner = false;
          this.allowScroll(); // Rétablir le scroll
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // S'assurer que le scroll est rétabli même si le composant est détruit
    this.allowScroll();
  }

  acceptAll() {
    this.cookieService.acceptAll();
    this.showBanner = false;
    this.allowScroll(); // Rétablir le scroll
  }

  rejectAll() {
    this.cookieService.rejectAll();
    this.showBanner = false;
    this.allowScroll(); // Rétablir le scroll
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
    this.allowScroll(); // Rétablir le scroll
  }

  // Méthodes pour gérer le scroll
  private preventScroll(): void {
    // Sauvegarder la position actuelle du scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    // Empêcher le scroll sur le body
    document.body.style.overflow = 'hidden';
  }

  private allowScroll(): void {
    // Récupérer la position sauvegardée
    const scrollY = document.body.style.top;
    
    // Rétablir les styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    // Rétablir la position du scroll
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
}