import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslocoResolver implements Resolve<any> {
  private transloco = inject(TranslocoService);

  resolve(route: ActivatedRouteSnapshot) {
    const lang = route.data['lang'] || 'fr';
    this.transloco.setActiveLang(lang);
    return this.transloco.load(lang);
  }
}