import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Member, MemberCard } from './member-card/member-card';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MemberCard, TranslocoModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  private translocoService = inject(TranslocoService);

  get members(): Member[] {
    return [
      {
        id: 1,
        name: this.translocoService.translate('about.members.alex.name'),
        role: this.translocoService.translate('about.members.alex.role'),
        description: this.translocoService.translate('about.members.alex.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('about.members.alex.specialties') as string[]
      },
      {
        id: 2,
        name: this.translocoService.translate('about.members.sarah.name'),
        role: this.translocoService.translate('about.members.sarah.role'),
        description: this.translocoService.translate('about.members.sarah.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('about.members.sarah.specialties') as string[]
      },
      {
        id: 3,
        name: this.translocoService.translate('about.members.kevin.name'),
        role: this.translocoService.translate('about.members.kevin.role'),
        description: this.translocoService.translate('about.members.kevin.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('about.members.kevin.specialties') as string[]
      },
      {
        id: 4,
        name: this.translocoService.translate('about.members.emma.name'),
        role: this.translocoService.translate('about.members.emma.role'),
        description: this.translocoService.translate('about.members.emma.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('about.members.emma.specialties') as string[]
      },
      {
        id: 5,
        name: this.translocoService.translate('about.members.lucas.name'),
        role: this.translocoService.translate('about.members.lucas.role'),
        description: this.translocoService.translate('about.members.lucas.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('about.members.lucas.specialties') as string[]
      },
      {
        id: 6,
        name: this.translocoService.translate('about.members.marie.name'),
        role: this.translocoService.translate('about.members.marie.role'),
        description: this.translocoService.translate('about.members.marie.description'),
        image: 'assets/image/default_avatar.jpg',
        specialties: this.translocoService.translate('about.members.marie.specialties') as string[]
      }
    ];
  }
}