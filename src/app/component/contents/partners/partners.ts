import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { PartnerCard } from '../partner-card/partner-card';
import { Partner } from '../partner-card/partner-interface';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, TranslocoModule, PartnerCard],
  templateUrl: './partners.html',
  styleUrl: './partners.scss'
})
export class Partners implements OnInit {
  private translocoService = inject(TranslocoService);

  partners: Partner[] = [];

  ngOnInit() {
    this.initializePartners();
  }

  trackByPartnerId(index: number, partner: Partner): number {
    return partner.id;
  }

  private initializePartners(): void {
    this.partners = [
      {
        id: 1,
        name: this.translocoService.translate('contents.partners.list.0.name'),
        types: [
          this.translocoService.translate('contents.partners.list.0.types.0')
        ],
        description: this.translocoService.translate('contents.partners.list.0.description'),
        images: [
          'assets/image/partners/montournoiesport.png'
        ],
        socialMedia: {
          website: 'https://www.montournoiesport.fr/',
          instagram: 'https://www.instagram.com/montournoiesport/'
        }
      },
      {
        id: 2,
        name: this.translocoService.translate('contents.partners.list.1.name'),
        types: [
          this.translocoService.translate('contents.partners.list.1.types.0')
        ],
        description: this.translocoService.translate('contents.partners.list.1.description'),
        images: [
          'assets/image/partners/station35.webp'
        ],
        socialMedia: {
          website: 'https://stationesport.fr/',
          instagram: 'https://www.instagram.com/station_esport35/'
        }
      }
    ];
  }
}
