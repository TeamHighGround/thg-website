import { Component, inject } from '@angular/core';
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
export class Partners {
  private translocoService = inject(TranslocoService);

  get partners(): Partner[] {
    return [
      {
        id: 1,
        name: this.translocoService.translate('contents.partners.list.0.name'),
        types: [
          this.translocoService.translate('contents.partners.list.0.types.0'),
          this.translocoService.translate('contents.partners.list.0.types.1')
        ],
        description: this.translocoService.translate('contents.partners.list.0.description'),
        images: [
          'assets/image/default_avatar.jpg',
          'assets/image/default_avatar.jpg'
        ],
        socialMedia: {
          instagram: '#',
          twitter: '#',
          twitch: '#'
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
          instagram: '#',
          twitter: '#',
          spotify: '#'
        }
      }
    ];
  }
}