import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PartnerCard } from './partner-card/partner-card';
import { Partner } from './partner-card/partner-interface';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, TranslocoModule, PartnerCard],
  templateUrl: './partners.html',
  styleUrl: './partners.scss'
})
export class Partners implements OnInit {
  private translocoService = inject(TranslocoService);

  // Utiliser une propriété au lieu d'un getter
  partners: Partner[] = [];

  ngOnInit() {
    // Initialiser les partners une seule fois
    this.initializePartners();
  }

  private initializePartners(): void {
    this.partners = [
      {
        id: 1,
        name: this.translocoService.translate('contents.partners.list.0.name'),
        types: [
          this.translocoService.translate('contents.partners.list.0.types.0'),
          this.translocoService.translate('contents.partners.list.0.types.1')
        ],
        description: this.translocoService.translate('contents.partners.list.0.description'),
        images: [
          'assets/image/partners/ezza/1.png',
          'assets/image/partners/ezza/2.png'
        ],
        socialMedia: {
          instagram: 'https://www.instagram.com/ezza_tv/',
          twitter: 'https://x.com/EZZA_TV_',
          twitch: 'https://www.twitch.tv/ezza_tv'
        }
      },
      {
        id: 2,
        name: this.translocoService.translate('contents.partners.list.1.name'),
        types: [
          this.translocoService.translate('contents.partners.list.1.types.0'),
          this.translocoService.translate('contents.partners.list.1.types.1')
        ],
        description: this.translocoService.translate('contents.partners.list.1.description'),
        images: [
          'assets/image/default_avatar.jpg'
        ],
        socialMedia: {
          instagram: 'https://www.instagram.com/turbobiche_/',
          soundcloud: 'on.soundcloud.com/7tB5w6vTZnjb1SZF6'
        }
      }
    ];
  }


}