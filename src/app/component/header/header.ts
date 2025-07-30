import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, AfterViewInit {
  @ViewChild('navContainer', { static: false }) navContainer!: ElementRef;
  
  mobileMenuOpen = false;
  activeIndicatorStyle = { left: '0px', width: '0px' };

  constructor(private router: Router) {}

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
}