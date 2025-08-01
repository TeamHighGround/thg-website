import { Routes } from '@angular/router';
import { Home } from './component/contents/home/home';
import { About } from './component/contents/about/about';
import { Lol } from './component/contents/teams/lol/lol';
import { Tft } from './component/contents/teams/tft/tft';
import { News } from './component/contents/news/news';
import { Partners } from './component/contents/partners/partners';
import { Contact } from './component/contents/contact/contact';
import { TranslocoResolver } from './transloco/transloco.resolver'; // À créer

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
      { path: 'partners', component: Partners },
      { path: 'contact', component: Contact },
    ]
  },
  { path: '**', redirectTo: '' }
];