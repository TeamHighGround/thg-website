import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ChipModule } from 'primeng/chip';
import { SocialLinks } from '../../../../shared/social-links/social-links.interface';
import { SocialLinksComponent } from '../../../../shared/social-links/social-links';

export interface TeamMember {
  name: string;
  role: string;
  socialLinks?: SocialLinks;
}

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule, TranslocoModule, ChipModule, SocialLinksComponent],
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss'
})
export class TeamCard {
  @Input() member!: TeamMember;
  @Input() type: 'player' | 'staff' = 'player';
  @Input() getRoleIcon!: (role: string) => string;

  isImageIcon(): boolean {
    const icon = this.getRoleIcon(this.member.role);
    return icon.includes('.svg') || icon.includes('.png') || icon.includes('.jpg');
  }

  getChipClass(): string {
    const baseClass = this.type === 'player' ? 'role-chip role-' : 'staff-chip staff-';
    return baseClass + this.member.role.toLowerCase().replace(' ', '-');
  }
}