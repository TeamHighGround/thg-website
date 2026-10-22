import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { TranslocoModule } from '@jsverse/transloco';
import { SocialLinksComponent } from '../../../../shared/social-links/social-links';
import { TeamMember } from '../../../../../core/api/models';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [TranslocoModule, SocialLinksComponent],
  templateUrl: './team-card.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
}