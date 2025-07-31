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

  public dynamicMenuItems$: BehaviorSubject<MenuItem[]> = new BehaviorSubject(
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
    const activeLink = navElement.querySelector('a.router-link-active, a[aria-current="page"]');

    if (activeLink) {
      const navRect = navElement.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      this.activeIndicatorStyle = {
        left: `${linkRect.left - navRect.left - 32}px`, //32px car 32px de margin entre les onglets
        width: `${linkRect.width}px`
      };
    } else {
      // Si aucun lien actif n'est trouvé, on cache l'indicateur
      this.activeIndicatorStyle = {
        left: '0px',
        width: '0px'
      };
    }
  }

  isActiveRoute(routerLink: string): boolean {
    return this.router.url === routerLink ||
      (routerLink === '/' && this.router.url === '/') ||
      (routerLink !== '/' && this.router.url.startsWith(routerLink));
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