import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  constructor(private translate: TranslateService) {
    // Langue par défaut
    this.translate.setDefaultLang('fr');
    
    // Détecter la langue du navigateur ou utiliser fr par défaut
    const browserLang = this.translate.getBrowserLang();
    const lang = browserLang?.match(/en|fr/) ? browserLang : 'fr';
    this.translate.use(lang);
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('language', language);
  }

  getCurrentLanguage() {
    return this.translate.currentLang || 'fr';
  }

  getAvailableLanguages() {
    return [
      { code: 'fr', name: 'Français' },
      { code: 'en', name: 'English' }
    ];
  }
}