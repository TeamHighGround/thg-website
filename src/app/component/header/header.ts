import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [TranslocoModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  mobileMenuOpen = false;
  menuItems: MenuItem[] = [];
  ngOnInit() {
    this.menuItems = [
      {
        label: 'header.home',
        icon: 'pi pi-home',
        routerLink: ['/']
      },
      {
        label: 'header.about',
        icon: 'pi pi-users',
        routerLink: ['/about']
      },
      {
        label: 'header.teams',
        icon: 'pi pi-sitemap',
        items: [
          {
            label: 'header.teams.lol',
            icon: 'pi pi-star',
            routerLink: ['/teams/league-of-legends']
          }
        ]
      },
      {
        label: 'header.news',
        icon: 'pi pi-newspaper',
        routerLink: ['/news']
      },
      {
        label: 'header.partners',
        icon: 'pi pi-handshake',
        routerLink: ['/partners']
      },
      {
        label: 'header.contact',
        icon: 'pi pi-envelope',
        routerLink: ['/contact']
      }
    ];
  }
}
