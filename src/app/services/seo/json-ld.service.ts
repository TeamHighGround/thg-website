import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SiteSettingsService } from '../../core/api/site-settings.service';

const SITE_URL = 'https://teamhighground.fr';

@Injectable({
  providedIn: 'root'
})
export class JsonLdService {
  private document = inject(DOCUMENT);
  private router = inject(Router);
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);
  private siteSettings = inject(SiteSettingsService);
  /** URL des réseaux de l'association (`sameAs`), configurées dans le panel. */
  private sameAs: string[] = [];
  /** Adresse de contact de l'Organization, configurée dans le panel. */
  private email: string | null = null;
  private scriptElements: HTMLScriptElement[] = [];

  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initRouteListener();
  }

  private initRouteListener(): void {
    // Régénéré à chaque navigation, et une fois de plus quand les réseaux
    // configurés arrivent de l'API (ils peuvent arriver après la navigation).
    combineLatest([
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
      this.siteSettings.etat$.pipe(filter(etat => etat.status !== 'loading'))
    ]).subscribe(([event, etat]) => {
      const liens = etat.data?.socialLinks ?? {};
      this.sameAs = [liens.twitter, liens.instagram, liens.discord].filter((url): url is string => !!url);
      this.email = etat.data?.contactEmail ?? null;
      this.updateJsonLdForRoute(event.urlAfterRedirects);
    });
  }

  private updateJsonLdForRoute(url: string): void {
    this.clearAllJsonLd();
    const cleanUrl = this.getCleanPath(url);

    this.addOrganizationSchema();
    this.addBreadcrumbSchema(cleanUrl);

    if (cleanUrl === '/teams/lol') {
      this.addSportsTeamSchema('League of Legends', 'lol');
    } else if (cleanUrl === '/teams/tft') {
      this.addSportsTeamSchema('Teamfight Tactics', 'tft');
    } else if (cleanUrl === '/teams/ssbu') {
      this.addSportsTeamSchema('Super Smash Bros Ultimate', 'ssbu');
    }
  }

  private getCleanPath(url: string): string {
    let path = url.split('?')[0].split('#')[0];
    if (path.startsWith('/en')) {
      path = path.substring(3) || '/';
    }
    return path;
  }

  private clearAllJsonLd(): void {
    this.scriptElements.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    this.scriptElements = [];
  }

  private addJsonLd(data: object): void {
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      ...data
    });
    this.document.head.appendChild(script);
    this.scriptElements.push(script);
  }

  private addOrganizationSchema(): void {
    const lang = this.transloco.getActiveLang();

    this.addJsonLd({
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Team High Ground',
      alternateName: 'THG',
      url: SITE_URL,
      logo: `${SITE_URL}/assets/logo/green/THG_VERT.png`,
      description: lang === 'fr'
        ? 'Association esport bretonne basee a Rennes, competitive sur League of Legends et Teamfight Tactics'
        : 'Breton esports association based in Rennes, competing in League of Legends and Teamfight Tactics',
      foundingDate: '2015',
      ...(this.email ? { email: this.email } : {}),
      ...(this.sameAs.length ? { sameAs: this.sameAs } : {})
    });
  }

  private addBreadcrumbSchema(path: string): void {
    const lang = this.transloco.getActiveLang();
    const breadcrumbNames: { [key: string]: { fr: string; en: string } } = {
      '/': { fr: 'Accueil', en: 'Home' },
      '/about': { fr: 'A propos', en: 'About' },
      '/teams': { fr: 'Equipes', en: 'Teams' },
      '/teams/lol': { fr: 'League of Legends', en: 'League of Legends' },
      '/teams/tft': { fr: 'Teamfight Tactics', en: 'Teamfight Tactics' },
      '/teams/ssbu': { fr: 'Super Smash Bros Ultimate', en: 'Super Smash Bros Ultimate' },
      '/news': { fr: 'Actualites', en: 'News' },
      '/ambassadors': { fr: 'Ambassadeurs', en: 'Ambassadors' },
      '/contact': { fr: 'Contact', en: 'Contact' },
      '/careers': { fr: 'Nous rejoindre', en: 'Careers' }
    };

    const segments = path.split('/').filter(Boolean);
    const items: object[] = [
      {
        '@type': 'ListItem',
        position: 1,
        name: breadcrumbNames['/'][lang as 'fr' | 'en'],
        item: SITE_URL
      }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = breadcrumbNames[currentPath]?.[lang as 'fr' | 'en'] || segment;

      const listItem: any = {
        '@type': 'ListItem',
        position: index + 2,
        name
      };

      if (index < segments.length - 1) {
        listItem.item = `${SITE_URL}${currentPath}`;
      }

      items.push(listItem);
    });

    if (items.length > 1) {
      this.addJsonLd({
        '@type': 'BreadcrumbList',
        itemListElement: items
      });
    }
  }

  private addSportsTeamSchema(game: string, gameSlug: string): void {
    const lang = this.transloco.getActiveLang();

    this.addJsonLd({
      '@type': 'SportsTeam',
      name: `Team High Ground ${game}`,
      sport: 'Esports',
      url: `${SITE_URL}/teams/${gameSlug}`,
      description: lang === 'fr'
        ? `Equipe ${game} de Team High Ground`
        : `Team High Ground ${game} Team`,
      parentOrganization: {
        '@type': 'Organization',
        name: 'Team High Ground',
        url: SITE_URL
      }
    });
  }
}
