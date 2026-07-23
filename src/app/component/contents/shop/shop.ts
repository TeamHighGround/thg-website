import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './shop.html',
  styleUrl: './shop.scss'
})
export class ShopComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  isBrowser = false;
  widgetUrl!: SafeResourceUrl;

  /** Passer à true pour rouvrir la boutique (widget HelloAsso). */
  shopOpen = false;

  private readonly HELLOASSO_URL = 'https://www.helloasso.com/associations/team-high-ground/boutiques/merch-thg-2026/widget';

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.widgetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.HELLOASSO_URL);
  }
}
