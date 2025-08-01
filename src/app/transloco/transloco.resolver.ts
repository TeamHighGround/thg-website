import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslocoResolver implements Resolve<any> {
  constructor(private transloco: TranslocoService) {}

  resolve() {
    return this.transloco.load('fr');
  }
}