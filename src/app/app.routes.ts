import { Routes } from '@angular/router';
import { Home } from './component/contents/home/home';
import { About } from './component/contents/about/about';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: '**', redirectTo: '' } // Route par défaut pour les 404
];