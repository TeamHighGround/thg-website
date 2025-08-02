import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  imports: [TranslocoModule, RouterModule, MenuModule, ButtonModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, AfterViewInit {
  @ViewChild('navContainer', { static: false }) navContainer!: ElementRef;

  mobileMenuOpen = false;
  activeIndicatorStyle = { left: '0px', width: '0px' };

  public dynamicMenuItems$: BehaviorSubject<MenuItem[]> = new BehaviorSubject( //FIX PRIMENG P-MENU
    [] as MenuItem[]
  );

  constructor(private router: Router,
    private translocoService: TranslocoService
  ) { }

  ngOnInit() {
    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.updateActiveIndicator(), 100);
      });

  }

  ngAfterViewInit() {
    setTimeout(() => this.updateActiveIndicator(), 100);
  }

  private updateActiveIndicator() {
    if (!this.navContainer) return;

    const navElement = this.navContainer.nativeElement;

    // Chercher les liens directs actifs ET les boutons avec classe router-link-active
    const activeLink = navElement.querySelector('a.router-link-active, a[aria-current="page"]');
    const activeButton = navElement.querySelector('p-button.router-link-active, .p-button.router-link-active');

    const activeElement = activeLink || activeButton;

    if (activeElement) {
      const navRect = navElement.getBoundingClientRect();
      let linkRect;

      // Si c'est un p-button, on récupère son élément button interne
      if (activeElement.tagName.toLowerCase() === 'p-button' || activeElement.classList.contains('p-button')) {
        const buttonElement = activeElement.querySelector('button') || activeElement;
        linkRect = buttonElement.getBoundingClientRect();
      } else {
        linkRect = activeElement.getBoundingClientRect();
      }

      this.activeIndicatorStyle = {
        left: `${linkRect.left - navRect.left - 32}px`, //32px car margin entre les onglets
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
      currentUrl === '/teams/league-of-legends';
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }
  
  public showMenu(): void {
    this.dynamicMenuItems$.next([
      {
        label: this.translocoService.translate('header.teams.lol'),
        command: () => {
          this.router.navigate(['/teams/lol']);
        }
      },
      {
        label: this.translocoService.translate('header.teams.tft'),
        command: () => {
          this.router.navigate(['/teams/tft']);
        }
      }
    ]);
  }

}
