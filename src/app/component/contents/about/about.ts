import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Member } from './member-card/member-card';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  private translocoService = inject(TranslocoService);

  /**
   * Ancienne présentation des membres du CA
   */
  get members(): Member[] {
    return [
      {
        id: 1,
        name: this.translocoService.translate('contents.about.members.0.name'),
        role: this.translocoService.translate('contents.about.members.0.role'),
        description: this.translocoService.translate('contents.about.members.0.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('contents.about.members.0.specialties') as string[]
      },
      {
        id: 2,
        name: this.translocoService.translate('contents.about.members.1.name'),
        role: this.translocoService.translate('contents.about.members.1.role'),
        description: this.translocoService.translate('contents.about.members.1.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('contents.about.members.1.specialties') as string[]
      },
      {
        id: 3,
        name: this.translocoService.translate('contents.about.members.2.name'),
        role: this.translocoService.translate('contents.about.members.2.role'),
        description: this.translocoService.translate('contents.about.members.2.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('contents.about.members.2.specialties') as string[]
      },
      {
        id: 4,
        name: this.translocoService.translate('contents.about.members.3.name'),
        role: this.translocoService.translate('contents.about.members.3.role'),
        description: this.translocoService.translate('contents.about.members.3.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('contents.about.members.3.specialties') as string[]
      },
      {
        id: 5,
        name: this.translocoService.translate('contents.about.members.4.name'),
        role: this.translocoService.translate('contents.about.members.4.role'),
        description: this.translocoService.translate('contents.about.members.4.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('contents.about.members.4.specialties') as string[]
      },
      {
        id: 6,
        name: this.translocoService.translate('contents.about.members.5.name'),
        role: this.translocoService.translate('contents.about.members.5.role'),
        description: this.translocoService.translate('contents.about.members.5.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('contents.about.members.5.specialties') as string[]
      }
    ];
  }
}
