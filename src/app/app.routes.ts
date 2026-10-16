import { Routes } from '@angular/router';
import { Home } from './component/contents/home/home';
import { About } from './component/contents/about/about';
import { Lol } from './component/contents/teams/lol/lol';
import { Tft } from './component/contents/teams/tft/tft';
import { Ssbu } from './component/contents/teams/ssbu/ssbu';
import { News } from './component/contents/news/news';
import { Contact } from './component/contents/contact/contact';
import { TranslocoResolver } from './transloco/transloco.resolver';
import { LegalNotice } from './component/contents/legal-notice/legal-notice';
import { PrivacyPolicy } from './component/contents/privacy-policy/privacy-policy';
import { Ambassadors } from './component/contents/ambassadors/ambassadors';
import { Partners } from './component/contents/partners/partners';
import { ShopComponent } from './component/contents/shop/shop';

const contentRoutes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'teams/lol', component: Lol },
  { path: 'teams/tft', component: Tft },
  { path: 'teams/ssbu', component: Ssbu },
  { path: 'news', component: News },
  { path: 'partners', component: Partners },
  { path: 'ambassadors', component: Ambassadors },
  { path: 'shop', component: ShopComponent },
  { path: 'contact', component: Contact },
  { path: 'legal-notice', component: LegalNotice },
  { path: 'privacy-policy', component: PrivacyPolicy },
  { path: 'cookie-settings', loadComponent: () => import('./component/cookie-settings/cookie-settings').then(m => m.CookieSettingsComponent) },
];

export const routes: Routes = [
  // French routes (default)
  {
    path: '',
    resolve: { transloco: TranslocoResolver },
    data: { lang: 'fr' },
    children: contentRoutes
  },
  // English routes
  {
    path: 'en',
    resolve: { transloco: TranslocoResolver },
    data: { lang: 'en' },
    children: contentRoutes
  },
  { path: '**', redirectTo: '' }
];
