import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';
import { SeoConfig } from './seo.config';
import { ROUTES_SEO_CONFIG, SITE_URL, TWITTER_HANDLE, DEFAULT_IMAGE } from './routes-seo.config';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private transloco = inject(TranslocoService);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  initialize(): void {
    this.initRouteListener();
  }

  private initRouteListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateSeoForRoute(event.urlAfterRedirects);
    });

    this.transloco.langChanges$.subscribe(() => {
      this.updateSeoForRoute(this.router.url);
    });
  }

  private updateSeoForRoute(url: string): void {
    const cleanUrl = this.getCleanPath(url);
    const lang = this.transloco.getActiveLang() as 'fr' | 'en';

    const routeConfig = ROUTES_SEO_CONFIG[cleanUrl];
    if (routeConfig && routeConfig[lang]) {
      this.updateSeo(routeConfig[lang], cleanUrl);
    }
  }

  private getCleanPath(url: string): string {
    let path = url.split('?')[0].split('#')[0];
    if (path.startsWith('/en')) {
      path = path.substring(3) || '/';
    }
    return path;
  }

  updateSeo(config: SeoConfig, currentPath: string = '/'): void {
    const lang = this.transloco.getActiveLang();
    const fullUrl = lang === 'en'
      ? `${SITE_URL}/en${currentPath === '/' ? '' : currentPath}`
      : `${SITE_URL}${currentPath}`;

    this.title.setTitle(config.title);

    this.meta.updateTag({ name: 'description', content: config.description });

    if (config.keywords && config.keywords.length > 0) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords.join(', ') });
    } else {
      this.meta.removeTag('name="keywords"');
    }

    if (config.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }

    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Team High Ground' });
    this.meta.updateTag({ property: 'og:locale', content: lang === 'fr' ? 'fr_FR' : 'en_US' });

    const image = config.image || DEFAULT_IMAGE;
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });

    if (config.imageAlt) {
      this.meta.updateTag({ property: 'og:image:alt', content: config.imageAlt });
    }

    this.meta.updateTag({ name: 'twitter:card', content: config.twitterCard || 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:site', content: TWITTER_HANDLE });
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    if (config.imageAlt) {
      this.meta.updateTag({ name: 'twitter:image:alt', content: config.imageAlt });
    }

    if (isPlatformBrowser(this.platformId)) {
      this.updateCanonical(fullUrl);
      this.updateAlternateLinks(currentPath);
    }
  }

  private updateCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private updateAlternateLinks(path: string): void {
    const existingLinks = this.document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach(link => link.remove());

    const frLink = this.document.createElement('link');
    frLink.setAttribute('rel', 'alternate');
    frLink.setAttribute('hreflang', 'fr');
    frLink.setAttribute('href', `${SITE_URL}${path}`);
    this.document.head.appendChild(frLink);

    const enLink = this.document.createElement('link');
    enLink.setAttribute('rel', 'alternate');
    enLink.setAttribute('hreflang', 'en');
    enLink.setAttribute('href', `${SITE_URL}/en${path === '/' ? '' : path}`);
    this.document.head.appendChild(enLink);

    const defaultLink = this.document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${SITE_URL}${path}`);
    this.document.head.appendChild(defaultLink);
  }
}
