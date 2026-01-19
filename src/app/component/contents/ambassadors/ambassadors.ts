import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PartnerCard } from '../partner-card/partner-card';
import { Partner } from '../partner-card/partner-interface';

@Component({
  selector: 'app-ambassadors',
  standalone: true,
  imports: [CommonModule, TranslocoModule, PartnerCard],
  templateUrl: './ambassadors.html',
  styleUrl: './ambassadors.scss'
})
export class Ambassadors implements OnInit {
  private translocoService = inject(TranslocoService);

  ambassadors: Partner[] = [];

  ngOnInit() {
    this.initializeAmbassadors();
  }

  trackByAmbassadorId(index: number, ambassador: Partner): number {
    return ambassador.id;
  }

  private initializeAmbassadors(): void {
    this.ambassadors = [
      {
        id: 1,
        name: this.translocoService.translate('contents.ambassadors.list.0.name'),
        types: [
          this.translocoService.translate('contents.ambassadors.list.0.types.0'),
          this.translocoService.translate('contents.ambassadors.list.0.types.1')
        ],
        description: this.translocoService.translate('contents.ambassadors.list.0.description'),
        images: [
          'assets/image/ambassadors/ezza/1.png',
          'assets/image/ambassadors/ezza/2.png'
        ],
        socialMedia: {
          instagram: 'https://www.instagram.com/ezza_tv/',
          twitter: 'https://x.com/EZZA_TV_',
          twitch: 'https://www.twitch.tv/ezza_tv'
        }
      },
      {
        id: 2,
        name: this.translocoService.translate('contents.ambassadors.list.1.name'),
        types: [
          this.translocoService.translate('contents.ambassadors.list.1.types.0'),
          this.translocoService.translate('contents.ambassadors.list.1.types.1')
        ],
        description: this.translocoService.translate('contents.ambassadors.list.1.description'),
        images: [
          'assets/image/ambassadors/toskaan/1.jpg',
          'assets/image/ambassadors/toskaan/2.jpg'
        ],
        socialMedia: {
          twitter: 'https://x.com/toskaan13',
          instagram: 'https://www.instagram.com/kevin_deroche/',
          twitch: 'https://www.twitch.tv/toskaan'
        }
      },
      {
        id: 3,
        name: this.translocoService.translate('contents.ambassadors.list.2.name'),
        types: [
          this.translocoService.translate('contents.ambassadors.list.2.types.0'),
          this.translocoService.translate('contents.ambassadors.list.2.types.1')
        ],
        description: this.translocoService.translate('contents.ambassadors.list.2.description'),
        images: [
          'assets/image/ambassadors/biche/1.jpg',
          'assets/image/ambassadors/biche/2.jpg'
        ],
        socialMedia: {
          instagram: 'https://www.instagram.com/turbobiche_/',
          soundcloud: 'https://on.soundcloud.com/7tB5w6vTZnjb1SZF6'
        }
      }
    ];
  }
}
