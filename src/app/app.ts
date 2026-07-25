import { Component, signal, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { Header } from './component/header/header';
import { Footer } from './component/footer/footer';
import { Background } from "./component/background/background";
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SeoService } from './services/seo/seo.service';
import { JsonLdService } from './services/seo/json-ld.service';

@Component({
  selector: 'app-root',
  imports: [Header, RouterOutlet, Footer, Background],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('thg-website');
  private seoService = inject(SeoService);
  private jsonLdService = inject(JsonLdService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /**
   * Le panel d'administration a son propre habillage (barre latérale dédiée) :
   * le header, le footer et le fond animé du site public n'y ont pas leur place.
   *
   * La valeur initiale vient de `Location.path()` et non de `router.url` : au
   * moment où ce composant est construit, la première navigation n'est pas encore
   * validée et `router.url` vaut encore `/`. Sans ça, l'habillage public
   * apparaîtrait brièvement sur le panel avant de disparaître.
   */
  protected readonly estPanelAdmin = signal(this.location.path().startsWith('/admin'));

  constructor() {
    this.router.events
      .pipe(
        filter((evenement) => evenement instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.estPanelAdmin.set(this.router.url.startsWith('/admin')));
  }

  ngOnInit(): void {
    this.seoService.initialize();
    this.jsonLdService.initialize();
  }
}
