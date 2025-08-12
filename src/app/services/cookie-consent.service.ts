import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean; // Pour futur usage si besoin
  functional: boolean; // Cookies techniques (toujours true)
  consentGiven: boolean;
  consentDate?: Date;
  version?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private readonly CONSENT_KEY = 'thg-cookie-consent';
  private readonly CONSENT_VERSION = '1.0';
  
  private consentSubject = new BehaviorSubject<CookieConsent>({
    analytics: false,
    marketing: false,
    functional: true,
    consentGiven: false
  });

  public consent$ = this.consentSubject.asObservable();
  private analytics: Analytics | null = null;

  constructor() {
    this.loadStoredConsent();
  }

  private loadStoredConsent(): void {
    try {
      const stored = localStorage.getItem(this.CONSENT_KEY);
      if (stored) {
        const consent = JSON.parse(stored);
        // Vérifier si le consentement n'est pas trop ancien (13 mois max)
        if (consent.consentDate) {
          const consentDate = new Date(consent.consentDate);
          const monthsAgo = new Date();
          monthsAgo.setMonth(monthsAgo.getMonth() - 13);
          
          if (consentDate > monthsAgo && consent.version === this.CONSENT_VERSION) {
            this.consentSubject.next({
              analytics: consent.analytics || false,
              marketing: consent.marketing || false,
              functional: consent.functional || true,
              consentGiven: consent.consentGiven || false,
              consentDate: new Date(consent.consentDate),
              version: consent.version
            });
            
            // Initialiser Analytics si accepté
            if (consent.analytics) {
              this.initializeAnalytics();
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du consentement:', error);
    }
  }

  public saveConsent(consent: Partial<CookieConsent>): void {
    const fullConsent: CookieConsent = {
      ...this.consentSubject.value,
      ...consent,
      consentGiven: true,
      consentDate: new Date(),
      version: this.CONSENT_VERSION
    };

    try {
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(fullConsent));
      this.consentSubject.next(fullConsent);

      // Gérer Google Analytics selon le choix
      if (fullConsent.analytics) {
        this.initializeAnalytics();
      } else {
        this.disableAnalytics();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du consentement:', error);
    }
  }

  public acceptAll(): void {
    this.saveConsent({
      analytics: true,
      marketing: false, // Pas utilisé actuellement
      functional: true
    });
  }

  public rejectAll(): void {
    this.saveConsent({
      analytics: false,
      marketing: false,
      functional: true // Les cookies techniques restent acceptés
    });
  }

  public resetConsent(): void {
    try {
      localStorage.removeItem(this.CONSENT_KEY);
      this.consentSubject.next({
        analytics: false,
        marketing: false,
        functional: true,
        consentGiven: false
      });
      this.disableAnalytics();
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  }

  public getCurrentConsent(): CookieConsent {
    return this.consentSubject.value;
  }

  public hasConsentExpired(): boolean {
    const consent = this.getCurrentConsent();
    if (!consent.consentDate) return true;
    
    const consentDate = new Date(consent.consentDate);
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - 13);
    
    return consentDate <= monthsAgo;
  }

  private initializeAnalytics(): void {
    if (!this.analytics) {
      try {
        // Configuration Firebase (remplacez par vos vraies valeurs)
        const firebaseConfig = {
          apiKey: "AIzaSyCGOJeCzw70QUU-x_gfzLXGdvQVlQF44fQ",
          authDomain: "thg-esport.firebaseapp.com",
          projectId: "thg-esport",
          storageBucket: "thg-esport.firebasestorage.app",
          messagingSenderId: "362864662279",
          appId: "1:362864662279:web:2463879fc4b1c9cc3f17a2",
          measurementId: "G-Z3QZ2KFZLN"
        };

        const app = initializeApp(firebaseConfig);
        this.analytics = getAnalytics(app);
      } catch (error) {
        console.error('Erreur initialisation Analytics:', error);
      }
    }
  }

  private disableAnalytics(): void {
    // Désactiver la collecte Analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
    
    // Supprimer les cookies existants
    this.deleteCookie('_ga');
    this.deleteCookie('_ga_G-Z3QZ2KFZLN'); // Remplacez par votre vrai ID de mesure
    this.deleteCookie('_gid');
    
    this.analytics = null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  // Méthode pour vérifier si on doit afficher la bannière
  public shouldShowBanner(): boolean {
    const consent = this.getCurrentConsent();
    return !consent.consentGiven || this.hasConsentExpired();
  }
}

// Types pour TypeScript (à ajouter dans un fichier types si nécessaire)
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}