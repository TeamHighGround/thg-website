import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    // Forcer uniquement le français pour l'instant
    this.translate.addLangs(['fr']);
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
    
    // Debug
    console.log('Service de traduction initialisé en français');
  }

  switchLanguage(language: string) {
    // Pour l'instant, seulement le français
    if (language === 'fr') {
      this.translate.use(language);
      localStorage.setItem('language', language);
    }
  }

  getCurrentLanguage() {
    return 'fr';
  }

  getAvailableLanguages() {
    return [
      { code: 'fr', name: 'Français' }
    ];
  }
}