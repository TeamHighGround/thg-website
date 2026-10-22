import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, inject, PLATFORM_ID, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, RouterModule, CdkMenu, CdkMenuItem, CdkMenuTrigger, CommonModule],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.scss'
})
export class Header implements OnInit, AfterViewInit {
  @ViewChild('navContainer', { static: false }) navContainer!: ElementRef;
  private platformId = inject(PLATFORM_ID);

  mobileMenuOpen = false;
  activeIndicatorStyle = { left: '0px', width: '0px' };

  // Auto-hide du header au scroll (mobile) : caché en descendant, visible en remontant
  headerHidden = false;
  private lastScrollY = 0;
  private readonly scrollThreshold = 80; // px avant de commencer à cacher

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentScrollY = window.scrollY;

    // En haut de page ou menu mobile ouvert : toujours visible
    if (currentScrollY <= this.scrollThreshold || this.mobileMenuOpen) {
      this.headerHidden = false;
    } else if (currentScrollY > this.lastScrollY) {
      this.headerHidden = true;  // on descend → cacher
    } else if (currentScrollY < this.lastScrollY) {
      this.headerHidden = false; // on remonte → afficher
    }

    this.lastScrollY = currentScrollY;
  }

  constructor(private router: Router) { }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.updateActiveIndicator(), 100);
      });

  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => this.updateActiveIndicator(), 100);
  }

  private updateActiveIndicator() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.navContainer) return;

    const navElement = this.navContainer.nativeElement;

    // Chercher les liens directs actifs ET le bouton Équipes avec classe router-link-active
    const activeLink = navElement.querySelector('a.router-link-active, a[aria-current="page"]');
    const activeButton = navElement.querySelector('button.router-link-active');

    const activeElement = activeLink || activeButton;

    if (activeElement) {
      const navRect = navElement.getBoundingClientRect();
      const linkRect = activeElement.getBoundingClientRect();

      this.activeIndicatorStyle = {
        left: `${linkRect.left - navRect.left}px`,
        width: `${linkRect.width}px`
      };
    } else {
      // Si aucun élément actif n'est trouvé, on cache l'indicateur
      this.activeIndicatorStyle = {
        left: '0px',
        width: '0px'
      };
    }
  }

  isActiveRoute(routerLink: string): boolean {
    const currentUrl = this.router.url;

    if (routerLink === '/') {
      return currentUrl === '/';
    }

    // Pour les routes teams, on vérifie les chemins exacts et les sous-chemins
    if (routerLink.includes('/teams/')) {
      return currentUrl === routerLink || currentUrl.startsWith(routerLink + '/');
    }

    // Pour les autres routes
    return currentUrl === routerLink || currentUrl.startsWith(routerLink + '/');
  }

  isTeamsRouteActive(): boolean {
    const currentUrl = this.router.url;
    return currentUrl.startsWith('/teams/lol') ||
      currentUrl.startsWith('/teams/tft') ||
      currentUrl.startsWith('/teams/ssbu') ||
      currentUrl === '/teams/league-of-legends';
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  // Clic sur Accueil / logo : si on est déjà sur l'accueil, on remonte en haut
  // (sinon le routerLink ne déclenche aucune navigation et rien ne se passe).
  onHomeClick() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.router.url === '/' || this.router.url === '/en') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}
