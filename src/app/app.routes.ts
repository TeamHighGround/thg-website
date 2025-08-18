import { Routes } from '@angular/router';
import { Home } from './component/contents/home/home';
import { About } from './component/contents/about/about';
import { Lol } from './component/contents/teams/lol/lol';
import { Tft } from './component/contents/teams/tft/tft';
import { News } from './component/contents/news/news';
import { Contact } from './component/contents/contact/contact';
import { TranslocoResolver } from './transloco/transloco.resolver';
import { LegalNotice } from './component/contents/legal-notice/legal-notice';
import { PrivacyPolicy } from './component/contents/privacy-policy/privacy-policy';
import { Ambassadors } from './component/contents/ambassadors/ambassadors';

export const routes: Routes = [
  {
    path: '',
    resolve: { transloco: TranslocoResolver },
    children: [
      { path: '', component: Home },
      { path: 'about', component: About },
      { path: 'teams/lol', component: Lol },
      { path: 'teams/tft', component: Tft },
      { path: 'news', component: News },
      { path: 'ambassadors', component: Ambassadors },
      { path: 'contact', component: Contact },
      { path: 'legal-notice', component: LegalNotice },
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'cookie-settings', loadComponent: () => import('./component/cookie-settings/cookie-settings').then(m => m.CookieSettingsComponent) },
  
    ]
  },
  { path: '**', redirectTo: '' }
];