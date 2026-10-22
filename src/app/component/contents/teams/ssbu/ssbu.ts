import { Component, AfterViewInit, inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

@Component({
  selector: 'app-ssbu',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './ssbu.html',
  styleUrl: './ssbu.scss',
  // `widgets.js` remplace le <blockquote> par une iframe qu'Angular n'a jamais
  // rendue : l'hydratation ne doit pas essayer de réconcilier ce sous-arbre.
  // `ngSkipHydration` ne s'applique qu'à un nœud hôte de composant, d'où sa
  // déclaration ici plutôt que sur le <div> de l'embed dans le template.
  changeDetection: ChangeDetectionStrategy.Eager,
  host: { ngSkipHydration: 'true' }
})
export class Ssbu implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);

  private readonly widgetsScriptUrl = 'https://platform.twitter.com/widgets.js';

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadTwitterWidgets();
  }

  private loadTwitterWidgets(): void {
    // Si le script est déjà chargé, on demande simplement le (re)rendu des embeds
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${this.widgetsScriptUrl}"]`
    );

    if (existing) {
      existing.addEventListener('load', () => window.twttr?.widgets.load());
      return;
    }

    const script = document.createElement('script');
    script.src = this.widgetsScriptUrl;
    script.async = true;
    script.setAttribute('charset', 'utf-8');
    script.addEventListener('load', () => window.twttr?.widgets.load());
    document.body.appendChild(script);
  }
}
